import Joi from "joi";

/**
 * Validation schema for attachment objects
 */
const attachmentSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required().max(255),
  size: Joi.number()
    .required()
    .max(50 * 1024 * 1024), // Max 50MB
  type: Joi.string().required(),
  url: Joi.string().uri().required(),
});

/**
 * Validation schema for creating a new forum post
 * - title: Required, non-empty string
 * - content: Required, non-empty string (can contain HTML with inline images)
 * - attachments: Optional array of attachment objects
 * Requirements: 8.2
 */
export const createForumPostSchema = Joi.object({
  title: Joi.string().trim().required().min(1).max(500).messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 1 character",
    "string.max": "Title must not exceed 500 characters",
    "any.required": "Title is required",
  }),
  content: Joi.string().required().min(1).messages({
    "string.empty": "Content is required",
    "string.min": "Content must be at least 1 character",
    "any.required": "Content is required",
  }),
  attachments: Joi.array().items(attachmentSchema).max(10).default([]).messages({
    "array.max": "Maximum 10 attachments allowed",
  }),
  isAnnouncement: Joi.boolean().default(false),
});

/**
 * Validation schema for creating a reply to a forum post
 * - message: Required, non-empty, non-whitespace string
 * Requirements: 5.3
 */
export const createForumReplySchema = Joi.object({
  message: Joi.string()
    .trim()
    .required()
    .min(1)
    .custom((value, helpers) => {
      if (!value || value.trim().length === 0) {
        return helpers.error("string.whitespace");
      }
      return value;
    })
    .messages({
      "string.empty": "Reply message is required",
      "string.min": "Reply message must be at least 1 character",
      "string.whitespace": "Reply message cannot be empty or contain only whitespace",
      "any.required": "Reply message is required",
    }),
});

/**
 * Validation schema for forum filter query parameters
 * - search: Optional, search term for filtering by author name, title, or content
 * - page: Optional, page number (default 1)
 * - limit: Optional, items per page (default 10, max 100)
 */
export const forumFiltersSchema = Joi.object({
  search: Joi.string().trim().allow("").max(255).messages({
    "string.max": "Search term must not exceed 255 characters",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit must not exceed 100",
  }),
});
