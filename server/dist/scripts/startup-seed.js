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
const stripe_1 = __importDefault(require("stripe"));
const prisma = new client_1.PrismaClient();
async function ensureStripePlan(plan) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        console.warn("⚠️  STRIPE_SECRET_KEY not set — skipping Stripe product sync");
        return;
    }
    const stripe = new stripe_1.default(stripeKey);
    // Create Stripe product
    const product = await stripe.products.create({
        name: plan.name,
        metadata: { planId: plan.id },
    });
    // Create Stripe price
    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: "usd",
        ...(plan.billingPeriod === client_1.BillingPeriod.MONTHLY && { recurring: { interval: "month" } }),
        ...(plan.billingPeriod === client_1.BillingPeriod.YEARLY && { recurring: { interval: "year" } }),
        // ONE_TIME has no recurring
    });
    // Store IDs back to DB
    await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: { stripeProductId: product.id, stripePriceId: price.id },
    });
    console.log(`✅ Stripe product+price created for plan "${plan.name}": ${price.id}`);
}
async function startupSeed() {
    try {
        // Check and seed valuation multiples (skip if already seeded)
        const multiplesCount = await prisma.valuationMultiple.count();
        if (multiplesCount === 0) {
            console.log("🌱 Seeding valuation multiples...");
            await Promise.resolve().then(() => __importStar(require("./seed-base-multiples-raw")));
        }
        else {
            console.log(`✅ Valuation multiples already seeded (${multiplesCount} records) - skipping`);
        }
        // Check and seed subscription plan
        let plan = await prisma.subscriptionPlan.findUnique({ where: { name: "One-Off" } });
        const planFeatures = ["Worldwide Industry Multiples (US, Canada, UK, Australia, China, Indonesia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking", "Unlimited Valuations", "Export to PDF"];
        if (!plan) {
            console.log("🌱 Seeding subscription plan...");
            plan = await prisma.subscriptionPlan.create({
                data: {
                    name: "One-Off",
                    price: 49500,
                    billingPeriod: client_1.BillingPeriod.ONE_TIME,
                    features: planFeatures,
                    active: true,
                },
            });
        }
        else {
            // Always keep features in sync
            plan = await prisma.subscriptionPlan.update({
                where: { name: "One-Off" },
                data: { features: planFeatures },
            });
            console.log("✅ Subscription plan already exists - updated features");
        }
        // Sync Stripe product/price if missing
        if (!plan.stripePriceId) {
            console.log("🔗 Linking plan to Stripe...");
            await ensureStripePlan(plan);
        }
        else {
            console.log(`✅ Stripe already configured (Price ID: ${plan.stripePriceId}) - skipping`);
        }
        // Check and seed super admin user
        const email = process.env.ADMIN_EMAIL || "admin@intaleks.com";
        const password = process.env.ADMIN_PASSWORD || "Admin123!";
        const firstName = process.env.ADMIN_FIRST_NAME || "Admin";
        const lastName = process.env.ADMIN_LAST_NAME || "User";
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role: client_1.UserRole.SUPER_ADMIN,
                    termsAccepted: true,
                    termsAcceptedAt: new Date(),
                },
            });
            console.log(`🔐 Created super admin user: ${email}`);
        }
        else if (existingUser.role !== client_1.UserRole.SUPER_ADMIN) {
            await prisma.user.update({ where: { email }, data: { role: client_1.UserRole.SUPER_ADMIN } });
            console.log(`🔐 Upgraded existing user to super admin: ${email}`);
        }
        else {
            console.log(`✅ Super admin user already exists: ${email} - skipping`);
        }
    }
    catch (error) {
        console.error("⚠️  Startup seed error:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
exports.default = startupSeed;
