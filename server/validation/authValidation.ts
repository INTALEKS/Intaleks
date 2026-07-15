import Joi from "joi";

/*** Validation schema for user registration ***/
export const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().trim().required().messages({
    "string.base": "First name must be a string",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().required().messages({
    "string.base": "Last name must be a string",
    "any.required": "Last name is required",
  }),
  referralCode: Joi.string().trim().allow("").optional(),
});

/*** Validation schema for user login ***/
export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

/*** Middleware to validate request body against a Joi schema ***/
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
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
