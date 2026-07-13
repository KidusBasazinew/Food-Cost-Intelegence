import { Router } from "express";
import * as roomController from "../controllers/roomOps.room.controller.js";
import * as reservationController from "../controllers/roomOps.reservation.controller.js";
import * as housekeepingController from "../controllers/roomOps.housekeeping.controller.js";
import * as lateCheckoutController from "../controllers/roomOps.lateCheckout.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";

export const opsRouter = Router();

// All ops routes require an authenticated user
opsRouter.use(authMiddleware);

// Rooms
opsRouter.post(
  "/rooms",
  //   roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  roomController.createRoom,
);
opsRouter.get("/rooms", roomController.listRooms);
opsRouter.get("/rooms/:id", roomController.getRoom);
opsRouter.put(
  "/rooms/:id",
  permissionMiddleware(PERMISSIONS.ROOMS_MANAGE),
  roomController.updateRoom,
);
opsRouter.delete(
  "/rooms/:id",
  permissionMiddleware(PERMISSIONS.ROOMS_MANAGE),
  roomController.deleteRoom,
);

// Reservations
opsRouter.post(
  "/reservations",
  permissionMiddleware(PERMISSIONS.RESERVATIONS_CREATE),
  reservationController.createReservation,
);
opsRouter.get(
  "/reservations",
  permissionMiddleware(PERMISSIONS.RESERVATIONS_VIEW),
  reservationController.listReservations,
);
opsRouter.get("/reservations/:id", reservationController.getReservation);
opsRouter.patch(
  "/reservations/:id/checkin",
  permissionMiddleware(PERMISSIONS.RESERVATIONS_UPDATE),
  reservationController.checkIn,
);
opsRouter.patch(
  "/reservations/:id/checkout",
  permissionMiddleware(PERMISSIONS.RESERVATIONS_UPDATE),
  reservationController.checkOut,
);

// Housekeeping tasks
opsRouter.post(
  "/housekeeping/tasks",
  permissionMiddleware(PERMISSIONS.HOUSEKEEPING_ASSIGN),
  housekeepingController.createTask,
);
opsRouter.get("/housekeeping/tasks", housekeepingController.listTasks);
opsRouter.get("/housekeeping/tasks/:id", housekeepingController.getTask);
opsRouter.patch(
  "/housekeeping/tasks/:id/start",
  permissionMiddleware(PERMISSIONS.HOUSEKEEPING_UPDATE),
  housekeepingController.startTask,
);
opsRouter.patch(
  "/housekeeping/tasks/:id/complete",
  permissionMiddleware(PERMISSIONS.HOUSEKEEPING_UPDATE),
  housekeepingController.completeTask,
);
opsRouter.patch(
  "/housekeeping/tasks/:id/verify",
  permissionMiddleware(PERMISSIONS.HOUSEKEEPING_UPDATE),
  housekeepingController.verifyTask,
);

// Late checkout
opsRouter.post(
  "/late-checkout/detect",
  permissionMiddleware(PERMISSIONS.LATE_CHECKOUT_MANAGE),
  lateCheckoutController.runLateCheckoutDetection,
);
opsRouter.get(
  "/late-checkout/list",
  permissionMiddleware(PERMISSIONS.LATE_CHECKOUT_MANAGE),
  lateCheckoutController.listLateCheckouts,
);
