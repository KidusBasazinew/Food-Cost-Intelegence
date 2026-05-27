import { Prisma } from "@prisma/client";

import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";
import { checkLowStock } from "../lib/inventoryEngine.js";
import { createNotificationIfNotExists } from "./notification.service.js";

const Decimal = Prisma.Decimal;

function pickClient(tx) {
  return tx ?? prisma;
}

function toDecimal(value) {
  if (value instanceof Decimal) return value;
  if (typeof value === "number") return new Decimal(value);
  if (typeof value === "string") return new Decimal(value);
  if (typeof value === "bigint") return new Decimal(value.toString());
  return new Decimal(0);
}

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

async function listUsersByRoles({ tx, hotelId, branchId, roles }) {
  const client = pickClient(tx);

  return client.user.findMany({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      status: "ACTIVE",
      role: { in: roles },
    },
    select: { id: true, role: true },
  });
}

async function notifyRoles({
  tx,
  hotelId,
  branchId,
  roles,
  notification,
  dedupeByActionUrl,
}) {
  const users = await listUsersByRoles({ tx, hotelId, branchId, roles });

  const actionUrl = dedupeByActionUrl ?? notification?.actionUrl ?? null;

  const created = [];
  for (const u of users) {
    const n = await createNotificationIfNotExists({
      tx,
      dedupeKey: actionUrl,
      data: {
        hotelId,
        branchId: branchId ?? null,
        userId: u.id,
        ...notification,
        actionUrl,
      },
    });
    if (n) created.push(n);
  }

  return created;
}

export async function notifyInventoryStockChange({
  tx,
  hotelId,
  branchId,
  inventoryItem,
}) {
  if (!inventoryItem) return { created: 0 };

  const qty = toDecimal(inventoryItem.quantityInStock);
  const min = toDecimal(inventoryItem.minimumStockLevel);
  const actionUrl = `/inventory/items/${inventoryItem.id}`;

  if (qty.lte(0)) {
    const created = await notifyRoles({
      tx,
      hotelId,
      branchId,
      roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      dedupeByActionUrl: actionUrl,
      notification: {
        type: "OUT_OF_STOCK",
        severity: "CRITICAL",
        title: `Out of stock: ${inventoryItem.name}`,
        message: `Inventory item has reached 0 ${inventoryItem.baseUnit?.symbol || ""}. Restock required.`,
        actionUrl,
        metadata: {
          inventoryItemId: inventoryItem.id,
          quantityInStock: String(inventoryItem.quantityInStock),
          minimumStockLevel: String(inventoryItem.minimumStockLevel),
        },
      },
    });

    return { created: created.length };
  }

  if (checkLowStock({ quantityInStock: qty, minimumStockLevel: min })) {
    const created = await notifyRoles({
      tx,
      hotelId,
      branchId,
      roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      dedupeByActionUrl: actionUrl,
      notification: {
        type: "LOW_STOCK",
        severity: "HIGH",
        title: `Low stock: ${inventoryItem.name}`,
        message: `Stock is ${qty.toString()} ${inventoryItem.baseUnit?.symbol || ""} (min ${min.toString()}).`,
        actionUrl,
        metadata: {
          inventoryItemId: inventoryItem.id,
          quantityInStock: String(inventoryItem.quantityInStock),
          minimumStockLevel: String(inventoryItem.minimumStockLevel),
        },
      },
    });

    return { created: created.length };
  }

  return { created: 0 };
}

