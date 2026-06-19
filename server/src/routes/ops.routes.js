import { Router } from "express";
import * as roomController from "../controllers/roomOps.room.controller.js";
import * as reservationController from "../controllers/roomOps.reservation.controller.js";
import * as housekeepingController from "../controllers/roomOps.housekeeping.controller.js";
import * as lateCheckoutController from "../controllers/roomOps.lateCheckout.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  roomController.updateRoom,
);
opsRouter.delete(
  "/rooms/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN"]),
  roomController.deleteRoom,
);

// Reservations
opsRouter.post(
  "/reservations",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  reservationController.createReservation,
);
opsRouter.get(
  "/reservations",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]),
  reservationController.listReservations,
);
opsRouter.get("/reservations/:id", reservationController.getReservation);
opsRouter.patch(
  "/reservations/:id/checkin",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  reservationController.checkIn,
);
opsRouter.patch(
  "/reservations/:id/checkout",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  reservationController.checkOut,
);

// Housekeeping tasks
opsRouter.post(
  "/housekeeping/tasks",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  housekeepingController.createTask,
);
opsRouter.get("/housekeeping/tasks", housekeepingController.listTasks);
opsRouter.get("/housekeeping/tasks/:id", housekeepingController.getTask);
opsRouter.patch(
  "/housekeeping/tasks/:id/start",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]),
  housekeepingController.startTask,
);
opsRouter.patch(
  "/housekeeping/tasks/:id/complete",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]),
  housekeepingController.completeTask,
);
opsRouter.patch(
  "/housekeeping/tasks/:id/verify",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  housekeepingController.verifyTask,
);

// Late checkout
opsRouter.post(
  "/late-checkout/detect",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  lateCheckoutController.runLateCheckoutDetection,
);
opsRouter.get(
  "/late-checkout/list",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  lateCheckoutController.listLateCheckouts,
);
