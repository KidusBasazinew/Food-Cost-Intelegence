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

export async function listSuppliers({ hotelId, branchId }) {
  return prisma.supplier.findMany({
    where: withBranchScope({ hotelId, branchId }),
    orderBy: [{ name: "asc" }],
  });
}

export async function getSupplierById({ hotelId, branchId, id }) {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      ...withBranchScope({ hotelId, branchId }),
    },
  });
  if (!supplier) throw new ApiError(404, "NOT_FOUND", "Supplier not found");
  return supplier;
}

export async function createSupplier({ hotelId, branchId, input }) {
  return prisma.supplier.create({
    data: {
      hotelId,
      branchId: branchId ?? null,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
    },
  });
}

export async function updateSupplier({ hotelId, branchId, id, input }) {
  const supplier = await getSupplierById({ hotelId, branchId, id });

  return prisma.supplier.update({
    where: { id: supplier.id },
    data: {
      name: input.name ?? undefined,
      email: input.email === undefined ? undefined : input.email,
      phone: input.phone === undefined ? undefined : input.phone,
      address: input.address === undefined ? undefined : input.address,
    },
  });
}

export async function deleteSupplier({ hotelId, branchId, id }) {
  const supplier = await getSupplierById({ hotelId, branchId, id });
  await prisma.supplier.delete({ where: { id: supplier.id } });
}
