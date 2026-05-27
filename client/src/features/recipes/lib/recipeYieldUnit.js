export const RECIPE_YIELD_UNITS = [
  { value: "PORTION", label: "Portion", pluralLabel: "Portions" },
  { value: "PLATE", label: "Plate", pluralLabel: "Plates" },
  { value: "BOWL", label: "Bowl", pluralLabel: "Bowls" },
  { value: "CUP", label: "Cup", pluralLabel: "Cups" },
  { value: "PIECE", label: "Piece", pluralLabel: "Pieces" },
  { value: "TRAY", label: "Tray", pluralLabel: "Trays" },
  { value: "BOTTLE", label: "Bottle", pluralLabel: "Bottles" },
  { value: "BATCH", label: "Batch", pluralLabel: "Batches" },
  { value: "LITER", label: "Liter", pluralLabel: "Liters" },
  { value: "KILOGRAM", label: "Kilogram", pluralLabel: "Kilograms" },
];

const UNIT_BY_VALUE = new Map(RECIPE_YIELD_UNITS.map((u) => [u.value, u]));

export function getRecipeYieldUnitLabel(value, quantity = 1) {
  const unit = UNIT_BY_VALUE.get(value);
  if (!unit) return value || "";

  const q = Number(quantity);
  const isSingular = Number.isFinite(q) ? q === 1 : false;
  return isSingular ? unit.label : unit.pluralLabel;
}

export function formatRecipeYield({ yieldQuantity, yieldUnit }) {
  const q = yieldQuantity == null ? 0 : Number(yieldQuantity);
  const qty = Number.isFinite(q) ? q : 0;
  const label = getRecipeYieldUnitLabel(yieldUnit, qty);

  return `${qty} ${label}`.trim();
}
