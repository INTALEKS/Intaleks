"use strict";
/**
 * Custom Error Classes for Events Management API
 * Provides consistent error handling across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.ForbiddenError = exports.UnauthorizedError = exports.ConflictError = exports.ValidationError = exports.NotFoundError = exports.AppError = exports.isStripeApiError = exports.isStripeError = exports.createStripeErrorFromApiError = exports.USER_ERROR_MESSAGES = exports.STRIPE_ERROR_CODES = exports.StripeError = void 0;
// Re-export Stripe error classes and utilities
var stripe_1 = require("./stripe");
Object.defineProperty(exports, "StripeError", { enumerable: true, get: function () { return stripe_1.StripeError; } });
Object.defineProperty(exports, "STRIPE_ERROR_CODES", { enumerable: true, get: function () { return stripe_1.STRIPE_ERROR_CODES; } });
Object.defineProperty(exports, "USER_ERROR_MESSAGES", { enumerable: true, get: function () { return stripe_1.USER_ERROR_MESSAGES; } });
Object.defineProperty(exports, "createStripeErrorFromApiError", { enumerable: true, get: function () { return stripe_1.createStripeErrorFromApiError; } });
Object.defineProperty(exports, "isStripeError", { enumerable: true, get: function () { return stripe_1.isStripeError; } });
Object.defineProperty(exports, "isStripeApiError", { enumerable: true, get: function () { return stripe_1.isStripeApiError; } });
/**
 * Base application error class
 * All custom errors extend from this class
 */
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
/**
 * NotFoundError - 404
 * Thrown when a requested resource does not exist
 */
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404, "NOT_FOUND");
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
/**
 * ValidationError - 400
 * Thrown when request data fails validation
 */
class ValidationError extends AppError {
    details;
    constructor(message = "Validation failed", details = {}) {
        super(message, 400, "VALIDATION_ERROR");
        this.name = "ValidationError";
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
/**
 * ConflictError - 409
 * Thrown when there's a resource conflict (e.g., duplicate registration)
 * Requirements: 6.3
 */
class ConflictError extends AppError {
    constructor(message = "Resource conflict") {
        super(message, 409, "CONFLICT");
        this.name = "ConflictError";
    }
}
exports.ConflictError = ConflictError;
/**
 * UnauthorizedError - 401
 * Thrown when authentication is required but not provided or invalid
 * Requirements: 8.1
 */
class UnauthorizedError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401, "UNAUTHORIZED");
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * ForbiddenError - 403
 * Thrown when user lacks required permissions
 * Requirements: 8.2
 */
class ForbiddenError extends AppError {
    constructor(message = "Access forbidden") {
        super(message, 403, "FORBIDDEN");
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * InternalError - 500
 * Thrown for unexpected server errors
 */
class InternalError extends AppError {
    constructor(message = "Internal server error") {
        super(message, 500, "INTERNAL_ERROR");
        this.name = "InternalError";
    }
}
exports.InternalError = InternalError;
