import { prisma } from "../../../prisma/client.js";
import { ApiError } from "../../../utils/apiError.js";
import { Decimal, toDecimal } from "../../../utils/decimal.js";
import { generatePosOrderNumber } from "./posOrderNumbers.js";
import { processPosOrderConsumption } from "./processPosOrderConsumption.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return { hotelId, OR: [{ branchId }, { branchId: null }] };
  }
  return { hotelId };
}

function assertInt(n, code, msg) {
  if (!Number.isInteger(n)) throw new ApiError(400, code, msg);
  return n;
}

function roundMoneyCents(dec) {
  // Prisma Decimal doesn't have a stable rounding API across versions.
  // Store cents as Decimal but ensure it's an integer-like value.
  return new Decimal(new Decimal(dec ?? 0).toFixed(0));
}

function calcTaxCents(subtotalCents) {
  return roundMoneyCents(toDecimal(subtotalCents).mul(new Decimal(0.09)));
}

function calcServiceChargeCents(subtotalCents) {
  // ETB 5.00 fixed service charge when order has items.
  return toDecimal(subtotalCents).gt(0) ? new Decimal(500) : new Decimal(0);
}

async function loadRecipesMap({ tx, hotelId, branchId, recipeIds }) {
  const rows = await tx.recipe.findMany({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      id: { in: recipeIds },
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      sellingPriceCents: true,
      status: true,
    },
  });

  const map = new Map();
  for (const r of rows) map.set(r.id, r);
  return map;
}

function normalizeItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(
      400,
      "INVALID_ITEMS",
      "Order must contain at least 1 item",
    );
  }

  return items.map((it) => {
    if (!it?.recipeId) {
      throw new ApiError(400, "INVALID_ITEMS", "Missing recipeId");
    }
    const qty = toDecimal(it.quantity ?? 0);
    if (qty.lte(0)) {
      throw new ApiError(400, "INVALID_QUANTITY", "Item quantity must be > 0");
    }

    return {
      recipeId: String(it.recipeId),
      quantity: qty,
      notes: typeof it.notes === "string" ? it.notes : null,
    };
  });
}

export async function createDraftPosOrder({
  tx,
  hotelId,
  branchId,
  userId,
  input,
}) {
  // If a transaction client is provided (internal calls), reuse it.
  // Otherwise create a transaction (external API calls).
  const run = async (tx) => {
    const tableNumber = assertInt(
      Number(input.tableNumber),
      "INVALID_TABLE",
      "Invalid tableNumber",
    );

    const waiterName = String(input.waiterName ?? "").trim();
    if (!waiterName) {
      throw new ApiError(400, "INVALID_WAITER", "waiterName is required");
    }

    const customerCountRaw = Number(input.customerCount ?? 1);
    const customerCount = assertInt(
      customerCountRaw,
      "INVALID_CUSTOMER_COUNT",
      "Invalid customerCount",
    );
    if (customerCount <= 0) {
      throw new ApiError(
        400,
        "INVALID_CUSTOMER_COUNT",
        "customerCount must be > 0",
      );
    }

    const items = normalizeItems(input.items);
    const recipeIds = Array.from(new Set(items.map((i) => i.recipeId)));
    const recipesMap = await loadRecipesMap({
      tx,
      hotelId,
      branchId,
      recipeIds,
    });

    for (const it of items) {
      if (!recipesMap.has(it.recipeId)) {
        throw new ApiError(
          400,
          "RECIPE_NOT_FOUND",
          `Recipe not found or inactive: ${it.recipeId}`,
        );
      }
    }

    const orderNumber = await generatePosOrderNumber({ tx, hotelId });

    // Derive pricing from recipes for integrity.
    let subtotalCents = new Decimal(0);
    const itemCreates = [];

    for (const it of items) {
      const recipe = recipesMap.get(it.recipeId);
      const unitPriceCents = toDecimal(recipe.sellingPriceCents ?? 0);
      const totalPriceCents = unitPriceCents.mul(toDecimal(it.quantity));
      subtotalCents = subtotalCents.add(totalPriceCents);

      itemCreates.push({
        recipeId: it.recipeId,
        quantity: it.quantity,
        unitPriceCents,
        totalPriceCents,
        notes: it.notes,
      });
    }

    const taxCents = calcTaxCents(subtotalCents);
    const serviceChargeCents = calcServiceChargeCents(subtotalCents);
    const totalCents = subtotalCents.add(taxCents).add(serviceChargeCents);

    const order = await tx.posOrder.create({
      data: {
        hotelId,
        branchId: branchId ?? null,
        orderNumber,
        tableNumber,
        waiterName,
        customerCount,
        status: "DRAFT",
        notes: typeof input.notes === "string" ? input.notes : null,
        subtotalCents,
        taxCents,
        serviceChargeCents,
        totalCents,
        items: {
          create: itemCreates,
        },
      },
      include: {
        items: {
          include: { recipe: { select: { id: true, name: true } } },
        },
      },
    });

    return order;
  };

  // NOTE: We intentionally avoid nested $transaction when tx is already present.
  if (tx) return run(tx);
  return prisma.$transaction(run);
}

