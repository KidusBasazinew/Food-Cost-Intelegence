import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as notificationQueryService from "../services/notificationQuery.service.js";
import * as notificationService from "../services/notification.service.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const result = await notificationQueryService.listNotifications({
    hotelId,
    branchId,
    userId,
    query: req.query,
  });
  ok(res, "Notifications", result);
});

export const unreadCount = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const result = await notificationQueryService.countUnreadNotifications({
    hotelId,
    branchId,
    userId,
    query: req.query,
  });
  ok(res, "Unread notifications", result);
});

export const markRead = asyncHandler(async (req, res) => {
  const { hotelId, sub: userId } = req.auth;
  const result = await notificationService.markNotificationRead({
    hotelId,
    userId,
    id: req.params.id,
  });
  ok(res, "Notification marked read", result);
});

export const markAllRead = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const result = await notificationService.markAllNotificationsRead({
    hotelId,
    branchId,
    userId,
  });
  ok(res, "All notifications marked read", result);
});
