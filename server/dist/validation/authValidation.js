"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/*** Validation schema for user registration ***/
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().trim().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters",
        "any.required": "Password is required",
    }),
    name: joi_1.default.string().trim().optional().allow("").messages({
        "string.base": "Name must be a string",
    }),
});
/*** Validation schema for user login ***/
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().trim().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().required().messages({
        "any.required": "Password is required",
    }),
});
/*** Middleware to validate request body against a Joi schema ***/
const validateRequest = (schema) => {
    return (req, res, next) => {
        console.log(req.body);
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                message: errors[0]?.message ?? "Please check your input and try again",
                details: errors,
            });
        }
        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};
exports.validateRequest = validateRequest;
