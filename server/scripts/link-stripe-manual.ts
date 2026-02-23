import { PrismaClient } from "@prisma/client";

/**
 * Manual script to link Stripe product/price IDs to a subscription plan
 * Run with: npx tsx scripts/link-stripe-manual.ts
 */

const prisma = new PrismaClient();

async function linkStripeIds() {
  console.log("🔗 Manual Stripe Product Linking\n");

  // EDIT THESE VALUES WITH YOUR ACTUAL IDS:
  const PLAN_ID = "cmlzb221k000013zmq6imdeg4";
  const STRIPE_PRODUCT_ID = "prod_U247EW98vZNZOD";
  const STRIPE_PRICE_ID = "price_1T3zzdS5cU5QRxLeBXZUIx7H";

  // Validation
  if (PLAN_ID === "YOUR_PLAN_ID_HERE" || STRIPE_PRODUCT_ID === "YOUR_STRIPE_PRODUCT_ID_HERE" || STRIPE_PRICE_ID === "YOUR_STRIPE_PRICE_ID_HERE") {
    console.error("❌ Error: Please edit this file and replace the placeholder IDs with your actual IDs");
    console.log("\nEdit server/scripts/link-stripe-manual.ts and update:");
    console.log("  - PLAN_ID");
    console.log("  - STRIPE_PRODUCT_ID");
    console.log("  - STRIPE_PRICE_ID");
    process.exit(1);
  }

  try {
    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: PLAN_ID },
    });

    if (!plan) {
      console.error(`❌ Plan with ID ${PLAN_ID} not found`);
      console.log("\nAvailable plans:");
      const allPlans = await prisma.subscriptionPlan.findMany();
      allPlans.forEach((p) => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
      });
      process.exit(1);
    }

    console.log(`✅ Found plan: ${plan.name}`);
    console.log(`   Current Price: $${plan.price}`);
    console.log(`   Billing: ${plan.billingPeriod}\n`);

    // Update plan with Stripe IDs
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: PLAN_ID },
      data: {
        stripeProductId: STRIPE_PRODUCT_ID,
        stripePriceId: STRIPE_PRICE_ID,
      },
    });

    console.log("✅ Successfully linked Stripe product to plan!\n");
    console.log("Updated Plan Details:");
    console.log(`  Name: ${updatedPlan.name}`);
    console.log(`  Price: $${updatedPlan.price}`);
    console.log(`  Billing: ${updatedPlan.billingPeriod}`);
    console.log(`  Stripe Product ID: ${updatedPlan.stripeProductId}`);
    console.log(`  Stripe Price ID: ${updatedPlan.stripePriceId}`);
    console.log("\n✅ Payment checkout should now work!");
  } catch (error) {
    console.error("\n❌ Update failed:");
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

linkStripeIds();
