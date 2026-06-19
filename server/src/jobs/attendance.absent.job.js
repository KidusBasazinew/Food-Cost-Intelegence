import { prisma } from "../prisma/client.js";
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

async function runAbsentCheck() {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  // Find all hotels
  const hotels = await prisma.hotel.findMany({ select: { id: true } });

  for (const h of hotels) {
    const hotelId = h.id;

    // Active employees for hotel
    const employees = await prisma.employee.findMany({
      where: { hotelId, isActive: true },
    });

    for (const emp of employees) {
      const hasRecord = await prisma.attendanceRecord.findFirst({
        where: { employeeId: emp.id, date: { gte: start, lt: end } },
      });
      if (!hasRecord) {
        await prisma.attendanceRecord.create({
          data: {
            employeeId: emp.id,
            date: start,
            status: "ABSENT",
            notes: "Marked absent by daily job",
          },
        });

        // Check for 3 consecutive absences
        const threeDaysAgo = new Date(start);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const absentCount = await prisma.attendanceRecord.count({
          where: {
            employeeId: emp.id,
            date: { gte: threeDaysAgo, lt: end },
            status: "ABSENT",
          },
        });
        if (absentCount >= 3) {
          await notificationService.createNotificationIfNotExists({
            data: {
              hotelId: emp.hotelId,
              branchId: emp.branchId ?? null,
              type: "SYSTEM_ALERT",
              severity: "HIGH",
              title: `${emp.firstName} ${emp.lastName} absent ${absentCount} days`,
              message: `Employee absent ${absentCount} consecutive days`,
              actionUrl: `/workforce/employees/${emp.id}`,
            },
          });
        }
      }
    }
  }
}

export function startAttendanceAbsentJob() {
  // Schedule next run at 12:00 local time
  const now = new Date();
  const next = new Date(now);
  next.setHours(12, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  const ms = next - now;
  setTimeout(() => {
    runAbsentCheck().catch((err) => console.error("Absent job error:", err));
    // then run every 24 hours
    setInterval(
      () =>
        runAbsentCheck().catch((err) =>
          console.error("Absent job error:", err),
        ),
      24 * 60 * 60 * 1000,
    );
  }, ms);
}
