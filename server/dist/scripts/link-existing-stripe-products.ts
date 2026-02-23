import { prisma } from "../config/db";
import { getStripe } from "../config/stripe";
import type { SubscriptionPlan } from "@prisma/client";

/**
 * This script helps you link existing Stripe products/prices to your database subscription plans
 * Run this when you've already created products in Stripe manually
 */

async function linkExistingStripeProducts() {
  console.log("🔗 Linking Existing Stripe Products to Database Plans\n");

  try {
    const stripe = getStripe();

    // Get all products from Stripe
    console.log("📦 Fetching products from Stripe...");
    const products = await stripe.products.list({ limit: 100 });
    console.log(`✅ Found ${products.data.length} products in Stripe\n`);

    // Get all prices from Stripe
    console.log("💰 Fetching prices from Stripe...");
    const prices = await stripe.prices.list({ limit: 100 });
    console.log(`✅ Found ${prices.data.length} prices in Stripe\n`);

    // Display available products and prices
    console.log("📋 Available Stripe Products:\n");
    products.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.id})`);

      // Find prices for this product
      const productPrices = prices.data.filter((p) => p.product === product.id);
      productPrices.forEach((price) => {
        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : "N/A";
        const interval = price.recurring ? ` (${price.recurring.interval})` : " (one-time)";
        console.log(`   - Price: ${price.currency.toUpperCase()} $${amount}${interval} - ID: ${price.id}`);
      });
      console.log();
    });

    // Get all subscription plans from database
    console.log("\n📋 Database Subscription Plans:\n");
    const plans: SubscriptionPlan[] = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: "asc" },
    });

    plans.forEach((plan: SubscriptionPlan, index: number) => {
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   Price: $${plan.price}`);
      console.log(`   Billing: ${plan.billingPeriod}`);
      console.log(`   Current Stripe Product ID: ${plan.stripeProductId || "NONE"}`);
      console.log(`   Current Stripe Price ID: ${plan.stripePriceId || "NONE"}`);
      console.log(`   Plan ID: ${plan.id}\n`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("📝 MANUAL LINKING INSTRUCTIONS");
    console.log("=".repeat(80));
    console.log("\nTo link a Stripe product to a database plan, run this command:\n");
    console.log("railway run npx tsx scripts/update-plan-stripe-ids.ts <PLAN_ID> <STRIPE_PRODUCT_ID> <STRIPE_PRICE_ID>\n");
    console.log("Example:");
    console.log("railway run npx tsx scripts/update-plan-stripe-ids.ts cmkbhwweu0000mnijdax7pcdi prod_xxxxx price_xxxxx\n");
  } catch (error) {
    console.error("\n❌ Error:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

linkExistingStripeProducts();
