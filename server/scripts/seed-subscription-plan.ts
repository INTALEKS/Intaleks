import { prisma } from "../config/db";
import { BillingPeriod } from "@prisma/client";

/**
 * Seeds the One-Off subscription plan
 * This plan includes all premium features for a one-time payment of $399
 */
export async function seedSubscriptionPlan(): Promise<void> {
  try {
    // Check if the One-Off plan already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: "One-Off" },
    });

    if (existingPlan) {
      // Update existing plan to $399 if it's different
      if (existingPlan.price !== 39900) {
        await prisma.subscriptionPlan.update({
          where: { name: "One-Off" },
          data: {
            price: 39900,
            features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking"],
          },
        });
        console.log("✅ One-Off subscription plan updated to $399");
      } else {
        console.log("✅ One-Off subscription plan already exists");
      }
      return;
    }

    // Create the One-Off subscription plan
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: "One-Off",
        price: 39900, // $399.00 in cents
        billingPeriod: BillingPeriod.ONE_TIME,
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
  } catch (error) {
    console.error("❌ Error seeding subscription plan:", error);
    throw error;
  }
}
