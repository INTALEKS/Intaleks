"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const video_routes_1 = __importStar(require("./routes/video.routes"));
const forum_routes_1 = __importStar(require("./routes/forum.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const subscription_routes_1 = __importStar(require("./routes/subscription.routes"));
const valuation_routes_1 = __importDefault(require("./routes/valuation.routes"));
const valuationMultiples_routes_1 = __importStar(require("./routes/valuationMultiples.routes"));
const questionnaire_routes_1 = require("./routes/questionnaire.routes");
const payment_routes_1 = __importStar(require("./routes/payment.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const calculator_routes_1 = __importDefault(require("./routes/calculator.routes"));
const startup_seed_1 = __importDefault(require("./scripts/startup-seed"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 4545;
// Health check - BEFORE CORS middleware so Railway healthcheck works
// Must return immediately without database dependency to ensure Railway healthchecks pass
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
// Stripe webhook route - must be before express.json() to get raw body
// Requirements: 3.1, 3.7
app.use("/api/webhooks", express_1.default.raw({ type: "application/json" }), payment_routes_1.webhookRouter);
// Increase body parser limit for valuation documents and large payloads
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)()); // Add cookie parser middleware
// API Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/admin/dashboard", dashboard_routes_1.default);
app.use("/api/admin/events", event_routes_1.default);
app.use("/api/admin/videos", video_routes_1.default);
app.use("/api/admin/upload", upload_routes_1.default);
app.use("/api/admin/forum", forum_routes_1.default);
app.use("/api/admin/users", user_routes_1.default);
app.use("/api/admin/subscriptions", subscription_routes_1.default);
app.use("/api/admin/valuation-multiples", valuationMultiples_routes_1.default);
// Public/Authenticated User Routes
app.use("/api/forum", forum_routes_1.publicForumRouter);
app.use("/api/subscriptions", subscription_routes_1.publicSubscriptionRouter);
app.use("/api/videos", video_routes_1.publicVideoRouter);
app.use("/api/valuation", valuation_routes_1.default);
app.use("/api/valuation-multiples", valuationMultiples_routes_1.publicValuationMultiplesRouter);
app.use("/api/questionnaire", questionnaire_routes_1.questionnaireRouter);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/users", profile_routes_1.default);
app.use("/api/contact", contact_routes_1.default);
app.use("/api/upload", profile_routes_1.default); // For avatar uploads
app.use("/api/calculator", calculator_routes_1.default); // Calculator with server-side validation
// Test database connection
app.get("/db-test", async (req, res) => {
    try {
        await db_1.prisma.$connect();
        res.json({ database: "Connected successfully" });
    }
    catch (error) {
        res.status(500).json({ database: "Connection failed", error: error.message });
    }
});
// Handle 404 for undefined routes
app.use(errorHandler_1.notFoundHandler);
// Global error handler (must be last middleware)
app.use(errorHandler_1.errorHandler);
// Graceful shutdown
process.on("SIGINT", async () => {
    await db_1.prisma.$disconnect();
    process.exit(0);
});
app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // Auto-seed database on startup (only seeds missing data)
    if (process.env.NODE_ENV === "development") {
        await (0, startup_seed_1.default)();
    }
});
