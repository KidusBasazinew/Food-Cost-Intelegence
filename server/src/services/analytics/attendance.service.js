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

  // Today's KPIs
  const todayKey = formatDayUTC(new Date());
  const today = dayMap.get(todayKey) ?? {
    present: 0,
    late: 0,
    absent: 0,
    overtimeMinutes: 0,
  };

  return {
    kpis: {
      totalEmployees: employees,
      presentToday: today.present,
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
    },
  };
}
