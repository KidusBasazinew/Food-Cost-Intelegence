function escapeCsv(value) {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return "";

  const headers = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r || {}).forEach((k) => acc.add(k));
      return acc;
    }, new Set()),
  );

  const lines = [];
  lines.push(headers.map(escapeCsv).join(","));
  for (const r of rows) {
    lines.push(headers.map((h) => escapeCsv(r?.[h])).join(","));
  }
  return lines.join("\n");
}
