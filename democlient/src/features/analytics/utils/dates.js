export function isoStartOfDay(dateStr) {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return d.toISOString();
}

export function isoEndOfDay(dateStr) {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T23:59:59.999Z`);
  return d.toISOString();
}

export function todayISODate() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function daysAgoISODate(days) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
