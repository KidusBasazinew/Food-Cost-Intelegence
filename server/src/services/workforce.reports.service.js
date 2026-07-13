import { prisma } from "../prisma/client.js";
import { formatDayUTC } from "./analytics/analyticsHelpers.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

function countDaysInclusive(from, to) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  const diff = Math.round((end - start) / (24 * 60 * 60 * 1000));
  return Math.max(1, diff + 1);
}

export async function getEmployeeAttendanceSummaries({
  hotelId,
  branchId,
  from,
  to,
}) {
  const employees = await prisma.employee.findMany({
    where: { ...withBranchScope({ hotelId, branchId }), isActive: true },
    orderBy: [{ employeeCode: "asc" }],
  });

  const records = await prisma.attendanceRecord.findMany({
    where: {
      employee: withBranchScope({ hotelId, branchId }),
      date: { gte: from, lte: to },
    },
  });

  const byEmployee = new Map();
  for (const r of records) {
    const list = byEmployee.get(r.employeeId) ?? [];
    list.push(r);
    byEmployee.set(r.employeeId, list);
  }

  const totalDays = countDaysInclusive(from, to);

  return employees.map((emp) => {
    const empRecords = byEmployee.get(emp.id) ?? [];
    let presentDays = 0;
    let absentDays = 0;
    let lateCount = 0;
    let totalWorkedMinutes = 0;
    let totalOvertimeMinutes = 0;

    for (const r of empRecords) {
      if (r.status === "ABSENT") absentDays += 1;
      if (
        r.status === "PRESENT" ||
        r.status === "LATE" ||
        r.status === "HALF_DAY"
      ) {
        presentDays += 1;
      }
      if (r.status === "LATE") lateCount += 1;
      totalWorkedMinutes += r.workedMinutes ?? 0;
      totalOvertimeMinutes += r.overtimeMinutes ?? 0;
    }

    const attendancePercent =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      name: `${emp.firstName} ${emp.lastName}`,
      role: emp.role,
      presentDays,
      absentDays,
      lateCount,
      totalHoursWorked: Math.round((totalWorkedMinutes / 60) * 10) / 10,
      totalOvertimeMinutes,
      attendancePercent,
    };
  });
}

export async function buildAttendanceReport({
  hotelId,
  branchId,
  from,
  to,
}) {
  const rows = await getEmployeeAttendanceSummaries({
    hotelId,
    branchId,
    from,
    to,
  });

  return {
    title: "Attendance Report",
    rows: rows.map((r) => ({
      employeeCode: r.employeeCode,
      name: r.name,
      role: r.role,
      presentDays: r.presentDays,
      absentDays: r.absentDays,
      lateCount: r.lateCount,
      totalHoursWorked: r.totalHoursWorked,
      totalOvertimeMinutes: r.totalOvertimeMinutes,
      attendancePercent: r.attendancePercent,
    })),
    meta: {
      from: formatDayUTC(from),
      to: formatDayUTC(to),
      employeeCount: rows.length,
    },
  };
}
