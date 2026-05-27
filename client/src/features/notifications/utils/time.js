export function timeAgo(input) {
  const date = input instanceof Date ? input : new Date(input);
  const ms = date.getTime();
  if (Number.isNaN(ms)) return "";

  const diff = ms - Date.now();
  const abs = Math.abs(diff);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const units = [
    { unit: "second", ms: 1000 },
    { unit: "minute", ms: 60 * 1000 },
    { unit: "hour", ms: 60 * 60 * 1000 },
    { unit: "day", ms: 24 * 60 * 60 * 1000 },
    { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
    { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  ];

  for (let i = units.length - 1; i >= 0; i -= 1) {
    const u = units[i];
    if (abs >= u.ms || i === 0) {
      const value = Math.round(diff / u.ms);
      return rtf.format(value, u.unit);
    }
  }

  return "";
}

export function computeSince(range) {
  const now = Date.now();
  const map = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  const delta = map[range] ?? map["7d"];
  return new Date(now - delta).toISOString();
}
