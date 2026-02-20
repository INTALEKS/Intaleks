"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeSubscriptionSchema = exports.grantSubscriptionSchema = exports.listPaymentsSchema = exports.createCheckoutSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for creating a checkout session
 * - planId: Required, the subscription plan ID to checkout
 * - successUrl: Optional, custom success redirect URL
 * - cancelUrl: Optional, custom cancel redirect URL
 * Requirements: 2.1
 */
exports.createCheckoutSchema = joi_1.default.object({
    planId: joi_1.default.string().required().messages({
        "string.empty": "Plan ID is required",
        "any.required": "Plan ID is required",
    }),
    successUrl: joi_1.default.string().uri().optional().messages({
        "string.uri": "Success URL must be a valid URL",
    }),
    cancelUrl: joi_1.default.string().uri().optional().messages({
        "string.uri": "Cancel URL must be a valid URL",
    }),
});
/**
 * Validation schema for listing payments with filtering
 * - status: Optional, filter by payment status
 * - planId: Optional, filter by plan ID
 * - startDate: Optional, filter by start date
 * - endDate: Optional, filter by end date
 * - page: Optional, pagination page number
 * - limit: Optional, pagination limit
 * Requirements: 7.2
 */
exports.listPaymentsSchema = joi_1.default.object({
    status: joi_1.default.string().valid("PENDING", "SUCCEEDED", "FAILED", "REFUNDED").optional().messages({
        "any.only": "Status must be one of: PENDING, SUCCEEDED, FAILED, REFUNDED",
    }),
    planId: joi_1.default.string().optional(),
    startDate: joi_1.default.date().iso().optional().messages({
        "date.format": "Start date must be a valid ISO date",
    }),
    endDate: joi_1.default.date().iso().optional().messages({
        "date.format": "End date must be a valid ISO date",
    }),
    page: joi_1.default.number().integer().min(1).default(1).messages({
        "number.min": "Page must be at least 1",
    }),
    limit: joi_1.default.number().integer().min(1).max(100).default(20).messages({
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100",
    }),
});
/**
 * Validation schema for granting subscription access
 * - planId: Required, the subscription plan ID to grant
 * Requirements: 7.4
 */
exports.grantSubscriptionSchema = joi_1.default.object({
    planId: joi_1.default.string().required().messages({
        "string.empty": "Plan ID is required",
        "any.required": "Plan ID is required",
    }),
});
/**
 * Validation schema for revoking subscription access
 * - reason: Optional, reason for revoking access
 * Requirements: 7.4
 */
exports.revokeSubscriptionSchema = joi_1.default.object({
    reason: joi_1.default.string().optional().max(500).messages({
        "string.max": "Reason cannot exceed 500 characters",
    }),
});
