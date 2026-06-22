import { prisma } from "../../prisma/client.js";
import { formatDayUTC } from "./analyticsHelpers.js";

export async function getAttendanceOverview({ hotelId, branchId, from, to }) {
  // KPIs: total employees, present today, late today, absent today, overtime today
  const [employees, records] = await Promise.all([
    prisma.employee.count({ where: { hotelId } }),
    prisma.attendanceRecord.findMany({
      where: {
        employee: { hotelId },
        date: { gte: from, lte: to },
        ...(branchId
          ? { employee: { OR: [{ branchId }, { branchId: null }] } }
          : {}),
      },
      include: { employee: true },
    }),
  ]);

  // Build daily trend for last N days
  const dayMap = new Map();
  const d = new Date(from);
  while (d <= to) {
    const key = formatDayUTC(d);
    dayMap.set(key, {
      day: key,
      present: 0,
      late: 0,
      absent: 0,
      overtimeMinutes: 0,
      checkedOut: 0, // 👈 1. ADD checkedOut tracking counter to the daily initialization map
    });
    d.setDate(d.getDate() + 1);
  }

  const lateCounts = new Map();
  const overtimeByEmployee = new Map();

  for (const r of records) {
    const day = formatDayUTC(new Date(r.date));
    const entry = dayMap.get(day);
    if (!entry) continue;
    if (r.status === "ABSENT") entry.absent += 1;
    if (
      r.status === "PRESENT" ||
      r.status === "LATE" ||
      r.status === "HALF_DAY"
    )
      entry.present += 1;
    if (r.status === "LATE") entry.late += 1;
    if (r.overtimeMinutes) entry.overtimeMinutes += r.overtimeMinutes;

    // 👈 2. Increment checkout baseline if checkOutAt has a valid timestamp string
    if (r.checkOutAt) {
      entry.checkedOut += 1;
    }

    // late per employee
    if (r.status === "LATE") {
      const c = lateCounts.get(r.employeeId) ?? {
        count: 0,
        name: `${r.employee.firstName} ${r.employee.lastName}`,
        id: r.employeeId,
      };
      c.count += 1;
      lateCounts.set(r.employeeId, c);
    }

    if (r.overtimeMinutes) {
      const o = overtimeByEmployee.get(r.employeeId) ?? {
        minutes: 0,
        name: `${r.employee.firstName} ${r.employee.lastName}`,
        id: r.employeeId,
      };
      o.minutes += r.overtimeMinutes;
      overtimeByEmployee.set(r.employeeId, o);
    }
  }

  const trend = Array.from(dayMap.values()).sort((a, b) =>
    a.day.localeCompare(b.day),
  );

  const topLate = Array.from(lateCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const topOvertime = Array.from(overtimeByEmployee.values())
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  // Per-employee attendance percentage for the selected range
  const totalDays = Math.max(
    1,
    Math.round((to - from) / (24 * 60 * 60 * 1000)) + 1,
  );
  const employeeStats = new Map();

  for (const emp of await prisma.employee.findMany({
    where: { hotelId, ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}) },
    select: { id: true, firstName: true, lastName: true },
  })) {
    employeeStats.set(emp.id, {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      presentDays: 0,
    });
  }

  for (const r of records) {
    const stat = employeeStats.get(r.employeeId);
    if (!stat) continue;
    if (
      r.status === "PRESENT" ||
      r.status === "LATE" ||
      r.status === "HALF_DAY"
    ) {
      stat.presentDays += 1;
    }
  }

  const attendancePercentage = Array.from(employeeStats.values())
    .map((s) => ({
      id: s.id,
      name: s.name,
      attendancePercent: Math.round((s.presentDays / totalDays) * 100),
      presentDays: s.presentDays,
    }))
    .sort((a, b) => b.attendancePercent - a.attendancePercent)
    .slice(0, 20);

  // Today's KPIs
  const todayKey = formatDayUTC(new Date());
  const today = dayMap.get(todayKey) ?? {
    present: 0,
    late: 0,
    absent: 0,
    overtimeMinutes: 0,
    checkedOut: 0, // 👈 3. Fallback tracking default safely
  };

  return {
    kpis: {
      totalEmployees: employees,
      presentToday: today.present,
      checkedOutToday: today.checkedOut, // 👈 4. EXPORT metrics object safely to matching React hook pipeline
      lateToday: today.late,
      absentToday: today.absent,
      overtimeTodayMinutes: today.overtimeMinutes,
    },
    charts: {
      attendanceTrend: trend,
    },
    insights: {
      topLateEmployees: topLate,
      topOvertimeEmployees: topOvertime,
      attendancePercentage,
    },
  };
}
