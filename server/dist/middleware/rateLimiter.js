"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitCalculation = exports.rateLimitPDF = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
/**
 * Rate limiter for PDF generation
 * Limits users to prevent abuse
 */
const pdfRateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 10, // Number of requests
    duration: 3600, // Per hour (in seconds)
});
/**
 * Rate limiter for questionnaire calculations
 * More lenient since it's a preview feature
 */
const calculationRateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 50, // Number of requests
    duration: 3600, // Per hour
});
/**
 * Middleware to rate limit PDF generation
 */
const rateLimitPDF = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.ip || "anonymous";
        await pdfRateLimiter.consume(userId);
        next();
    }
    catch (error) {
        res.status(429).json({
            error: "Too many requests",
            message: "You have exceeded the PDF generation limit. Please try again later.",
            retryAfter: 3600,
        });
    }
};
exports.rateLimitPDF = rateLimitPDF;
/**
 * Middleware to rate limit calculations
 */
const rateLimitCalculation = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.ip || "anonymous";
        await calculationRateLimiter.consume(userId);
        next();
    }
    catch (error) {
        res.status(429).json({
            error: "Too many requests",
            message: "You have exceeded the calculation limit. Please try again later.",
            retryAfter: 3600,
        });
    }
};
exports.rateLimitCalculation = rateLimitCalculation;
