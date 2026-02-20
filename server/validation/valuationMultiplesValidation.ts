import Joi from "joi";

/**
 * Validation schema for creating a valuation multiple
 */
export const createValuationMultipleSchema = Joi.object({
  country: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Country is required",
    "string.min": "Country must be at least 2 characters",
    "any.required": "Country is required",
  }),
  industry: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Industry is required",
    "string.min": "Industry must be at least 2 characters",
    "any.required": "Industry is required",
  }),
  scoreRange: Joi.string().valid("40-50", "30-39", "20-29", "<20").required().messages({
    "string.empty": "Score range is required",
    "any.only": "Score range must be one of: 40-50, 30-39, 20-29, <20",
    "any.required": "Score range is required",
  }),
  multiple: Joi.number().min(0).max(1000).required().messages({
    "number.base": "Multiple must be a number",
    "number.min": "Multiple must be a positive number",
    "number.max": "Multiple must be less than 1000",
    "any.required": "Multiple is required",
  }),
});

/**
 * Validation schema for updating a valuation multiple
 */
export const updateValuationMultipleSchema = Joi.object({
  country: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Country must be at least 2 characters",
  }),
  industry: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Industry must be at least 2 characters",
  }),
  scoreRange: Joi.string().valid("40-50", "30-39", "20-29", "<20").optional().messages({
    "any.only": "Score range must be one of: 40-50, 30-39, 20-29, <20",
  }),
  multiple: Joi.number().min(0).max(1000).optional().messages({
    "number.base": "Multiple must be a number",
    "number.min": "Multiple must be a positive number",
    "number.max": "Multiple must be less than 1000",
  }),
}).min(1);

/**
 * Validation schema for bulk creating valuation multiples
 */
export const bulkCreateValuationMultiplesSchema = Joi.object({
  multiples: Joi.array().items(createValuationMultipleSchema).min(1).max(1000).required().messages({
    "array.base": "Multiples must be an array",
    "array.min": "At least one multiple is required",
    "array.max": "Cannot create more than 1000 multiples at once",
    "any.required": "Multiples array is required",
  }),
});

export interface ValuationMultipleInput {
  country: string;
  industry: string;
  scoreRange: string;
  multiple: number;
}

export interface BulkValuationMultiplesInput {
  multiples: ValuationMultipleInput[];
}