export async function createAndSendPosOrder({
  hotelId,
  branchId,
  userId,
  input,
}) {
  return prisma.$transaction(async (tx) => {
    const draft = await createDraftPosOrder({
      tx,
      hotelId,
      branchId,
      userId,
      input,
    });

    const updated = await tx.posOrder.update({
      where: { id: draft.id },
      data: {
        status: "SENT_TO_KITCHEN",
        sentToKitchenAt: new Date(),
      },
      include: {
        items: { include: { recipe: { select: { id: true, name: true } } } },
      },
    });

    const consumption = await processPosOrderConsumption({
      tx,
      hotelId,
      branchId,
      userId,
      orderId: updated.id,
      mode: "consume",
    });

    return { order: updated, consumption };
  });
}

export async function updatePosOrderStatus({
  hotelId,
  branchId,
  userId,
  orderId,
  status,
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.posOrder.findFirst({
      where: {
        id: orderId,
        ...withBranchScope({ hotelId, branchId }),
      },
      include: { items: true },
    });

    if (!order) {
      throw new ApiError(404, "POS_ORDER_NOT_FOUND", "POS order not found");
    }

    if (order.status === "CANCELLED") {
      throw new ApiError(
        400,
        "INVALID_STATUS",
        "Cancelled orders cannot be updated",
      );
    }

    // Enforce basic flow constraints.
    if (status === "SENT_TO_KITCHEN" && order.status !== "DRAFT") {
      throw new ApiError(
        400,
        "INVALID_STATUS",
        "Only draft orders can be sent to kitchen",
      );
    }

    if (status === "COMPLETED" && order.status === "DRAFT") {
      throw new ApiError(
        400,
        "INVALID_STATUS",
        "Draft orders cannot be completed",
      );
    }

    const next = await tx.posOrder.update({
      where: { id: order.id },
      data: {
        status,
        ...(status === "SENT_TO_KITCHEN"
          ? { sentToKitchenAt: new Date() }
          : {}),
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
      include: {
        items: { include: { recipe: { select: { id: true, name: true } } } },
      },
    });

    if (status === "SENT_TO_KITCHEN") {
      await processPosOrderConsumption({
        tx,
        hotelId,
        branchId,
        userId,
        orderId: next.id,
        mode: "consume",
      });
    }

    if (status === "CANCELLED") {
      // If inventory was consumed earlier, revert it.
      await processPosOrderConsumption({
        tx,
        hotelId,
        branchId,
        userId,
        orderId: next.id,
        mode: "revert",
      });
    }

    if (status === "COMPLETED") {
      // Ensure consumption exists at least up to current items.
      await processPosOrderConsumption({
        tx,
        hotelId,
        branchId,
        userId,
        orderId: next.id,
        mode: "consume",
      });

      // Ingest into existing SalesOrder pipeline to power dashboards.
      const salesOrder = await tx.salesOrder.create({
        data: {
          hotelId,
          branchId: branchId ?? null,
          status: "COMPLETED",
          orderedAt: new Date(),
          totalRevenueCents: toDecimal(next.subtotalCents ?? 0),
          metadata: {
            source: "POS",
            posOrderId: next.id,
            posOrderNumber: next.orderNumber,
            tableNumber: next.tableNumber,
            waiterName: next.waiterName,
            customerCount: next.customerCount,
          },
          items: {
            create: next.items.map((it) => ({
              recipeId: it.recipeId,
              quantity: it.quantity,
              unitPriceCents: it.unitPriceCents,
              totalRevenueCents: it.totalPriceCents,
            })),
          },
        },
      });

      return { order: next, salesOrderId: salesOrder.id };
    }

    return { order: next };
  });
}

