import { prisma } from "../config/db";
import { BillingPeriod } from "@prisma/client";

/**
 * Seeds the One-Off subscription plan only
 * AUD $399 one-time payment with full features
 */
export async function seedSubscriptionPlan(): Promise<void> {
  try {
    // Delete the free plan if it exists
    const freePlan = await prisma.subscriptionPlan.findUnique({
      where: { name: "Free" },
    });

    if (freePlan) {
      await prisma.subscriptionPlan.delete({
        where: { name: "Free" },
      });
      console.log("✅ Removed Free plan");
    }

    // Check if the One-Off plan already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: "One-Off" },
    });

    const planData = {
      price: 39900, // AUD $399.00 in cents
      billingPeriod: BillingPeriod.ONE_TIME,
      features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking"],
      active: true,
    };

    if (existingPlan) {
      // Update existing plan
      await prisma.subscriptionPlan.update({
        where: { name: "One-Off" },
        data: planData,
      });
      console.log("✅ One-Off subscription plan updated to AUD $399");
    } else {
      // Create the One-Off subscription plan
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name: "One-Off",
          ...planData,
        },
      });
      console.log("✅ One-Off subscription plan created successfully:", {
        id: plan.id,
        name: plan.name,
        price: `AUD $${(plan.price / 100).toFixed(2)}`,
        features: plan.features.length + " features",
      });
    }
  } catch (error) {
    console.error("❌ Error seeding subscription plan:", error);
    throw error;
  }
}
