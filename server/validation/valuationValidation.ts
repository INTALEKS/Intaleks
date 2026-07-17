import Joi from "joi";

/**
 * Validation schema for creating a valuation document
 */
export const valuationDocumentSchema = Joi.object({
  companyName: Joi.string().allow("").optional().messages({
    "string.base": "Company name must be a string",
  }),
  country: Joi.string().min(1).required().messages({
    "string.empty": "Country is required",
    "any.required": "Country is required",
  }),
  industry: Joi.string().min(1).required().messages({
    "string.empty": "Industry is required",
    "any.required": "Industry is required",
  }),
  method: Joi.string().valid("asset", "profit").required().messages({
    "any.only": "Method must be asset or profit",
    "any.required": "Method is required",
  }),
  valuation: Joi.number().min(0).required().messages({
    "number.min": "Valuation must be a positive number",
    "any.required": "Valuation is required",
  }),
  fileUrl: Joi.string().uri().optional(),
  fileSize: Joi.number().integer().positive().optional(),
  valuationReason: Joi.string().allow("").optional(),
});

export interface ValuationDocumentInput {
  companyName?: string;
  country: string;
  industry: string;
  method: "asset" | "profit";
  valuation: number;
  fileUrl?: string;
  fileSize?: number;
  valuationReason?: string;
}
