import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import * as notificationService from "../services/notification.service.js";

function startOfDay(d) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

function parseTimeToDate(timeStr, baseDate) {
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  const d = new Date(baseDate);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function buildShiftWindow(shift, now) {
  const todayStart = startOfDay(now);

  let shiftStart = parseTimeToDate(shift.startTime, todayStart);

  let shiftEnd = parseTimeToDate(shift.endTime, todayStart);

  if (shiftEnd <= shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);

    // after midnight, still belongs to yesterday's shift
    if (now < shiftEnd) {
      shiftStart.setDate(shiftStart.getDate() - 1);
    }
  }

  return {
    shiftStart,
    shiftEnd,
  };
}

export async function handlePin({ pin, hotelId, branchId, actor } = {}) {
  if (!pin) throw new ApiError(400, "INVALID_PIN", "Missing PIN");
  if (!hotelId) throw new ApiError(400, "MISSING_HOTEL", "Missing hotelId");

  const employee = await prisma.employee.findFirst({
    where: {
      pinCode: pin,
      hotelId,
      isActive: true,
    },
    include: {
      shift: true,
    },
  });

  if (!employee) throw new ApiError(404, "NOT_FOUND", "Employee not found");
  if (!employee.shift) {
    throw new ApiError(
      400,
      "SHIFT_NOT_ASSIGNED",
      "Employee has no assigned shift",
    );
  }

  const shift = employee.shift;
  const now = new Date();

  // Dynamically build windows based on shift parameters
  const { shiftStart, shiftEnd } = buildShiftWindow(shift, now);
  const grace = shift.graceMinutes ?? 10;

  // Find an active open session (has open attendance)
  const existing = await prisma.attendanceRecord.findFirst({
    where: {
      employeeId: employee.id,
      checkOutAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // ==========================================
  // CASE 1: NEW CHECK-IN (No active open session)
  // ==========================================
  if (!existing) {
    const diffMs = now - shiftStart;
    const diffMinutes =
      diffMs > 0 ? Math.max(0, Math.round(diffMs / 60_000)) : 0;
    const lateMinutes = diffMinutes > grace ? diffMinutes - grace : 0;
    const status = lateMinutes > 0 ? "LATE" : "PRESENT";

    const created = await prisma.attendanceRecord.create({
      data: {
        employeeId: employee.id,
        shiftId: shift.id,
        date: shiftStart,
        scheduledStart: shiftStart,
        scheduledEnd: shiftEnd,
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

  // ===============================f==========================================
  // CASE 2: RE-CHECKIN FOR AN ABSENT CONSTRAINED RECORD (Open session fallback)
  // =========================================================================
  if (existing && !existing.checkInAt && existing.status === "ABSENT") {
    const diffMs = now - shiftStart;
    const diffMinutes =
      diffMs > 0 ? Math.max(0, Math.round(diffMs / 60_000)) : 0;
    const lateMinutes = diffMinutes > grace ? diffMinutes - grace : 0;
    const status = lateMinutes > 0 ? "LATE" : "PRESENT";

    const updated = await prisma.attendanceRecord.update({
      where: {
        id: existing.id,
      },
      data: {
        shiftId: shift.id,
        date: shiftStart,
        scheduledStart: shiftStart,
        scheduledEnd: shiftEnd,
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

  // ==========================================
  // CASE 3: CHECK-OUT (Active open session found)
  // ==========================================
  if (existing && !existing.checkOutAt) {
    const checkInAt = existing.checkInAt ?? now;
    const workedMinutes = Math.max(0, Math.round((now - checkInAt) / 60_000));

    // Calculate overtime using the runtime snapshot from the database record
    const overtimeMs = existing.scheduledEnd
      ? now - new Date(existing.scheduledEnd)
      : 0;
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

  // Fallback protective return
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
