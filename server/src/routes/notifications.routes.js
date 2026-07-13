import { Router } from "express";

import * as notificationsController from "../controllers/notifications.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  listNotificationsSchema,
  markReadParamsSchema,
  unreadCountSchema,
} from "../validations/notification.validation.js";

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);

notificationsRouter.get(
  "/",
  validate(listNotificationsSchema),
  notificationsController.listNotifications,
);

notificationsRouter.get(
  "/unread-count",
  validate(unreadCountSchema),
  notificationsController.unreadCount,
);

notificationsRouter.patch("/read-all", notificationsController.markAllRead);

notificationsRouter.patch(
  "/:id/read",
  validate(markReadParamsSchema),
  notificationsController.markRead,
);
