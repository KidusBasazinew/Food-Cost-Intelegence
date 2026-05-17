import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static normalize(err) {
    if (err instanceof ApiError) return err;

    if (err instanceof ZodError) {
      return new ApiError(
        400,
        "VALIDATION_ERROR",
        "Request validation failed",
        err.flatten(),
      );
    }

    return new ApiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Unexpected server error",
    );
  }
}
