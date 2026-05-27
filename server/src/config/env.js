import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),

  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1).default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1).default("30d"),

  // Notifications
  NOTIFICATION_PAGE_LIMIT: z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .default(20),
  FOOD_COST_ALERT_THRESHOLD_PERCENT: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(45),
  WASTE_HIGH_VALUE_THRESHOLD_CENTS: z.coerce
    .number()
    .int()
    .min(0)
    .default(50000),
  WASTE_REPEAT_COUNT_THRESHOLD: z.coerce.number().int().min(1).default(3),
  WASTE_WEEKLY_COST_THRESHOLD_CENTS: z.coerce
    .number()
    .int()
    .min(0)
    .default(150000),
});

export const env = EnvSchema.parse(process.env);
