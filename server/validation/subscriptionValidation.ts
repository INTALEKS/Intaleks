import Joi from "joi";

const BILLING_PERIODS = ["MONTHLY", "YEARLY", "ONE_TIME"] as const;

/**
 * Validation schema for creating a new subscription plan
 * - name: Required, unique plan name
 * - price: Required, price in cents (integer >= 0)
 * - billingPeriod: Optional, defaults to MONTHLY
 * - features: Required, array of feature strings
 * - active: Optional, defaults to true
 */
export const createSubscriptionSchema = Joi.object({
  name: Joi.string().required().min(1).max(100).messages({
    "string.empty": "Plan name is required",
    "string.min": "Plan name must be at least 1 character",
    "string.max": "Plan name must not exceed 100 characters",
    "any.required": "Plan name is required",
  }),
  price: Joi.number().integer().min(0).required().messages({
    "number.base": "Price must be a number",
    "number.integer": "Price must be an integer (in cents)",
    "number.min": "Price cannot be negative",
    "any.required": "Price is required",
  }),
  billingPeriod: Joi.string()
    .valid(...BILLING_PERIODS)
    .default("MONTHLY")
    .messages({
      "any.only": `Billing period must be one of: ${BILLING_PERIODS.join(", ")}`,
    }),
  features: Joi.array()
    .items(
      Joi.string().min(1).max(500).messages({
        "string.min": "Feature must be at least 1 character",
        "string.max": "Feature must not exceed 500 characters",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Features must be an array",
      "array.min": "At least one feature is required",
      "any.required": "Features are required",
    }),
  active: Joi.boolean().default(true).messages({
    "boolean.base": "Active must be a boolean value",
  }),
});

/**
 * Validation schema for updating an existing subscription plan
 * - All fields are optional but at least one must be provided
 * - name: Plan name if provided
 * - price: Price in cents if provided
 * - billingPeriod: Billing period if provided
 * - features: Array of feature strings if provided
 * - active: Boolean if provided
 */
export const updateSubscriptionSchema = Joi.object({
  name: Joi.string().min(1).max(100).messages({
    "string.min": "Plan name must be at least 1 character",
    "string.max": "Plan name must not exceed 100 characters",
  }),
  price: Joi.number().integer().min(0).messages({
    "number.base": "Price must be a number",
    "number.integer": "Price must be an integer (in cents)",
    "number.min": "Price cannot be negative",
  }),
  billingPeriod: Joi.string()
    .valid(...BILLING_PERIODS)
    .messages({
      "any.only": `Billing period must be one of: ${BILLING_PERIODS.join(", ")}`,
    }),
  features: Joi.array()
    .items(
      Joi.string().min(1).max(500).messages({
        "string.min": "Feature must be at least 1 character",
        "string.max": "Feature must not exceed 500 characters",
      })
    )
    .min(1)
    .messages({
      "array.base": "Features must be an array",
      "array.min": "At least one feature is required",
    }),
  active: Joi.boolean().messages({
    "boolean.base": "Active must be a boolean value",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });
