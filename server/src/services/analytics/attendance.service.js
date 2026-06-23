import { prisma } from "../../prisma/client.js";
import { formatDayUTC } from "./analyticsHelpers.js";

export async function getAttendanceOverview({ hotelId, branchId, from, to }) {
  const employeeWhere = {
    hotelId,
    ...(branchId
      ? {
          OR: [{ branchId }, { branchId: null }],
        }
      : {}),
  };

  const [employees, employeeList, records] = await Promise.all([
    prisma.employee.count({
      where: employeeWhere,
    }),

    prisma.employee.findMany({
      where: employeeWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    }),

    prisma.attendanceRecord.findMany({
      where: {
        employee: employeeWhere,
        date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        employee: true,
      },
    }),
  ]);

  // --------------------------------------------------
  // Build day map
  // --------------------------------------------------

  const dayMap = new Map();

  const cursor = new Date(from);

  while (cursor <= to) {
    const key = formatDayUTC(cursor);

    dayMap.set(key, {
      day: key,
      present: 0,
      late: 0,
      absent: 0,
      overtimeMinutes: 0,
      checkedOut: 0,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  // --------------------------------------------------
  // Track attendance per employee/day
  // --------------------------------------------------

  const attendanceByDay = new Map();

  const lateCounts = new Map();
  const overtimeByEmployee = new Map();

  for (const record of records) {
    const day = formatDayUTC(new Date(record.date));

    const entry = dayMap.get(day);
    if (!entry) continue;

    if (
      record.status === "PRESENT" ||
      record.status === "LATE" ||
      record.status === "HALF_DAY"
    ) {
      entry.present += 1;
    }

    if (record.status === "LATE") {
      entry.late += 1;
    }

    if (record.overtimeMinutes) {
      entry.overtimeMinutes += record.overtimeMinutes;
    }

    if (record.checkOutAt) {
      entry.checkedOut += 1;
    }

    // Store employee attendance for absence calculation
    if (!attendanceByDay.has(day)) {
      attendanceByDay.set(day, new Set());
    }

    attendanceByDay.get(day).add(record.employeeId);

    // Top late employees
    if (record.status === "LATE") {
      const current = lateCounts.get(record.employeeId) ?? {
        id: record.employeeId,
        name: `${record.employee.firstName} ${record.employee.lastName}`,
        count: 0,
      };

      current.count += 1;

      lateCounts.set(record.employeeId, current);
    }

    // Top overtime employees
    if (record.overtimeMinutes) {
      const current = overtimeByEmployee.get(record.employeeId) ?? {
        id: record.employeeId,
        name: `${record.employee.firstName} ${record.employee.lastName}`,
        minutes: 0,
      };

      current.minutes += record.overtimeMinutes;

      overtimeByEmployee.set(record.employeeId, current);
    }
  }

  // --------------------------------------------------
  // Dynamic absence calculation
  // --------------------------------------------------

  for (const [day, entry] of dayMap.entries()) {
    const attendedEmployees = attendanceByDay.get(day)?.size ?? 0;

    entry.absent = Math.max(0, employees - attendedEmployees);
  }

  // --------------------------------------------------
  // Trends
  // --------------------------------------------------

  const trend = Array.from(dayMap.values()).sort((a, b) =>
    a.day.localeCompare(b.day),
  );

  // --------------------------------------------------
  // Employee attendance %
  // --------------------------------------------------

  const totalDays = Math.max(
    1,
    Math.round((to - from) / (24 * 60 * 60 * 1000)) + 1,
  );

  const employeeStats = new Map();

  for (const emp of employeeList) {
    employeeStats.set(emp.id, {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      presentDays: 0,
    });
  }

  for (const record of records) {
    if (
      record.status === "PRESENT" ||
      record.status === "LATE" ||
      record.status === "HALF_DAY"
    ) {
      const stat = employeeStats.get(record.employeeId);

      if (stat) {
        stat.presentDays += 1;
      }
    }
  }

  const attendancePercentage = Array.from(employeeStats.values())
    .map((employee) => ({
      id: employee.id,
      name: employee.name,
      presentDays: employee.presentDays,
      attendancePercent: Math.round((employee.presentDays / totalDays) * 100),
    }))
    .sort((a, b) => b.attendancePercent - a.attendancePercent)
    .slice(0, 20);

  // --------------------------------------------------
  // Insights
  // --------------------------------------------------

  const topLate = Array.from(lateCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topOvertime = Array.from(overtimeByEmployee.values())
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  // --------------------------------------------------
  // Today's KPIs
  // --------------------------------------------------

  const todayKey = formatDayUTC(new Date());

  const today = dayMap.get(todayKey) ?? {
    present: 0,
    late: 0,
    absent: employees,
    overtimeMinutes: 0,
    checkedOut: 0,
  };

  return {
    kpis: {
      totalEmployees: employees,
      presentToday: today.present,
      checkedOutToday: today.checkedOut,
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