export async function notifyHighValueWaste({
  tx,
  hotelId,
  branchId,
  inventoryItem,
  wasteRow,
  totalCostCents,
}) {
  const total = toDecimal(totalCostCents);
  const actionUrl = `/waste`;

  const created = [];

  if (total.gte(new Decimal(env.WASTE_HIGH_VALUE_THRESHOLD_CENTS))) {
    const result = await notifyRoles({
      tx,
      hotelId,
      branchId,
      roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      dedupeByActionUrl: `${actionUrl}?wasteId=${wasteRow?.id || ""}`,
      notification: {
        type: "WASTE_ALERT",
        severity: "HIGH",
        title: `High-value waste recorded`,
        message: inventoryItem
          ? `${inventoryItem.name} waste cost: ${total.toString()} cents.`
          : `Waste cost: ${total.toString()} cents.`,
        actionUrl,
        metadata: {
          wasteId: wasteRow?.id ?? null,
          inventoryItemId: inventoryItem?.id ?? null,
          totalCostCents: total.toString(),
        },
      },
    });
    created.push(...result);
  }

  // Repeated pattern: count waste logs for item in last 7 days.
  if (inventoryItem?.id) {
    const client = pickClient(tx);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [count, sum] = await Promise.all([
      client.inventoryConsumption.count({
        where: {
          hotelId,
          ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
          sourceType: "MANUAL_WASTE",
          inventoryItemId: inventoryItem.id,
          createdAt: { gte: since },
        },
      }),
      client.inventoryConsumption.aggregate({
        where: {
          hotelId,
          ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
          sourceType: "MANUAL_WASTE",
          inventoryItemId: inventoryItem.id,
          createdAt: { gte: since },
        },
        _sum: { totalCostCents: true },
      }),
    ]);

    const weeklyCost = toDecimal(sum?._sum?.totalCostCents ?? 0);

    if (count >= env.WASTE_REPEAT_COUNT_THRESHOLD) {
      const r = await notifyRoles({
        tx,
        hotelId,
        branchId,
        roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
        dedupeByActionUrl: `${actionUrl}?itemId=${inventoryItem.id}&repeat=7d`,
        notification: {
          type: "WASTE_ALERT",
          severity: "WARNING",
          title: `Repeated waste: ${inventoryItem.name}`,
          message: `${count} waste logs in the last 7 days.`,
          actionUrl,
          metadata: {
            inventoryItemId: inventoryItem.id,
            countLast7d: count,
          },
        },
      });
      created.push(...r);
    }

    if (weeklyCost.gte(new Decimal(env.WASTE_WEEKLY_COST_THRESHOLD_CENTS))) {
      const r = await notifyRoles({
        tx,
        hotelId,
        branchId,
        roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
        dedupeByActionUrl: `${actionUrl}?itemId=${inventoryItem.id}&weeklyCost=7d`,
        notification: {
          type: "WASTE_ALERT",
          severity: "HIGH",
          title: `High weekly waste cost: ${inventoryItem.name}`,
          message: `Waste cost in last 7 days: ${weeklyCost.toString()} cents.`,
          actionUrl,
          metadata: {
            inventoryItemId: inventoryItem.id,
            weeklyCostCents: weeklyCost.toString(),
          },
        },
      });
      created.push(...r);
    }
  }

  return { created: created.length };
}

export async function notifyPurchaseEvent({
  tx,
  hotelId,
  branchId,
  purchase,
  event,
  previousStatus,
}) {
  if (!purchase) return { created: 0 };

  const actionUrl = `/purchases`;
  const title =
    event === "CREATED"
      ? `Purchase order created`
      : event === "RECEIVED"
        ? `Purchase received`
        : `Purchase status updated`;

  const message =
    event === "CREATED"
      ? `Purchase created for supplier: ${purchase.supplier?.name || ""}.`
      : event === "RECEIVED"
        ? `Purchase marked as received.`
        : `Status changed ${previousStatus || ""} → ${purchase.status}.`;

  const created = await notifyRoles({
    tx,
    hotelId,
    branchId,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    dedupeByActionUrl: `${actionUrl}?purchaseId=${purchase.id}&event=${event}`,
    notification: {
      type:
        event === "CREATED" ? "PURCHASE_CREATED" : "PURCHASE_STATUS_CHANGED",
      severity: event === "RECEIVED" ? "SUCCESS" : "INFO",
      title,
      message,
      actionUrl,
      metadata: {
        purchaseId: purchase.id,
        supplierId: purchase.supplierId,
        status: purchase.status,
        previousStatus: previousStatus ?? null,
        totalCents: purchase.totalCents ? String(purchase.totalCents) : null,
      },
    },
  });

  return { created: created.length };
}

export async function notifyRecipeFoodCostAlert({
  tx,
  hotelId,
  branchId,
  recipe,
  metrics,
}) {
  if (!recipe || !metrics) return { created: 0 };

  const threshold = Number(env.FOOD_COST_ALERT_THRESHOLD_PERCENT);
  const foodCostPct = Number(metrics.foodCostPercentage ?? 0);

  if (!Number.isFinite(foodCostPct) || foodCostPct <= threshold) {
    return { created: 0 };
  }

  const actionUrl = `/recipes/${recipe.id}`;

  const created = await notifyRoles({
    tx,
    hotelId,
    branchId,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    dedupeByActionUrl: `${actionUrl}?foodCostAlert=1`,
    notification: {
      type: "PROFITABILITY_ALERT",
      severity: "HIGH",
      title: `Food cost alert: ${recipe.name}`,
      message: `Food cost is ${foodCostPct.toFixed(1)}% (threshold ${threshold}%).`,
      actionUrl,
      metadata: {
        recipeId: recipe.id,
        foodCostPercentage: foodCostPct,
        threshold,
      },
    },
  });

  return { created: created.length };
}
