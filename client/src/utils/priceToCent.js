export function moneyToCents(value) {
  if (value == null || value === "") return "0";

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new Error("Invalid money amount");
  }

  return String(Math.round(amount * 100));
}