export async function updatePosOrder({
  hotelId,
  branchId,
  userId,
  orderId,
  input,
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.posOrder.findFirst({
      where: { id: orderId, ...withBranchScope({ hotelId, branchId }) },
      include: { items: true },
    });

    if (!order) {
      throw new ApiError(404, "POS_ORDER_NOT_FOUND", "POS order not found");
    }

    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      throw new ApiError(
        400,
        "ORDER_LOCKED",
        "Completed/cancelled orders cannot be edited",
      );
    }

    const waiterName = String(
      input.waiterName ?? order.waiterName ?? "",
    ).trim();
    if (!waiterName)
      throw new ApiError(400, "INVALID_WAITER", "waiterName is required");

    const customerCountRaw = Number(
      input.customerCount ?? order.customerCount ?? 1,
    );
    if (!Number.isInteger(customerCountRaw) || customerCountRaw <= 0) {
      throw new ApiError(
        400,
        "INVALID_CUSTOMER_COUNT",
        "customerCount must be a positive integer",
      );
    }

    const items = normalizeItems(input.items);
    const recipeIds = Array.from(new Set(items.map((i) => i.recipeId)));
    const recipesMap = await loadRecipesMap({
      tx,
      hotelId,
      branchId,
      recipeIds,
    });

    for (const it of items) {
      if (!recipesMap.has(it.recipeId)) {
        throw new ApiError(
          400,
          "RECIPE_NOT_FOUND",
          `Recipe not found or inactive: ${it.recipeId}`,
        );
      }
    }

    let subtotalCents = new Decimal(0);
    const itemCreates = [];

    for (const it of items) {
      const recipe = recipesMap.get(it.recipeId);
      const unitPriceCents = toDecimal(recipe.sellingPriceCents ?? 0);
      const totalPriceCents = unitPriceCents.mul(toDecimal(it.quantity));
      subtotalCents = subtotalCents.add(totalPriceCents);

      itemCreates.push({
        recipeId: it.recipeId,
        quantity: it.quantity,
        unitPriceCents,
        totalPriceCents,
        notes: it.notes,
      });
    }

    const taxCents = calcTaxCents(subtotalCents);
    const serviceChargeCents = calcServiceChargeCents(subtotalCents);
    const totalCents = subtotalCents.add(taxCents).add(serviceChargeCents);

    const updatedOrder = await tx.posOrder.update({
      where: { id: order.id },
      data: {
        waiterName,
        customerCount: customerCountRaw,
        notes: typeof input.notes === "string" ? input.notes : order.notes,
        subtotalCents,
        taxCents,
        serviceChargeCents,
        totalCents,
        items: {
          deleteMany: {},
          create: itemCreates,
        },
      },
      include: {
        items: { include: { recipe: { select: { id: true, name: true } } } },
      },
    });

    let consumption = null;
    if (updatedOrder.status !== "DRAFT") {
      consumption = await processPosOrderConsumption({
        tx,
        hotelId,
        branchId,
        userId,
        orderId: updatedOrder.id,
        mode: "recalculate",
      });
    }

    return { order: updatedOrder, consumption };
  });
}

