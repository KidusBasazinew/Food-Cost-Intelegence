import ExcelJS from "exceljs";

export async function toXlsxBuffer({ sheetName = "Report", rows = [] }) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(sheetName);

  if (!rows.length) {
    ws.addRow(["No data"]);
    return workbook.xlsx.writeBuffer();
  }

  const headers = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r || {}).forEach((k) => acc.add(k));
      return acc;
    }, new Set()),
  );

  ws.addRow(headers);
  ws.getRow(1).font = { bold: true };
  for (const r of rows) {
    ws.addRow(headers.map((h) => r?.[h] ?? null));
  }
  ws.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

  return workbook.xlsx.writeBuffer();
}
