import { z } from "zod";

const uuid = z.string().uuid();
const datetime = z.string().datetime();

export const leakageDashboardQuerySchema = {
  query: z
    .object({
      from: datetime.optional(),
      to: datetime.optional(),
      branchId: uuid.optional(),
      topN: z.coerce.number().int().min(1).max(50).optional(),
    })
    .default({}),
};
