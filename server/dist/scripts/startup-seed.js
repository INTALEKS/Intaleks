"use strict";
/**
 * Startup seed script - runs automatically when server starts
 * Only seeds missing data, skips existing records
 * Runs silently in background
 */
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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function startupSeed() {
    try {
        // Check and seed valuation multiples
        const multiplesCount = await prisma.valuationMultiple.count();
        if (multiplesCount === 0) {
            console.log("🌱 Seeding valuation multiples...");
            // Import and run the full seed
            await Promise.resolve().then(() => __importStar(require("./seed-base-multiples-raw")));
        }
        // Check and seed subscription plan
        const planExists = await prisma.subscriptionPlan.findUnique({
            where: { name: "One-Off" },
        });
        if (!planExists) {
            console.log("🌱 Seeding subscription plan...");
            await prisma.subscriptionPlan.create({
                data: {
                    name: "One-Off",
                    price: 39900,
                    billingPeriod: client_1.BillingPeriod.ONE_TIME,
                    features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking", "Unlimited Valuations", "Export to Excel/PDF"],
                    active: true,
                },
            });
        }
        // Check and seed admin user
        const adminExists = await prisma.user.findFirst({
            where: { role: client_1.UserRole.ADMIN },
        });
        if (!adminExists) {
            const email = process.env.ADMIN_EMAIL || "admin@intaleks.com";
            const password = process.env.ADMIN_PASSWORD || "Admin123!";
            const name = process.env.ADMIN_NAME || "Admin User";
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: client_1.UserRole.ADMIN,
                    termsAccepted: true,
                    termsAcceptedAt: new Date(),
                },
            });
            console.log(`🔐 Created admin user: ${email}`);
        }
    }
    catch (error) {
        console.error("⚠️  Startup seed error:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run if in development mode
if (process.env.NODE_ENV === "development") {
    startupSeed();
}
exports.default = startupSeed;
