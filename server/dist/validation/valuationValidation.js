"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.valuationDocumentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for creating a valuation document
 */
exports.valuationDocumentSchema = joi_1.default.object({
    companyName: joi_1.default.string().allow("").optional().messages({
        "string.base": "Company name must be a string",
    }),
    country: joi_1.default.string().min(1).required().messages({
        "string.empty": "Country is required",
        "any.required": "Country is required",
    }),
    industry: joi_1.default.string().min(1).required().messages({
        "string.empty": "Industry is required",
        "any.required": "Industry is required",
    }),
    method: joi_1.default.string().valid("asset", "profit").required().messages({
        "any.only": "Method must be asset or profit",
        "any.required": "Method is required",
    }),
    valuation: joi_1.default.number().min(0).required().messages({
        "number.min": "Valuation must be a positive number",
        "any.required": "Valuation is required",
    }),
    fileUrl: joi_1.default.string().uri().optional(),
    fileSize: joi_1.default.number().integer().positive().optional(),
    valuationReason: joi_1.default.string().allow("").optional(),
});
