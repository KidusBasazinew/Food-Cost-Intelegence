import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import {
  resolveBranchScope,
  resolveDateRange,
} from "../services/analytics/analyticsHelpers.js";
import {
  buildReport,
  listAvailableReports,
} from "../services/reports.service.js";
import { toCsv } from "../utils/exports/csvExport.js";
import { toXlsxBuffer } from "../utils/exports/excelExport.js";
import { toPdfBuffer } from "../utils/exports/pdfExport.js";

export const listReports = asyncHandler(async (_req, res) => {
  ok(res, "Reports", listAvailableReports());
});

export const exportReport = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });
  const { from, to } = resolveDateRange({
    from: req.query.from,
    to: req.query.to,
  });

  const report = await buildReport({
    hotelId,
    branchId,
    type: req.query.type,
    from,
    to,
    filter: {
      supplierId: req.query.supplierId,
      inventoryItemId: req.query.inventoryItemId,
    },
  });

  const format = req.query.format;

  if (format === "xlsx") {
    const buf = await toXlsxBuffer({
      sheetName: report.title,
      rows: report.rows,
    });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.query.type}.xlsx"`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    return res.status(200).send(Buffer.from(buf));
  }

  if (format === "pdf") {
    const buf = await toPdfBuffer({ title: report.title, rows: report.rows });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.query.type}.pdf"`,
    );
    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(buf);
  }

  const csv = toCsv(report.rows);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${req.query.type}.csv"`,
  );
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  return res.status(200).send(csv);
});
