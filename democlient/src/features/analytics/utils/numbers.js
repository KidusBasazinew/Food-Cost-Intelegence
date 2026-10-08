export function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(cents, currency = "ETB") {
  const v = toNumber(cents) / 100;
  return v.toLocaleString(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  });
}

export function formatPct(value) {
  const v = toNumber(value);
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}
