"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuestionnaireSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for questionnaire response submission
 */
exports.submitQuestionnaireSchema = joi_1.default.object({
    ownerDependence: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Owner dependence must be a number",
        "number.min": "Owner dependence must be between 1 and 5",
        "number.max": "Owner dependence must be between 1 and 5",
        "any.required": "Owner dependence is required",
    }),
    recurringRevenue: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Recurring revenue must be a number",
        "number.min": "Recurring revenue must be between 1 and 5",
        "number.max": "Recurring revenue must be between 1 and 5",
        "any.required": "Recurring revenue is required",
    }),
    customerConcentration: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Customer concentration must be a number",
        "number.min": "Customer concentration must be between 1 and 5",
        "number.max": "Customer concentration must be between 1 and 5",
        "any.required": "Customer concentration is required",
    }),
    managementDepth: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Management depth must be a number",
        "number.min": "Management depth must be between 1 and 5",
        "number.max": "Management depth must be between 1 and 5",
        "any.required": "Management depth is required",
    }),
    growthRate: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Growth rate must be a number",
        "number.min": "Growth rate must be between 1 and 5",
        "number.max": "Growth rate must be between 1 and 5",
        "any.required": "Growth rate is required",
    }),
    competitiveAdvantage: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Competitive advantage must be a number",
        "number.min": "Competitive advantage must be between 1 and 5",
        "number.max": "Competitive advantage must be between 1 and 5",
        "any.required": "Competitive advantage is required",
    }),
    revenueDiversification: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Revenue diversification must be a number",
        "number.min": "Revenue diversification must be between 1 and 5",
        "number.max": "Revenue diversification must be between 1 and 5",
        "any.required": "Revenue diversification is required",
    }),
    systemsScalability: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Systems scalability must be a number",
        "number.min": "Systems scalability must be between 1 and 5",
        "number.max": "Systems scalability must be between 1 and 5",
        "any.required": "Systems scalability is required",
    }),
    marginStability: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "Margin stability must be a number",
        "number.min": "Margin stability must be between 1 and 5",
        "number.max": "Margin stability must be between 1 and 5",
        "any.required": "Margin stability is required",
    }),
    externalRisk: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.base": "External risk must be a number",
        "number.min": "External risk must be between 1 and 5",
        "number.max": "External risk must be between 1 and 5",
        "any.required": "External risk is required",
    }),
    country: joi_1.default.string().valid("australia", "canada", "united kingdom", "united states").required().messages({
        "string.empty": "Country is required",
        "any.required": "Country is required",
        "any.only": "Country must be one of: australia, canada, united kingdom, united states",
    }),
    industry: joi_1.default.string().valid("construction", "finance", "healthcare", "hospitality", "manufacturing", "professional", "retail", "service", "technology", "wholesale", "other").required().messages({
        "string.empty": "Industry is required",
        "any.required": "Industry is required",
        "any.only": "Industry must be one of: construction, finance, healthcare, hospitality, manufacturing, professional, retail, service, technology, wholesale, other",
    }),
    valuationDocumentId: joi_1.default.string().optional().allow(null),
    overrideMultiple: joi_1.default.number().min(0).max(1000).optional().allow(null).messages({
        "number.base": "Override multiple must be a number",
        "number.min": "Override multiple must be a positive number",
        "number.max": "Override multiple must be less than 1000",
    }),
});
