"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
/**
 * Updates the One-Off subscription plan features
 * - Removes "10+ Industry Categories"
 * - Changes "Industry-Specific Multiples" to "Worldwide Industry Multiples (US, Canada, UK, Australia)"
 * - Adds "Business Assessment Survey"
 */
async function updateSubscriptionFeatures() {
    try {
        // Find the One-Off plan
        const plan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { name: "One-Off" },
        });
        if (!plan) {
            console.log("❌ One-Off subscription plan not found");
            return;
        }
        // Update the features
        const updatedPlan = await db_1.prisma.subscriptionPlan.update({
            where: { id: plan.id },
            data: {
                features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking"],
            },
        });
        console.log("✅ Subscription plan features updated successfully:");
        console.log("Old features:", plan.features);
        console.log("New features:", updatedPlan.features);
    }
    catch (error) {
        console.error("❌ Error updating subscription plan features:", error);
        throw error;
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
// Run the update
updateSubscriptionFeatures();
