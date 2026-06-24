import crypto from "node:crypto";

import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { ROLE_PERMISSIONS } from "../constants/rolePermissions.js";

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 120);
}

function sha256Base64(value) {
  return crypto.createHash("sha256").update(value).digest("base64");
}

const authHotelSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  logoUrl: true,
  city: true,
  country: true,
};

const authBranchSelect = {
  id: true,
  name: true,
  code: true,
  status: true,
};

const authUserSelect = {
  id: true,
  hotelId: true,
  branchId: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  hotel: { select: authHotelSelect },
  branch: { select: authBranchSelect },
};

function buildAccessPayload(user) {
  return {
    sub: user.id,
    hotelId: user.hotelId,
    branchId: user.branchId ?? null,
    role: user.role,
  };
}

export function getRefreshCookieOptions({ isProd, expiresAt }) {
  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  if (expiresAt instanceof Date && !Number.isNaN(expiresAt.getTime())) {
    options.expires = expiresAt;
  }

  return options;
}

function sanitizeUser(user) {
  // Ensure passwordHash never leaves the server
  // (Prisma select below also excludes it, but this is a second guard.)
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...safe } = user;

  // Attach permissions based on role
  const permissions = ROLE_PERMISSIONS[safe.role] || [];

  return {
    ...safe,
    permissions,
  };
}

async function issueRefreshToken({ userId, ipAddress, userAgent }) {
  const refreshTokenId = crypto.randomUUID();

  const token = signRefreshToken(
    {},
    {
      subject: userId,
      jwtid: refreshTokenId,
    },
  );

  const payload = verifyRefreshToken(token);

  const expiresAt = payload?.exp
    ? new Date(payload.exp * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      id: refreshTokenId,
      userId,
      tokenHash: sha256Base64(token),
      expiresAt,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
  });

  return { token, refreshTokenId, expiresAt };
}

async function rotateRefreshToken({ existingToken, ipAddress, userAgent }) {
  const tokenHash = sha256Base64(existingToken);

  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: authUserSelect } },
  });

  if (!record) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid refresh token");
  }

  if (record.revokedAt) {
    // Token reuse attempt. Revoke all tokens for that user.
    await prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    throw new ApiError(401, "UNAUTHORIZED", "Refresh token reuse detected");
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(401, "UNAUTHORIZED", "Refresh token expired");
  }

  const next = await issueRefreshToken({
    userId: record.userId,
    ipAddress,
    userAgent,
  });

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: {
      revokedAt: new Date(),
      replacedByTokenId: next.refreshTokenId,
    },
  });

  return { user: record.user, refreshToken: next.token };
}

export async function register({ hotel, user }) {
  const email = user.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new ApiError(409, "CONFLICT", "Email already registered");
  }

  const passwordHash = await hashPassword(user.password);

  const hotelSlug = hotel.slug ? slugify(hotel.slug) : slugify(hotel.name);
  if (!hotelSlug) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid hotel slug");
  }

  const result = await prisma.$transaction(async (tx) => {
    const createdHotel = await tx.hotel.create({
      data: {
        name: hotel.name,
        slug: hotelSlug,
        email: hotel.email ?? null,
        phone: hotel.phone ?? null,
        address: hotel.address ?? null,
        city: hotel.city ?? null,
        country: hotel.country ?? null,
        logoUrl: hotel.logoUrl ?? null,
      },
    });

    const createdUser = await tx.user.create({
      data: {
        hotelId: createdHotel.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email,
        passwordHash,
        role: "ADMIN",
      },
      select: {
        id: true,
        hotelId: true,
        branchId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { hotel: createdHotel, user: createdUser };
  });

  return result;
}
export async function createStaffUser({ hotelId, branchId, staffData }) {
  const email = staffData.email.toLowerCase();

  // 1. Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "CONFLICT", "Email already registered");
  }

  // 2. Hash the staff member's temporary password
  const passwordHash = await hashPassword(staffData.password);

  // 3. Create user attached to the existing hotel and branch
  const createdUser = await prisma.user.create({
    data: {
      hotelId, // Linked to existing hotel
      branchId: branchId || null, // Linked to existing branch (if applicable)
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      email,
      passwordHash,
      role: staffData.role, // Dynamically assigns role (e.g., "WAITER", "CASHIER")
      status: "ACTIVE",
    },
    select: {
      id: true,
      hotelId: true,
      branchId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return createdUser;
}
export async function login({ email, password, ipAddress, userAgent }) {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      ...authUserSelect,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "FORBIDDEN", "User is not active");
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  const lastLoginAt = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt },
  });

  const accessToken = signAccessToken(buildAccessPayload(user));
  const refresh = await issueRefreshToken({
    userId: user.id,
    ipAddress,
    userAgent,
  });

  const safeUser = sanitizeUser({ ...user, lastLoginAt });

  return {
    accessToken,
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt,
    user: safeUser,
  };
}

export async function logout({ refreshToken }) {
  if (!refreshToken) return;

  const tokenHash = sha256Base64(refreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function refresh({ refreshToken, ipAddress, userAgent }) {
  if (!refreshToken) {
    throw new ApiError(401, "UNAUTHORIZED", "Missing refresh token");
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid refresh token");
  }

  const { user, refreshToken: rotated } = await rotateRefreshToken({
    existingToken: refreshToken,
    ipAddress,
    userAgent,
  });

  const accessToken = signAccessToken(buildAccessPayload(user));

  const rotatedPayload = verifyRefreshToken(rotated);
  const rotatedExpiresAt = rotatedPayload?.exp
    ? new Date(rotatedPayload.exp * 1000)
    : null;

  return {
    accessToken,
    refreshToken: rotated,
    refreshTokenExpiresAt: rotatedExpiresAt,
    user: sanitizeUser(user),
  };
}

export async function me({ userId }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      hotelId: true,
      branchId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      hotel: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          logoUrl: true,
          city: true,
          country: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "NOT_FOUND", "User not found");
  }

  return user;
}
