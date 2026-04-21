"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCouponSchema = exports.redeemCouponSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.redeemCouponSchema = joi_1.default.object({
    code: joi_1.default.string().trim().uppercase().required().messages({
        "string.empty": "Coupon code is required",
        "any.required": "Coupon code is required",
    }),
});
exports.createCouponSchema = joi_1.default.object({
    code: joi_1.default.string().trim().uppercase().min(4).max(32).optional().messages({
        "string.min": "Code must be at least 4 characters",
        "string.max": "Code cannot exceed 32 characters",
    }),
    expiresAt: joi_1.default.date().iso().greater("now").optional().messages({
        "date.greater": "Expiry date must be in the future",
        "date.format": "Expiry date must be a valid ISO date",
    }),
    count: joi_1.default.number().integer().min(1).max(100).default(1).messages({
        "number.min": "Count must be at least 1",
        "number.max": "Cannot generate more than 100 codes at once",
    }),
});
