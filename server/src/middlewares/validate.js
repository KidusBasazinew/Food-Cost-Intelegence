import { ApiError } from "../utils/apiError.js";

export function validate({ body, query, params }) {
  return (req, _res, next) => {
    try {
      if (body) {
        const parsedBody = body.parse(req.body);
        Object.defineProperty(req, "body", {
          value: parsedBody,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      if (query) {
        const parsedQuery = query.parse(req.query);
        // In Express 5, `req.query` can be a getter-only property. Assigning to it
        // may throw, which would incorrectly surface as a 400.
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      if (params) {
        const parsedParams = params.parse(req.params);
        Object.defineProperty(req, "params", {
          value: parsedParams,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      next();
    } catch (err) {
      next(
        new ApiError(400, "VALIDATION_ERROR", "Request validation failed", err),
      );
    }
  };
}
