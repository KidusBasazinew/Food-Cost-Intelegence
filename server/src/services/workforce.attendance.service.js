import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import * as notificationService from "../services/notification.service.js";

function startOfDay(d) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

function endOfDay(d) {
  const e = startOfDay(d);
  e.setDate(e.getDate() + 1);
  return e;
}

function parseTimeToDate(timeStr, baseDate) {
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  const d = new Date(baseDate);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export async function handlePin({ pin, hotelId, branchId, actor } = {}) {
  if (!pin) throw new ApiError(400, "INVALID_PIN", "Missing PIN");
  if (!hotelId) throw new ApiError(400, "MISSING_HOTEL", "Missing hotelId");

  const employee = await prisma.employee.findFirst({
    where: { pinCode: pin, hotelId, isActive: true },
  });

  if (!employee) throw new ApiError(404, "NOT_FOUND", "Employee not found");

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Find attendance record started within the current calendar day boundary
  const existing = await prisma.attendanceRecord.findFirst({
    where: {
      employeeId: employee.id,
      date: { gte: todayStart, lt: todayEnd },
    },
    orderBy: [{ createdAt: "asc" }],
  });

  const schedule =
    (await prisma.workSchedule.findFirst({
      where: { hotelId },
      orderBy: [{ createdAt: "asc" }],
    })) ?? null;

  const scheduleStart = schedule
    ? parseTimeToDate(schedule.startTime, todayStart)
    : parseTimeToDate("08:00", todayStart);

  let scheduleEnd = schedule
    ? parseTimeToDate(schedule.endTime, todayStart)
    : parseTimeToDate("17:00", todayStart);

  // Fix Cross-Day/Night Shift Edge Case
  if (scheduleEnd <= scheduleStart) {
    scheduleEnd.setDate(scheduleEnd.getDate() + 1);
  }

  const grace = schedule ? (schedule.graceMinutes ?? 10) : 10;

  if (!existing) {
    // Calculate accurate late minutes relative to shift start line
    const diffMs = now - scheduleStart;
    const diffMinutes =
      diffMs > 0 ? Math.max(0, Math.round(diffMs / 60_000)) : 0;

    const lateMinutes = diffMinutes > grace ? diffMinutes - grace : 0;
    const status = lateMinutes > 0 ? "LATE" : "PRESENT";

    const created = await prisma.attendanceRecord.create({
      data: {
        employeeId: employee.id,
        date: todayStart,
        checkInAt: now,
        lateMinutes,
        status,
        notes: "Checked in via PIN",
      },
    });

    if (lateMinutes > 0) {
      await notificationService.createNotificationIfNotExists({
        data: {
          hotelId: employee.hotelId,
          branchId: employee.branchId ?? null,
          type: "SYSTEM_ALERT",
          severity: "WARNING",
          title: `${employee.firstName} ${employee.lastName} arrived late`,
          message: `${employee.firstName} arrived ${lateMinutes} minutes late`,
          actionUrl: `/workforce/employees/${employee.id}`,
        },
      });
    }

    return {
      message: "Checked In",
      data: {
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          role: employee.role,
        },
        checkInAt: created.checkInAt,
        status: created.status,
        lateMinutes: created.lateMinutes,
      },
    };
  }

  // Absent record from noon job — afternoon arrival is a check-in, not checkout
  if (
    existing &&
    !existing.checkInAt &&
    (existing.status === "ABSENT" || !existing.checkOutAt)
  ) {
    const diffMs = now - scheduleStart;
    const diffMinutes =
      diffMs > 0 ? Math.max(0, Math.round(diffMs / 60_000)) : 0;
    const lateMinutes = diffMinutes > grace ? diffMinutes - grace : 0;
    const status = lateMinutes > 0 ? "LATE" : "PRESENT";

    const updated = await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkInAt: now,
        lateMinutes,
        status,
        notes: "Checked in via PIN (was marked absent)",
      },
    });

    if (lateMinutes > 0) {
      await notificationService.createNotificationIfNotExists({
        data: {
          hotelId: employee.hotelId,
          branchId: employee.branchId ?? null,
          type: "SYSTEM_ALERT",
          severity: "WARNING",
          title: `${employee.firstName} ${employee.lastName} arrived late`,
          message: `${employee.firstName} arrived ${lateMinutes} minutes late`,
          actionUrl: `/workforce/employees/${employee.id}`,
        },
      });
    }

    return {
      message: "Checked In",
      data: {
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          role: employee.role,
        },
        checkInAt: updated.checkInAt,
        status: updated.status,
        lateMinutes: updated.lateMinutes,
      },
    };
  }

  if (existing && !existing.checkOutAt) {
    const checkInAt = existing.checkInAt ?? now;
    const workedMinutes = Math.max(0, Math.round((now - checkInAt) / 60_000));

    const overtimeMs = now - scheduleEnd;
    const overtimeMinutes =
      overtimeMs > 0 ? Math.max(0, Math.round(overtimeMs / 60_000)) : 0;

    const updated = await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkOutAt: now,
        workedMinutes,
        overtimeMinutes,
        notes: (existing.notes ?? "") + "; Checked out via PIN",
      },
    });

    if (overtimeMinutes >= 240) {
      const extraHours = Math.floor(overtimeMinutes / 60);
      await notificationService.createNotificationIfNotExists({
        data: {
          hotelId: employee.hotelId,
          branchId: employee.branchId ?? null,
          type: "SYSTEM_ALERT",
          severity: "WARNING",
          title: `${employee.firstName} ${employee.lastName} worked overtime`,
          message: `${employee.firstName} worked ${extraHours} extra hours`,
          actionUrl: `/workforce/employees/${employee.id}`,
        },
      });
    }

    return {
      message: "Checked Out",
      data: {
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          role: employee.role,
        },
        checkInAt: existing.checkInAt,
        checkOutAt: updated.checkOutAt,
        workedMinutes: updated.workedMinutes,
        overtimeMinutes: updated.overtimeMinutes,
      },
    };
  }

  return {
    message: "Already checked out",
    data: {
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
      },
      record: existing,
    },
  };
}
