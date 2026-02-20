/**
 * Custom Error Classes for Events Management API
 * Provides consistent error handling across the application
 */

// Re-export Stripe error classes and utilities
export { StripeError, STRIPE_ERROR_CODES, USER_ERROR_MESSAGES, createStripeErrorFromApiError, isStripeError, isStripeApiError } from "./stripe";
export type { StripeErrorCode } from "./stripe";

/**
 * Base application error class
 * All custom errors extend from this class
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * NotFoundError - 404
 * Thrown when a requested resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/**
 * ValidationError - 400
 * Thrown when request data fails validation
 */
export class ValidationError extends AppError {
  public readonly details: Record<string, string[]>;

  constructor(message: string = "Validation failed", details: Record<string, string[]> = {}) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.details = details;
  }
}

/**
 * ConflictError - 409
 * Thrown when there's a resource conflict (e.g., duplicate registration)
 * Requirements: 6.3
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

/**
 * UnauthorizedError - 401
 * Thrown when authentication is required but not provided or invalid
 * Requirements: 8.1
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/**
 * ForbiddenError - 403
 * Thrown when user lacks required permissions
 * Requirements: 8.2
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

/**
 * InternalError - 500
 * Thrown for unexpected server errors
 */
export class InternalError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_ERROR");
    this.name = "InternalError";
  }
}
