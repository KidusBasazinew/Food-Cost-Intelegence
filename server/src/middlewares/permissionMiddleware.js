/**
 * Permission middleware for RBAC
 * Checks if the authenticated user has the required permission(s)
 * Usage: permissionMiddleware("inventory.create")
 * or: permissionMiddleware(["inventory.create", "inventory.update"])
 */

import { ApiError } from "../utils/apiError.js";
import { ROLE_PERMISSIONS } from "../constants/rolePermissions.js";

export function permissionMiddleware(requiredPermissions = []) {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return (req, _res, next) => {
    // Ensure auth context exists
    const userRole = req.auth?.role;
    if (!userRole) {
      return next(new ApiError(401, "UNAUTHORIZED", "Missing auth context"));
    }

    // Get role permissions
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];

    // Check if user has at least one of the required permissions
    const hasPermission = permissions.some((permission) =>
      rolePermissions.includes(permission),
    );

    if (!hasPermission) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          `Insufficient permissions. Required: ${permissions.join(" or ")}`,
        ),
      );
    }

    // Attach user permissions to request for later use
    req.auth.permissions = rolePermissions;
    return next();
  };
}
