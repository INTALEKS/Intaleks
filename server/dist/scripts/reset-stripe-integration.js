"use strict";
/**
 * Script to reset Stripe integration
 * Clears old Stripe IDs and creates new product/price
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
const stripe_1 = __importDefault(require("stripe"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🔄 Resetting Stripe integration...\n");
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error("❌ STRIPE_SECRET_KEY not found");
        process.exit(1);
    }
    const stripe = new stripe_1.default(stripeSecretKey, {
        apiVersion: "2026-02-25.clover",
    });
    // Find the One-Off plan
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { name: "One-Off" },
    });
    if (!plan) {
        console.error("❌ One-Off plan not found");
        process.exit(1);
    }
    console.log("📋 Current plan:");
    console.log(`   Name: ${plan.name}`);
    console.log(`   Price: AUD $${(plan.price / 100).toFixed(2)}`);
    console.log(`   Stripe Product ID: ${plan.stripeProductId || "None"}`);
    console.log(`   Stripe Price ID: ${plan.stripePriceId || "None"}`);
    // Clear old Stripe IDs
    console.log("\n🧹 Clearing old Stripe IDs...");
    await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: {
            stripeProductId: null,
            stripePriceId: null,
        },
    });
    console.log("✅ Cleared old Stripe IDs");
    // Create new Stripe product
    console.log("\n📦 Creating new Stripe product...");
    const product = await stripe.products.create({
        name: "Business Valuation - One-Off",
        description: "Complete business valuation with worldwide industry multiples, professional PDF report, and comprehensive assessment tools",
        metadata: {
            planId: plan.id,
            planName: plan.name,
        },
    });
    console.log(`✅ Created product: ${product.id}`);
    // Create new Stripe price
    console.log("\n💰 Creating new Stripe price...");
    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: "aud",
        metadata: {
            planId: plan.id,
            planName: plan.name,
        },
    });
    console.log(`✅ Created price: ${price.id}`);
    console.log(`   Amount: AUD $${(price.unit_amount / 100).toFixed(2)}`);
    // Update plan with new Stripe IDs
    console.log("\n💾 Updating subscription plan...");
    await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: {
            stripeProductId: product.id,
            stripePriceId: price.id,
        },
    });
    console.log("✅ Updated subscription plan");
    console.log("\n🎉 Stripe integration reset complete!");
    console.log("\n📋 New IDs:");
    console.log(`   Product: ${product.id}`);
    console.log(`   Price: ${price.id}`);
}
main()
    .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
