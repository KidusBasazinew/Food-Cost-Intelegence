import { z } from "zod";

const NotificationType = z.enum([
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "PURCHASE_CREATED",
  "PURCHASE_STATUS_CHANGED",
  "WASTE_ALERT",
  "PROFITABILITY_ALERT",
  "SYSTEM_ALERT",
]);

const NotificationSeverity = z.enum([
  "INFO",
  "SUCCESS",
  "WARNING",
  "HIGH",
  "CRITICAL",
]);

const listNotificationsQuerySchema = z
  .object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    unreadOnly: z
      .union([z.literal("true"), z.literal("false")])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
    type: NotificationType.optional(),
    severity: NotificationSeverity.optional(),
    since: z.string().datetime().optional(),
  })
  .default({});

const unreadCountQuerySchema = z
  .object({
    type: NotificationType.optional(),
    severity: NotificationSeverity.optional(),
  })
  .default({});

const markReadParamsZodSchema = z.object({
  id: z.string().uuid(),
});

export const listNotificationsSchema = {
  query: listNotificationsQuerySchema,
};

export const unreadCountSchema = {
  query: unreadCountQuerySchema,
};

export const markReadParamsSchema = {
  params: markReadParamsZodSchema,
};
