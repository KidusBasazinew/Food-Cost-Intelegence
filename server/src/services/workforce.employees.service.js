import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function listEmployees({ hotelId, branchId, query } = {}) {
  const where = { ...withBranchScope({ hotelId, branchId }) };
  if (query?.role) where.role = query.role;
  if (query?.activeOnly !== undefined) where.isActive = query.activeOnly;

  const take = query?.limit ?? 100;

  return prisma.employee.findMany({
    where,
    orderBy: [{ employeeCode: "asc" }],
    take,
  });
}

export async function getEmployeeById({ hotelId, branchId, id }) {
  const employee = await prisma.employee.findFirst({
    where: { id, ...withBranchScope({ hotelId, branchId }) },
  });
  if (!employee) throw new ApiError(404, "NOT_FOUND", "Employee not found");
  return employee;
}

export async function createEmployee({ hotelId, branchId, input }) {
  return prisma.employee.create({
    data: {
      hotelId,
      branchId: branchId ?? null,
      employeeCode: input.employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      phone: input.phone ?? null,
      pinCode: input.pinCode,
      hireDate: input.hireDate ?? null,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateEmployee({ hotelId, branchId, id, input }) {
  const employee = await getEmployeeById({ hotelId, branchId, id });
  return prisma.employee.update({
    where: { id: employee.id },
    data: {
      firstName: input.firstName ?? undefined,
      lastName: input.lastName ?? undefined,
      role: input.role ?? undefined,
      phone: input.phone === undefined ? undefined : input.phone,
      pinCode: input.pinCode === undefined ? undefined : input.pinCode,
      isActive: input.isActive === undefined ? undefined : input.isActive,
    },
  });
}

export async function disableEmployee({ hotelId, branchId, id }) {
  const employee = await getEmployeeById({ hotelId, branchId, id });
  await prisma.employee.update({
    where: { id: employee.id },
    data: { isActive: false },
  });
}

export async function resetPin({ hotelId, branchId, id, newPin }) {
  const employee = await getEmployeeById({ hotelId, branchId, id });
  return prisma.employee.update({
    where: { id: employee.id },
    data: { pinCode: newPin },
  });
}
