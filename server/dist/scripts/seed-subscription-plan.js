"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSubscriptionPlan = seedSubscriptionPlan;
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
/**
 * Seeds the One-Off subscription plan
 * This plan includes all premium features for a one-time payment of $399
 */
async function seedSubscriptionPlan() {
    try {
        // Check if the One-Off plan already exists
        const existingPlan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { name: "One-Off" },
        });
        if (existingPlan) {
            // Update existing plan to $399 if it's different
            if (existingPlan.price !== 39900) {
                await db_1.prisma.subscriptionPlan.update({
                    where: { name: "One-Off" },
                    data: {
                        price: 39900,
                        features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking"],
                    },
                });
                console.log("✅ One-Off subscription plan updated to $399");
            }
            else {
                console.log("✅ One-Off subscription plan already exists");
            }
            return;
        }
        // Create the One-Off subscription plan
        const plan = await db_1.prisma.subscriptionPlan.create({
            data: {
                name: "One-Off",
                price: 39900, // $399.00 in cents
                billingPeriod: client_1.BillingPeriod.ONE_TIME,
                features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking"],
                active: true,
            },
        });
        console.log("✅ One-Off subscription plan created successfully:", {
            id: plan.id,
            name: plan.name,
            price: `$${(plan.price / 100).toFixed(2)}`,
            features: plan.features.length + " features",
        });
    }
    catch (error) {
        console.error("❌ Error seeding subscription plan:", error);
        throw error;
    }
}
