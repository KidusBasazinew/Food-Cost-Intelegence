import { z } from "zod";

export const EmployeeRole = z.enum([
  "HOUSEKEEPING",
  "RECEPTION",
  "CHEF",
  "WAITER",
  "CASHIER",
  "STORE_KEEPER",
  "SECURITY",
  "MANAGER",
  "MAINTENANCE",
  "OTHER",
]);

export const pinSchema = {
  body: z.object({
    pin: z.string().min(1),
    hotelId: z.string().uuid(),
    branchId: z.string().uuid().optional(),
  }),
};

export const createEmployeeSchema = {
  body: z.object({
    employeeCode: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: EmployeeRole,
    phone: z.string().optional(),
    pinCode: z.string().min(3),
    hireDate: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateEmployeeSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: EmployeeRole.optional(),
    phone: z.string().optional(),
    pinCode: z.string().min(3).optional(),
    isActive: z.boolean().optional(),
  }),
};

export const listEmployeesSchema = {
  query: z
    .object({
      cursor: z.string().uuid().optional(),
      limit: z.coerce.number().int().min(1).max(200).optional(),
      role: EmployeeRole.optional(),
      activeOnly: z
        .union([z.literal("true"), z.literal("false")])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === "true")),
    })
    .default({}),
};

export const resetPinSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ newPin: z.string().min(3) }),
};
