import { env } from "../config/env.js";
import { created, ok } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import * as authService from "../services/auth.service.js";

function getRequestIp(req) {
  const xf = req.headers["x-forwarded-for"];
  const ip = Array.isArray(xf) ? xf[0] : xf;
  return ip?.split(",")[0]?.trim() || req.ip;
}

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return created(res, "Registration successful", result);
});

export const addStaff = asyncHandler(async (req, res) => {
  // Extract hotelId and branchId from the authenticated Admin's token payload
  const { hotelId, branchId } = req.auth;

  const result = await authService.createStaffUser({
    hotelId,
    branchId,
    staffData: req.body, // Expects firstName, lastName, email, password, and role
  });

  return created(res, "Staff user created successfully", result);
});

export const login = asyncHandler(async (req, res) => {
  try {
    const { accessToken, refreshToken, refreshTokenExpiresAt, user } =
      await authService.login({
        ...req.body,
        ipAddress: getRequestIp(req),
        userAgent: req.get("user-agent"),
      });

    const isProd = env.NODE_ENV === "production";
    res.cookie(
      "refreshToken",
      refreshToken,
      authService.getRefreshCookieOptions({
        isProd,
        expiresAt: refreshTokenExpiresAt,
      }),
    );

    return ok(res, "Login successful", { accessToken, user });
  } catch (err) {
    console.error("Login error:", err);
    throw err; // Let the error handling middleware process this
  }
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  await authService.logout({ refreshToken });

  const isProd = env.NODE_ENV === "production";
  res.clearCookie(
    "refreshToken",
    authService.getRefreshCookieOptions({ isProd }),
  );

  return ok(res, "Logged out", null);
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;

  const {
    accessToken,
    refreshToken: nextRefresh,
    refreshTokenExpiresAt,
    user,
  } = await authService.refresh({
    refreshToken,
    ipAddress: getRequestIp(req),
    userAgent: req.get("user-agent"),
  });

  const isProd = env.NODE_ENV === "production";
  res.cookie(
    "refreshToken",
    nextRefresh,
    authService.getRefreshCookieOptions({
      isProd,
      expiresAt: refreshTokenExpiresAt,
    }),
  );

  return ok(res, "Token refreshed", { accessToken, user });
});

export const me = asyncHandler(async (req, res) => {
  const userId = req.auth?.sub;
  const user = await authService.me({ userId });
  return ok(res, "Me", user);
});