export async function listKitchenQueue({ hotelId, branchId, query }) {
  const statuses =
    query?.status && typeof query.status === "string"
      ? [query.status]
      : ["SENT_TO_KITCHEN", "PREPARING", "READY", "SERVED"];

  return prisma.posOrder.findMany({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      status: { in: statuses },
    },
    include: {
      items: {
        include: {
          recipe: { select: { id: true, name: true, imageUrl: true } },
        },
      },
    },
    orderBy: [{ sentToKitchenAt: "asc" }, { createdAt: "asc" }],
    take: Number(query?.limit ?? 100),
  });
}

export async function listPosOrders({ hotelId, branchId, query }) {
  const page = Math.max(1, Number(query?.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(query?.limit ?? 20)));
  const skip = (page - 1) * limit;

  const where = {
    ...withBranchScope({ hotelId, branchId }),
    ...(query?.status ? { status: query.status } : {}),
    ...(query?.from || query?.to
      ? {
          createdAt: {
            ...(query?.from ? { gte: new Date(query.from) } : {}),
            ...(query?.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.posOrder.findMany({
      where,
      include: {
        items: { include: { recipe: { select: { id: true, name: true } } } },
      },
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.posOrder.count({ where }),
  ]);

  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    rows,
  };
}

export async function getPosOrderById({ hotelId, branchId, id }) {
  const order = await prisma.posOrder.findFirst({
    where: { id, ...withBranchScope({ hotelId, branchId }) },
    include: {
      items: { include: { recipe: { select: { id: true, name: true } } } },
    },
  });

  if (!order) {
    throw new ApiError(404, "POS_ORDER_NOT_FOUND", "POS order not found");
  }

  const cogsAgg = await prisma.inventoryConsumption.aggregate({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      sourceType: "ORDER",
      posOrderId: order.id,
    },
    _sum: { totalCostCents: true },
  });

  const ingredientCostCents = toDecimal(cogsAgg?._sum?.totalCostCents ?? 0);
  const revenueCents = toDecimal(order.subtotalCents ?? 0);

  return {
    order,
    totals: {
      revenueCents,
      ingredientCostCents,
      grossProfitCents: revenueCents.sub(ingredientCostCents),
    },
  };
}

export async function listPosTables({ hotelId, branchId }) {
  // Active (non-final) orders per table.
  const active = await prisma.posOrder.findMany({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      status: {
        in: ["DRAFT", "SENT_TO_KITCHEN", "PREPARING", "READY", "SERVED"],
      },
    },
    select: {
      id: true,
      tableNumber: true,
      waiterName: true,
      customerCount: true,
      status: true,
      totalCents: true,
      createdAt: true,
      sentToKitchenAt: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const byTable = new Map();
  for (const o of active) {
    if (!byTable.has(o.tableNumber)) byTable.set(o.tableNumber, o);
  }

  return Array.from(byTable.entries()).map(([tableNumber, order]) => ({
    tableNumber,
    order,
  }));
}

export async function getPosTodayAnalytics({ hotelId, branchId }) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const whereOrder = {
    ...withBranchScope({ hotelId, branchId }),
    status: "COMPLETED",
    completedAt: { gte: start, lte: end },
  };

  const [ordersAgg, cogsAgg] = await Promise.all([
    prisma.posOrder.aggregate({
      where: whereOrder,
      _sum: { subtotalCents: true, totalCents: true },
      _count: { id: true },
    }),
    prisma.inventoryConsumption.aggregate({
      where: {
        ...withBranchScope({ hotelId, branchId }),
        sourceType: "ORDER",
        createdAt: { gte: start, lte: end },
      },
      _sum: { totalCostCents: true },
    }),
  ]);

  const revenueCents = toDecimal(ordersAgg?._sum?.subtotalCents ?? 0);
  const ingredientCostCents = toDecimal(cogsAgg?._sum?.totalCostCents ?? 0);

  return {
    range: { from: start, to: end },
    ordersCount: ordersAgg?._count?.id ?? 0,
    revenueCents,
    ingredientCostCents,
    grossProfitCents: revenueCents.sub(ingredientCostCents),
  };
}
