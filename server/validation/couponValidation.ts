import Joi from "joi";

export const redeemCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required().messages({
    "string.empty": "Coupon code is required",
    "any.required": "Coupon code is required",
  }),
});

export const createCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(4).max(32).optional().messages({
    "string.min": "Code must be at least 4 characters",
    "string.max": "Code cannot exceed 32 characters",
  }),
  expiresAt: Joi.date().iso().greater("now").optional().messages({
    "date.greater": "Expiry date must be in the future",
    "date.format": "Expiry date must be a valid ISO date",
  }),
  count: Joi.number().integer().min(1).max(100).default(1).messages({
    "number.min": "Count must be at least 1",
    "number.max": "Cannot generate more than 100 codes at once",
  }),
});
