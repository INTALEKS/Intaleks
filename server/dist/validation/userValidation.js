"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userStatsSchema = exports.assignSubscriptionSchema = exports.userFiltersSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Valid enum values for user status and plan type
 * Based on Prisma schema enums
 */
const USER_STATUS_VALUES = ["ACTIVE", "SUSPENDED"];
const PLAN_TYPE_VALUES = ["VISITOR", "MONTHLY", "ONE_OFF"];
const USER_ROLE_VALUES = ["USER", "ADMIN"];
/**
 * Validation schema for creating a new user
 * - email: Required, valid email format
 * - password: Required, minimum 8 characters
 * - name: Optional string
 * - role: Optional, defaults to USER
 * - status: Optional, defaults to ACTIVE
 * - planType: Optional, one of VISITOR, MONTHLY, ONE_OFF
 * Requirements: 4.3
 */
exports.createUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().trim().required().messages({
        "string.email": "Please provide a valid email address",
        "string.empty": "Email is required",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters",
        "string.empty": "Password is required",
        "any.required": "Password is required",
    }),
    name: joi_1.default.string().max(255).allow(null, "").messages({
        "string.max": "Name must not exceed 255 characters",
    }),
    role: joi_1.default.string()
        .valid(...USER_ROLE_VALUES)
        .messages({
        "any.only": "Role must be either 'USER' or 'ADMIN'",
    }),
    status: joi_1.default.string()
        .valid(...USER_STATUS_VALUES)
        .messages({
        "any.only": "Status must be either 'ACTIVE' or 'SUSPENDED'",
    }),
    planType: joi_1.default.string()
        .valid(...PLAN_TYPE_VALUES)
        .allow(null)
        .messages({
        "any.only": "Plan type must be one of 'VISITOR', 'MONTHLY', or 'ONE_OFF'",
    }),
});
/**
 * Validation schema for updating an existing user
 * - All fields are optional but at least one must be provided
 * - email: Valid email format if provided
 * - password: Minimum 8 characters if provided
 * - name: String if provided
 * - role: USER or ADMIN if provided
 * - status: ACTIVE or SUSPENDED if provided
 * - planType: VISITOR, MONTHLY, or ONE_OFF if provided
 * Requirements: 4.3
 */
exports.updateUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().trim().messages({
        "string.email": "Please provide a valid email address",
    }),
    password: joi_1.default.string().min(8).messages({
        "string.min": "Password must be at least 8 characters",
    }),
    name: joi_1.default.string().max(255).allow(null, "").messages({
        "string.max": "Name must not exceed 255 characters",
    }),
    role: joi_1.default.string()
        .valid(...USER_ROLE_VALUES)
        .messages({
        "any.only": "Role must be either 'USER' or 'ADMIN'",
    }),
    status: joi_1.default.string()
        .valid(...USER_STATUS_VALUES)
        .messages({
        "any.only": "Status must be either 'ACTIVE' or 'SUSPENDED'",
    }),
    planType: joi_1.default.string()
        .valid(...PLAN_TYPE_VALUES)
        .allow(null)
        .messages({
        "any.only": "Plan type must be one of 'VISITOR', 'MONTHLY', or 'ONE_OFF'",
    }),
})
    .min(1)
    .messages({
    "object.min": "At least one field must be provided for update",
});
/**
 * Validation schema for user filter query parameters
 * - search: Optional, search by name or email
 * - subscriptionPlanId: Optional, filter by subscription plan ID
 * - planType: Optional, filter by plan type
 * - status: Optional, filter by user status
 * - page: Optional, page number (default 1)
 * - limit: Optional, items per page (default 10, max 100)
 * Requirements: 2.1, 2.2, 2.3
 */
exports.userFiltersSchema = joi_1.default.object({
    search: joi_1.default.string().max(255).allow("").messages({
        "string.max": "Search query must not exceed 255 characters",
    }),
    subscriptionPlanId: joi_1.default.string().allow("").messages({
        "string.base": "Subscription plan ID must be a string",
    }),
    month: joi_1.default.number().integer().min(1).max(12).messages({
        "number.base": "Month must be a number",
        "number.min": "Month must be between 1 and 12",
        "number.max": "Month must be between 1 and 12",
    }),
    day: joi_1.default.number().integer().min(1).max(31).messages({
        "number.base": "Day must be a number",
        "number.min": "Day must be between 1 and 31",
        "number.max": "Day must be between 1 and 31",
    }),
    year: joi_1.default.number().integer().min(2000).max(2100).messages({
        "number.base": "Year must be a number",
        "number.min": "Year must be 2000 or later",
        "number.max": "Year must be 2100 or earlier",
    }),
    planType: joi_1.default.string()
        .valid(...PLAN_TYPE_VALUES)
        .messages({
        "any.only": "Plan type must be one of 'VISITOR', 'MONTHLY', or 'ONE_OFF'",
    }),
    status: joi_1.default.string()
        .valid(...USER_STATUS_VALUES)
        .messages({
        "any.only": "Status must be either 'ACTIVE' or 'SUSPENDED'",
    }),
    page: joi_1.default.number().integer().min(1).default(1).messages({
        "number.base": "Page must be a number",
        "number.min": "Page must be at least 1",
    }),
    limit: joi_1.default.number().integer().min(1).max(100).default(10).messages({
        "number.base": "Limit must be a number",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit must not exceed 100",
    }),
});
/**
 * Validation schema for assigning a subscription plan to a user
 */
exports.assignSubscriptionSchema = joi_1.default.object({
    planId: joi_1.default.string().required().messages({
        "string.empty": "Plan ID is required",
        "any.required": "Plan ID is required",
    }),
});
/**
 * Validation schema for user statistics query parameters
 * - startDate: Optional, start of date range
 * - endDate: Optional, end of date range
 */
exports.userStatsSchema = joi_1.default.object({
    startDate: joi_1.default.date().iso().messages({
        "date.base": "Start date must be a valid date",
        "date.format": "Start date must be in ISO format",
    }),
    endDate: joi_1.default.date().iso().min(joi_1.default.ref("startDate")).messages({
        "date.base": "End date must be a valid date",
        "date.format": "End date must be in ISO format",
        "date.min": "End date must be after start date",
    }),
});
