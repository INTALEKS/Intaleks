import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError, StripeError, isStripeError } from "../errors";

/**
 * Error Response Interface
 * Consistent error response format as defined in design document
 * Requirements: 10.1, 10.2, 10.3
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    userMessage?: string;
  };
}

/**
 * Global Error Handler Middleware
 * Provides consistent error responses across all endpoints
 * Requirements: 10.1, 10.2, 10.3
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  // Log error for debugging (only in development or for non-operational errors)
  if (process.env.NODE_ENV !== "production" || !(err instanceof AppError)) {
    console.error("Error:", err);
  }

  // Handle Stripe errors with user-friendly messages (Requirements 10.1, 10.2, 10.3)
  if (isStripeError(err)) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: process.env.NODE_ENV === "production" ? err.userMessage : err.message,
        userMessage: err.userMessage,
      },
    };

    // Log Stripe errors for debugging (Requirement 10.3)
    console.error("Stripe Error:", {
      code: err.code,
      message: err.message,
      declineCode: err.declineCode,
      stripeError: err.stripeError?.message,
    });

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle operational errors (our custom AppError instances)
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Include validation details if present
    if (err instanceof ValidationError && Object.keys(err.details).length > 0) {
      response.error.details = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as any;

    // Handle unique constraint violation
    if (prismaError.code === "P2002") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "A resource with this identifier already exists",
        },
      });
      return;
    }

    // Handle record not found
    if (prismaError.code === "P2025") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "The requested resource was not found",
        },
      });
      return;
    }
  }

  // Handle Joi validation errors (if not caught earlier)
  if (err.name === "ValidationError" && "details" in err) {
    const joiError = err as any;
    const details: Record<string, string[]> = {};

    joiError.details?.forEach((detail: any) => {
      const field = detail.path?.join(".") || "unknown";
      if (!details[field]) {
        details[field] = [];
      }
      details[field].push(detail.message);
    });

    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
      },
    });
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid JSON in request body",
      },
    });
    return;
  }

  // Handle all other unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message || "An unexpected error occurred",
    },
  });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and pass them to the error handler
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found Handler
 * Handles requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
};
