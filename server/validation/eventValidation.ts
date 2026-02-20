import Joi from "joi";

/**
 * Validation schema for creating a new event
 * - meetingLink is required when category is "online"
 * - meetingLink is optional when category is "in-person"
 */
export const createEventSchema = Joi.object({
  title: Joi.string().required().max(255).messages({
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 255 characters",
    "any.required": "Title is required",
  }),
  shortDescription: Joi.string().required().max(500).messages({
    "string.empty": "Short description is required",
    "string.max": "Short description must not exceed 500 characters",
    "any.required": "Short description is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  date: Joi.date().iso().required().messages({
    "date.base": "Date must be a valid date",
    "date.format": "Date must be in ISO format",
    "any.required": "Date is required",
  }),
  time: Joi.string()
    .required()
    .pattern(/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/i)
    .messages({
      "string.empty": "Time is required",
      "string.pattern.base": "Time must be in format HH:MM AM/PM (e.g., 10:30 AM)",
      "any.required": "Time is required",
    }),
  category: Joi.string().valid("online", "in-person").required().messages({
    "any.only": "Category must be either 'online' or 'in-person'",
    "any.required": "Category is required",
  }),
  meetingLink: Joi.string()
    .uri()
    .when("category", {
      is: "online",
      then: Joi.required().messages({
        "any.required": "Meeting link is required for online events",
        "string.empty": "Meeting link is required for online events",
      }),
      otherwise: Joi.optional().allow(null, ""),
    })
    .messages({
      "string.uri": "Meeting link must be a valid URL",
    }),
  thumbnail: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "Thumbnail must be a valid URL",
  }),
});

/**
 * Validation schema for updating an existing event
 * - All fields are optional but at least one must be provided
 * - When changing category to "online", meetingLink validation is handled at service layer
 * Requirements: 3.4
 */
export const updateEventSchema = Joi.object({
  title: Joi.string().max(255).messages({
    "string.max": "Title must not exceed 255 characters",
  }),
  shortDescription: Joi.string().max(500).messages({
    "string.max": "Short description must not exceed 500 characters",
  }),
  description: Joi.string(),
  date: Joi.date().iso().messages({
    "date.base": "Date must be a valid date",
    "date.format": "Date must be in ISO format",
  }),
  time: Joi.string()
    .pattern(/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/i)
    .messages({
      "string.pattern.base": "Time must be in format HH:MM AM/PM (e.g., 10:30 AM)",
    }),
  category: Joi.string().valid("online", "in-person").messages({
    "any.only": "Category must be either 'online' or 'in-person'",
  }),
  meetingLink: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Meeting link must be a valid URL",
  }),
  thumbnail: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Thumbnail must be a valid URL",
  }),
  status: Joi.string().valid("upcoming", "done").messages({
    "any.only": "Status must be either 'upcoming' or 'done'",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Validation schema for event filter query parameters
 * Requirements: 2.5
 */
export const eventFiltersSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).messages({
    "number.base": "Month must be a number",
    "number.min": "Month must be between 1 and 12",
    "number.max": "Month must be between 1 and 12",
  }),
  year: Joi.number().integer().min(2020).max(2100).messages({
    "number.base": "Year must be a number",
    "number.min": "Year must be 2020 or later",
    "number.max": "Year must be 2100 or earlier",
  }),
  status: Joi.string().valid("upcoming", "done").messages({
    "any.only": "Status must be either 'upcoming' or 'done'",
  }),
  category: Joi.string().valid("online", "in-person").messages({
    "any.only": "Category must be either 'online' or 'in-person'",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit must not exceed 100",
  }),
});

/**
 * Validation schema for updating participant status
 * Requirements: 6.4
 */
export const participantStatusSchema = Joi.object({
  status: Joi.string().valid("Subscribed", "Pending").required().messages({
    "any.only": "Status must be either 'Subscribed' or 'Pending'",
    "any.required": "Status is required",
  }),
});

/**
 * Validation schema for adding a participant to an event
 */
export const addParticipantSchema = Joi.object({
  userId: Joi.string().required().messages({
    "string.empty": "User ID is required",
    "any.required": "User ID is required",
  }),
});

/**
 * Middleware to validate request query parameters against a Joi schema
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
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

    req.query = value;
    next();
  };
};
