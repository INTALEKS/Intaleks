"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateValuationMultiplesSchema = exports.updateValuationMultipleSchema = exports.createValuationMultipleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for creating a valuation multiple
 */
exports.createValuationMultipleSchema = joi_1.default.object({
    country: joi_1.default.string().min(2).max(100).required().messages({
        "string.empty": "Country is required",
        "string.min": "Country must be at least 2 characters",
        "any.required": "Country is required",
    }),
    industry: joi_1.default.string().min(2).max(100).required().messages({
        "string.empty": "Industry is required",
        "string.min": "Industry must be at least 2 characters",
        "any.required": "Industry is required",
    }),
    scoreRange: joi_1.default.string().valid("40-50", "30-39", "20-29", "<20").required().messages({
        "string.empty": "Score range is required",
        "any.only": "Score range must be one of: 40-50, 30-39, 20-29, <20",
        "any.required": "Score range is required",
    }),
    multiple: joi_1.default.number().min(0).max(1000).required().messages({
        "number.base": "Multiple must be a number",
        "number.min": "Multiple must be a positive number",
        "number.max": "Multiple must be less than 1000",
        "any.required": "Multiple is required",
    }),
});
/**
 * Validation schema for updating a valuation multiple
 */
exports.updateValuationMultipleSchema = joi_1.default.object({
    country: joi_1.default.string().min(2).max(100).optional().messages({
        "string.min": "Country must be at least 2 characters",
    }),
    industry: joi_1.default.string().min(2).max(100).optional().messages({
        "string.min": "Industry must be at least 2 characters",
    }),
    scoreRange: joi_1.default.string().valid("40-50", "30-39", "20-29", "<20").optional().messages({
        "any.only": "Score range must be one of: 40-50, 30-39, 20-29, <20",
    }),
    multiple: joi_1.default.number().min(0).max(1000).optional().messages({
        "number.base": "Multiple must be a number",
        "number.min": "Multiple must be a positive number",
        "number.max": "Multiple must be less than 1000",
    }),
}).min(1);
/**
 * Validation schema for bulk creating valuation multiples
 */
exports.bulkCreateValuationMultiplesSchema = joi_1.default.object({
    multiples: joi_1.default.array().items(exports.createValuationMultipleSchema).min(1).max(1000).required().messages({
        "array.base": "Multiples must be an array",
        "array.min": "At least one multiple is required",
        "array.max": "Cannot create more than 1000 multiples at once",
        "any.required": "Multiples array is required",
    }),
});
