import PDFDocument from "pdfkit";

export function toPdfBuffer({ title = "Report", rows = [] }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(16).text(title, { align: "left" });
      doc.moveDown();

      if (!rows.length) {
        doc.fontSize(10).text("No data.");
        doc.end();
        return;
      }

      const headers = Array.from(
        rows.reduce((acc, r) => {
          Object.keys(r || {}).forEach((k) => acc.add(k));
          return acc;
        }, new Set()),
      );

      doc.fontSize(9);
      doc.text(headers.join(" | "));
      doc.moveDown(0.5);

      const maxRows = 200;
      for (const r of rows.slice(0, maxRows)) {
        const line = headers.map((h) => String(r?.[h] ?? "")).join(" | ");
        doc.text(line);
      }

      if (rows.length > maxRows) {
        doc.moveDown();
        doc.text(`(truncated to first ${maxRows} rows)`);
      }

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
