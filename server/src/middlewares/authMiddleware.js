import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

function getAccessTokenFromRequest(req) {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (bearer) return bearer;

  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  return null;
}

export function authMiddleware(req, _res, next) {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Missing access token"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    return next();
  } catch {
    return next(
      new ApiError(401, "UNAUTHORIZED", "Invalid or expired access token"),
    );
  }
}
