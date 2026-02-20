"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDashboardQuery = exports.dashboardQuerySchema = exports.timeRangeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for time range parameters
 * - startDate: Optional, start of date range (ISO format)
 * - endDate: Optional, end of date range (ISO format)
 * - Ensures startDate <= endDate when both are provided
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
exports.timeRangeSchema = joi_1.default.object({
    startDate: joi_1.default.date().iso().messages({
        "date.base": "Start date must be a valid date",
        "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
    }),
    endDate: joi_1.default.date()
        .iso()
        .when("startDate", {
        is: joi_1.default.exist(),
        then: joi_1.default.date().iso().min(joi_1.default.ref("startDate")).messages({
            "date.min": "End date must be on or after start date",
        }),
    })
        .messages({
        "date.base": "End date must be a valid date",
        "date.format": "End date must be in ISO format (YYYY-MM-DD)",
    }),
});
/**
 * Validation schema for combined dashboard endpoint query parameters
 * - Includes all time range parameters
 * - Used for the main dashboard data endpoint
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
exports.dashboardQuerySchema = joi_1.default.object({
    startDate: joi_1.default.date().iso().messages({
        "date.base": "Start date must be a valid date",
        "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
    }),
    endDate: joi_1.default.date()
        .iso()
        .when("startDate", {
        is: joi_1.default.exist(),
        then: joi_1.default.date().iso().min(joi_1.default.ref("startDate")).messages({
            "date.min": "End date must be on or after start date",
        }),
    })
        .messages({
        "date.base": "End date must be a valid date",
        "date.format": "End date must be in ISO format (YYYY-MM-DD)",
    }),
});
/**
 * Middleware to validate request query parameters against a Joi schema
 * Returns field-level error details as required by Requirements 6.4
 */
const validateDashboardQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const details = {};
            error.details.forEach((detail) => {
                const field = detail.path.join(".");
                if (!details[field]) {
                    details[field] = [];
                }
                details[field].push(detail.message);
            });
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details[0]?.message ?? "Please check your input and try again",
                    details,
                },
            });
        }
        req.query = value;
        next();
    };
};
exports.validateDashboardQuery = validateDashboardQuery;
