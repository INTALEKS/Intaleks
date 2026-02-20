"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoFiltersSchema = exports.updateVideoSchema = exports.createVideoSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for creating a new video
 * - title: Required, 1-200 characters
 * - description: Required, 1-5000 characters
 * - category: Required, must be "training" or "educational"
 * - videoUrl: Required, valid URL
 * - thumbnail: Optional, valid URL or null
 */
exports.createVideoSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(1).max(200).messages({
        "string.empty": "Title is required",
        "string.min": "Title must be at least 1 character",
        "string.max": "Title must not exceed 200 characters",
        "any.required": "Title is required",
    }),
    description: joi_1.default.string().required().min(1).max(5000).messages({
        "string.empty": "Description is required",
        "string.min": "Description must be at least 1 character",
        "string.max": "Description must not exceed 5000 characters",
        "any.required": "Description is required",
    }),
    category: joi_1.default.string().valid("training", "educational").required().messages({
        "any.only": "Category must be either 'training' or 'educational'",
        "any.required": "Category is required",
        "string.empty": "Category is required",
    }),
    videoUrl: joi_1.default.string().uri().required().messages({
        "string.uri": "Video URL must be a valid URL",
        "string.empty": "Video URL is required",
        "any.required": "Video URL is required",
    }),
    thumbnail: joi_1.default.string().uri().optional().allow(null, "").messages({
        "string.uri": "Thumbnail must be a valid URL",
    }),
    duration: joi_1.default.number().integer().min(0).optional().allow(null).messages({
        "number.base": "Duration must be a number",
        "number.integer": "Duration must be an integer",
        "number.min": "Duration must be at least 0",
    }),
});
/**
 * Validation schema for updating an existing video
 * - All fields are optional but at least one must be provided
 * - Fields must be valid if provided
 * Requirements: 4.3
 */
exports.updateVideoSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(200).messages({
        "string.min": "Title must be at least 1 character",
        "string.max": "Title must not exceed 200 characters",
    }),
    description: joi_1.default.string().min(1).max(5000).messages({
        "string.min": "Description must be at least 1 character",
        "string.max": "Description must not exceed 5000 characters",
    }),
    category: joi_1.default.string().valid("training", "educational").messages({
        "any.only": "Category must be either 'training' or 'educational'",
    }),
    videoUrl: joi_1.default.string().uri().messages({
        "string.uri": "Video URL must be a valid URL",
    }),
    thumbnail: joi_1.default.string().uri().allow(null, "").messages({
        "string.uri": "Thumbnail must be a valid URL",
    }),
    duration: joi_1.default.number().integer().min(0).allow(null).messages({
        "number.base": "Duration must be a number",
        "number.integer": "Duration must be an integer",
        "number.min": "Duration must be at least 0",
    }),
})
    .min(1)
    .messages({
    "object.min": "At least one field must be provided for update",
});
/**
 * Validation schema for video filter query parameters
 * - category: Optional, filter by video category
 * - page: Optional, page number (default 1)
 * - limit: Optional, items per page (default 10, max 100)
 * Requirements: 2.2, 2.3
 */
exports.videoFiltersSchema = joi_1.default.object({
    category: joi_1.default.string().valid("training", "educational").messages({
        "any.only": "Category must be either 'training' or 'educational'",
    }),
    page: joi_1.default.number().integer().min(1).default(1).messages({
        "number.base": "Page must be a number",
        "number.min": "Page must be at least 1",
    }),
    limit: joi_1.default.number().integer().min(1).max(100).default(10).messages({
        "number.base": "Limit must be a number",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit must not exceed 100",
    }),
});
