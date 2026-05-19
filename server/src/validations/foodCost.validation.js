import { z } from "zod";

export const foodCostReportSchema = {
  query: z.object({
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    recalculate: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v ? v === "true" : undefined)),
  }),
};
