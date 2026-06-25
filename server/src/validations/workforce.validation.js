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

    shiftId: z.string().uuid().optional(),

    isActive: z.boolean().optional(),
  }),
};

export const updateEmployeeSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),

  body: z.object({
    firstName: z.string().optional(),

    lastName: z.string().optional(),

    role: EmployeeRole.optional(),

    phone: z.string().optional(),

    pinCode: z.string().min(3).optional(),

    shiftId: z.string().uuid().nullable().optional(),

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

export const ShiftType = z.enum(["MORNING", "EVENING", "NIGHT", "CUSTOM"]);

export const createShiftSchema = {
  body: z.object({
    name: z.string().min(1),

    startTime: z.string().regex(/^\d{2}:\d{2}$/),

    endTime: z.string().regex(/^\d{2}:\d{2}$/),

    graceMinutes: z.number().int().min(0).max(120).optional(),

    color: z.string().optional(),

    isActive: z.boolean().optional(),
  }),
};

export const updateShiftSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),

  body: z.object({
    name: z.string().min(1).optional(),

    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),

    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),

    graceMinutes: z.number().int().min(0).max(120).optional(),

    color: z.string().optional(),

    isActive: z.boolean().optional(),
  }),
};
