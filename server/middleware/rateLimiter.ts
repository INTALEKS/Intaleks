import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

/**
 * Rate limiter for PDF generation
 * Limits users to prevent abuse
 */
const pdfRateLimiter = new RateLimiterMemory({
  points: 10, // Number of requests
  duration: 3600, // Per hour (in seconds)
});

/**
 * Rate limiter for questionnaire calculations
 * More lenient since it's a preview feature
 */
const calculationRateLimiter = new RateLimiterMemory({
  points: 50, // Number of requests
  duration: 3600, // Per hour
});

/**
 * Middleware to rate limit PDF generation
 */
export const rateLimitPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id || req.ip || "anonymous";

    await pdfRateLimiter.consume(userId);
    next();
  } catch (error) {
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the PDF generation limit. Please try again later.",
      retryAfter: 3600,
    });
  }
};

/**
 * Middleware to rate limit calculations
 */
export const rateLimitCalculation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id || req.ip || "anonymous";

    await calculationRateLimiter.consume(userId);
    next();
  } catch (error) {
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the calculation limit. Please try again later.",
      retryAfter: 3600,
    });
  }
};
