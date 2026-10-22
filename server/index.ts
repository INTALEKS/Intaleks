import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { prisma } from "./config/db";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import eventRoutes from "./routes/event.routes";
import uploadRoutes from "./routes/upload.routes";
import videoRoutes, { publicVideoRouter } from "./routes/video.routes";
import forumRoutes, { publicForumRouter } from "./routes/forum.routes";
import userRoutes from "./routes/user.routes";
import subscriptionRoutes, { publicSubscriptionRouter } from "./routes/subscription.routes";
import valuationRoutes from "./routes/valuation.routes";
import valuationMultiplesAdminRoutes, { publicValuationMultiplesRouter } from "./routes/valuationMultiples.routes";
import { questionnaireRouter } from "./routes/questionnaire.routes";
import paymentRoutes, { webhookRouter } from "./routes/payment.routes";
import invoiceRoutes from "./routes/invoice.routes";
import profileRoutes from "./routes/profile.routes";
import contactRoutes from "./routes/contact.routes";
import calculatorRoutes from "./routes/calculator.routes";
import affiliateAdminRoutes from "./routes/affiliateAdmin.routes";
import userAffiliateRoutes from "./routes/userAffiliate.routes";
import { couponRouter, adminCouponRouter } from "./routes/coupon.routes";
import referralRoutes from "./routes/referral.routes";
import referralAdminRoutes from "./routes/referralAdmin.routes";
import startupSeed from "./scripts/startup-seed";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4545;

// Trust proxy for Railway deployment (enables proper IP detection behind reverse proxy)
app.set("trust proxy", true);

// Health check - BEFORE CORS and Helmet middleware so health check probes work cleanly
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Configure Helmet security headers
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.error(`[CORS Error] Origin '${origin}' is not allowed. Allowed origins:`, allowedOrigins);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    exposedHeaders: ["X-Valuation-Document-Id"],
  }),
);

// Stripe webhook route - must be before express.json() to get raw body
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRouter);

// Increase body parser limit for valuation documents and large payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // Add cookie parser middleware

// Rate Limiting Middlewares
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login/registration attempts, please try again after 15 minutes.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please slow down.",
  },
});

// Apply rate limiting to credential / password reset endpoints
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

// Apply global rate limiting to all standard APIs (Stripe webhooks are already handled and exempt)
app.use("/api", apiLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/events", eventRoutes);
app.use("/api/admin/videos", videoRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/admin/forum", forumRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/subscriptions", subscriptionRoutes);
app.use("/api/admin/valuation-multiples", valuationMultiplesAdminRoutes);

// Public/Authenticated User Routes
app.use("/api/forum", publicForumRouter);
app.use("/api/subscriptions", publicSubscriptionRouter);
app.use("/api/videos", publicVideoRouter);
app.use("/api/valuation", valuationRoutes);
app.use("/api/valuation-multiples", publicValuationMultiplesRouter);
app.use("/api/questionnaire", questionnaireRouter);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", profileRoutes); // For avatar uploads
app.use("/api/calculator", calculatorRoutes); // Calculator with server-side validation
app.use("/api/coupons", couponRouter); // User coupon redemption
app.use("/api/admin/coupons", adminCouponRouter); // Super Admin coupon management
app.use("/api/admin/affiliate", affiliateAdminRoutes);
app.use("/api/users/affiliate", userAffiliateRoutes);
app.use("/api/admin/referrals", referralAdminRoutes);
app.use("/api/users/referral", referralRoutes);

// Test database connection - Disabled in production for diagnostics security
app.get("/db-test", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Database diagnostics are disabled in production mode.",
    });
  }
  try {
    await prisma.$connect();
    res.json({ database: "Connected successfully" });
  } catch (error: any) {
    res.status(500).json({ database: "Connection failed", error: error.message });
  }
});

// Handle 404 for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Auto-seed database on startup (seeds missing data and syncs existing records)
  await startupSeed();
});
