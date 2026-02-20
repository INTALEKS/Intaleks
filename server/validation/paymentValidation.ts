import Joi from "joi";

/**
 * Validation schema for creating a checkout session
 * - planId: Required, the subscription plan ID to checkout
 * - successUrl: Optional, custom success redirect URL
 * - cancelUrl: Optional, custom cancel redirect URL
 * Requirements: 2.1
 */
export const createCheckoutSchema = Joi.object({
  planId: Joi.string().required().messages({
    "string.empty": "Plan ID is required",
    "any.required": "Plan ID is required",
  }),
  successUrl: Joi.string().uri().optional().messages({
    "string.uri": "Success URL must be a valid URL",
  }),
  cancelUrl: Joi.string().uri().optional().messages({
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
export const listPaymentsSchema = Joi.object({
  status: Joi.string().valid("PENDING", "SUCCEEDED", "FAILED", "REFUNDED").optional().messages({
    "any.only": "Status must be one of: PENDING, SUCCEEDED, FAILED, REFUNDED",
  }),
  planId: Joi.string().optional(),
  startDate: Joi.date().iso().optional().messages({
    "date.format": "Start date must be a valid ISO date",
  }),
  endDate: Joi.date().iso().optional().messages({
    "date.format": "End date must be a valid ISO date",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

/**
 * Validation schema for granting subscription access
 * - planId: Required, the subscription plan ID to grant
 * Requirements: 7.4
 */
export const grantSubscriptionSchema = Joi.object({
  planId: Joi.string().required().messages({
    "string.empty": "Plan ID is required",
    "any.required": "Plan ID is required",
  }),
});

/**
 * Validation schema for revoking subscription access
 * - reason: Optional, reason for revoking access
 * Requirements: 7.4
 */
export const revokeSubscriptionSchema = Joi.object({
  reason: Joi.string().optional().max(500).messages({
    "string.max": "Reason cannot exceed 500 characters",
  }),
});
