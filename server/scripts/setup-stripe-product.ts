/**
 * Script to create Stripe product and price for the One-Off subscription plan
 * Run this once to set up Stripe integration
 */

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Setting up Stripe product and price...\n");

  // Check if Stripe is configured
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error("❌ STRIPE_SECRET_KEY not found in environment variables");
    console.log("\nPlease set STRIPE_SECRET_KEY in your .env file or Railway environment variables");
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    // Find the One-Off subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { name: "One-Off" },
    });

    if (!plan) {
      console.error("❌ One-Off subscription plan not found in database");
      console.log("Please run the seed script first: npm run db:seed:prod");
      process.exit(1);
    }

    console.log("✅ Found One-Off plan in database");
    console.log(`   Price: AUD $${(plan.price / 100).toFixed(2)}`);
    console.log(`   Features: ${plan.features.length}`);

    // Check if plan already has a Stripe price ID
    if (plan.stripePriceId) {
      console.log(`\n⚠️  Plan already has Stripe price ID: ${plan.stripePriceId}`);
      console.log("   Verifying it exists in Stripe...");

      try {
        const existingPrice = await stripe.prices.retrieve(plan.stripePriceId);
        console.log("✅ Stripe price exists and is valid");
        console.log(`   Product: ${existingPrice.product}`);
        console.log(`   Amount: ${existingPrice.currency.toUpperCase()} $${(existingPrice.unit_amount! / 100).toFixed(2)}`);
        console.log("\n✅ Setup complete - no changes needed");
        return;
      } catch (error) {
        console.log("⚠️  Stripe price not found, creating new one...");
      }
    }

    // Create Stripe product
    console.log("\n📦 Creating Stripe product...");
    const product = await stripe.products.create({
      name: "Business Valuation - One-Off",
      description: "Complete business valuation with worldwide industry multiples, professional PDF report, and comprehensive assessment tools",
      metadata: {
        planId: plan.id,
        planName: plan.name,
      },
    });

    console.log(`✅ Created Stripe product: ${product.id}`);

    // Create Stripe price (one-time payment)
    console.log("\n💰 Creating Stripe price...");
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price, // Amount in cents
      currency: "aud",
      metadata: {
        planId: plan.id,
        planName: plan.name,
      },
    });

    console.log(`✅ Created Stripe price: ${price.id}`);
    console.log(`   Amount: AUD $${(price.unit_amount! / 100).toFixed(2)}`);

    // Update subscription plan with Stripe IDs
    console.log("\n💾 Updating subscription plan in database...");
    await prisma.subscriptionPlan.update({
      where: { id: plan.id },
      data: {
        stripeProductId: product.id,
        stripePriceId: price.id,
      },
    });

    console.log("✅ Updated subscription plan with Stripe IDs");

    console.log("\n🎉 Setup complete!");
    console.log("\n📋 Summary:");
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Price ID: ${price.id}`);
    console.log(`   Amount: AUD $${(price.unit_amount! / 100).toFixed(2)}`);
    console.log("\n✅ Your payment system is now ready to accept payments!");
  } catch (error) {
    console.error("\n❌ Error setting up Stripe:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
