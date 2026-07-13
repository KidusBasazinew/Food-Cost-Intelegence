import { recipes } from "./recipes";

const now = Date.now();
const minutesAgo = (m) => new Date(now - m * 60000).toISOString();

export const posOrders = [
  {
    id: "o1",
    orderNumber: "ORD-1042",
    tableNumber: 4,
    waiterName: "Meron",
    customerCount: 2,
    status: "SENT_TO_KITCHEN",
    notes: "No onions",
    sentToKitchenAt: minutesAgo(2),
    completedAt: null,
    items: [
      {
        id: "i1",
        recipeId: "r1",
        quantity: 2,
        unitPriceCents: 45000,
        totalPriceCents: 90000,
      },
      {
        id: "i2",
        recipeId: "r6",
        quantity: 2,
        unitPriceCents: 12000,
        totalPriceCents: 24000,
      },
    ],
  },
  {
    id: "o2",
    orderNumber: "ORD-1041",
    tableNumber: 7,
    waiterName: "Abel",
    customerCount: 4,
    status: "PREPARING",
    notes: null,
    sentToKitchenAt: minutesAgo(1),
    completedAt: null,
    items: [
      {
        id: "i3",
        recipeId: "r2",
        quantity: 3,
        unitPriceCents: 38000,
        totalPriceCents: 114000,
      },
      {
        id: "i4",
        recipeId: "r4",
        quantity: 1,
        unitPriceCents: 22000,
        totalPriceCents: 22000,
      },
    ],
  },
  {
    id: "o3",
    orderNumber: "ORD-1040",
    tableNumber: 2,
    waiterName: "Selam",
    customerCount: 1,
    status: "SENT_TO_KITCHEN",
    notes: "Extra spicy",
    sentToKitchenAt: minutesAgo(14),
    completedAt: null,
    items: [
      {
        id: "i5",
        recipeId: "r3",
        quantity: 1,
        unitPriceCents: 25000,
        totalPriceCents: 25000,
      },
    ],
  },
  {
    id: "o4",
    orderNumber: "ORD-1039",
    tableNumber: 9,
    waiterName: "Dawit",
    customerCount: 3,
    status: "READY",
    notes: null,
    sentToKitchenAt: minutesAgo(21),
    completedAt: null,
    items: [
      {
        id: "i6",
        recipeId: "r7",
        quantity: 2,
        unitPriceCents: 52000,
        totalPriceCents: 104000,
      },
      {
        id: "i7",
        recipeId: "r5",
        quantity: 1,
        unitPriceCents: 28000,
        totalPriceCents: 28000,
      },
    ],
  },
  {
    id: "o5",
    orderNumber: "ORD-1038",
    tableNumber: 1,
    waiterName: "Meron",
    customerCount: 2,
    status: "COMPLETED",
    notes: null,
    sentToKitchenAt: minutesAgo(50),
    completedAt: minutesAgo(30),
    items: [
      {
        id: "i8",
        recipeId: "r1",
        quantity: 1,
        unitPriceCents: 45000,
        totalPriceCents: 45000,
      },
    ],
  },
  {
    id: "o6",
    orderNumber: "ORD-1037",
    tableNumber: 5,
    waiterName: "Abel",
    customerCount: 2,
    status: "COMPLETED",
    notes: null,
    sentToKitchenAt: minutesAgo(75),
    completedAt: minutesAgo(60),
    items: [
      {
        id: "i9",
        recipeId: "r2",
        quantity: 2,
        unitPriceCents: 38000,
        totalPriceCents: 76000,
      },
    ],
  },
];

export function recipeById(id) {
  return recipes.find((r) => r.id === id);
}
