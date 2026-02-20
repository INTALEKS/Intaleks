"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
exports.config = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || (process.env.NODE_ENV === "production" ? "10000" : "4545"),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    database: {
        url: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_DATABASE_URL, // Only used for migrations
    },
    prisma: {
        cacheTtl: process.env.PRISMA_CACHE_TTL || 300, // Default 5 minutes
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
    encryption: {
        key: process.env.ENCRYPTION_KEY,
    },
    email: {
        provider: process.env.EMAIL_PROVIDER,
        fromEmail: process.env.FROM_EMAIL,
        nodemailer: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        },
        resend: {
            apiKey: process.env.RESEND_API_KEY,
        },
        mailtrap: {
            token: process.env.MAILTRAP_TOKEN,
            accountId: process.env.MAILTRAP_ACCOUNT_ID,
        },
    },
    rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS,
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || "",
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    },
};
