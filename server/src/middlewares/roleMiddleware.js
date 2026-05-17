import { ApiError } from "../utils/apiError.js";

export function roleMiddleware(allowedRoles = []) {
  const allowed = new Set(Array.isArray(allowedRoles) ? allowedRoles : []);

  return (req, _res, next) => {
    const role = req.auth?.role;

    if (!role) {
      return next(new ApiError(401, "UNAUTHORIZED", "Missing auth context"));
    }

    if (allowed.size > 0 && !allowed.has(role)) {
      return next(new ApiError(403, "FORBIDDEN", "Insufficient permissions"));
    }

    return next();
  };
}
