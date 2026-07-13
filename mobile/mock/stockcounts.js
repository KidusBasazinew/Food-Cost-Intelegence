import { inventoryItems } from "./inventoryItems";

function iconUrlFor(name) {
  const formatted = name.trim().replace(/\s+/g, "%20");
  return `https://www.themealdb.com/images/ingredients/${formatted}.png`;
}

export const activeStockCount = {
  id: "sc1",
  hotelId: "h1",
  branchId: "b1",
  status: "DRAFT",
  countedBy: null,
  notes: null,
  countedAt: null,
  createdAt: new Date().toISOString(),
  items: inventoryItems.map((item, i) => ({
    id: `sci${i + 1}`,
    stockCountId: "sc1",
    inventoryItemId: item.id,
    name: item.name,
    unit: item.unit,
    iconUrl: iconUrlFor(item.name),
    systemQuantity: item.quantityInStock,
    physicalQuantity: null,
    varianceQuantity: null,
    variancePercentage: null,
  })),
};
