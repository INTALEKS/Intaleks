import { prisma } from "../config/db";
import { BillingPeriod } from "@prisma/client";

/**
 * Seeds the One-Off subscription plan only
 * AUD $495 one-time payment with full features
 */
export async function seedSubscriptionPlan(): Promise<void> {
  try {
    // Check if the One-Off plan already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: "One-Off" },
    });

    const planData = {
      price: 49500, // AUD $495.00 in cents
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
      console.log("✅ One-Off subscription plan updated to AUD $495");
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
