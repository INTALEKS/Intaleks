import { prisma } from "../config/db";

/**
 * Update a subscription plan with Stripe product and price IDs
 * Usage: npx tsx scripts/update-plan-stripe-ids.ts <PLAN_ID> <STRIPE_PRODUCT_ID> <STRIPE_PRICE_ID>
 */

async function updatePlanStripeIds() {
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.error("❌ Invalid arguments");
    console.log("\nUsage: npx tsx scripts/update-plan-stripe-ids.ts <PLAN_ID> <STRIPE_PRODUCT_ID> <STRIPE_PRICE_ID>");
    console.log("\nExample:");
    console.log("npx tsx scripts/update-plan-stripe-ids.ts cmkbhwweu0000mnijdax7pcdi prod_xxxxx price_xxxxx");
    process.exit(1);
  }

  const [planId, stripeProductId, stripePriceId] = args;

  console.log("🔗 Updating Subscription Plan with Stripe IDs\n");
  console.log(`Plan ID: ${planId}`);
  console.log(`Stripe Product ID: ${stripeProductId}`);
  console.log(`Stripe Price ID: ${stripePriceId}\n`);

  try {
    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error(`❌ Plan with ID ${planId} not found`);
      process.exit(1);
    }

    console.log(`✅ Found plan: ${plan.name}\n`);

    // Update plan with Stripe IDs
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        stripeProductId,
        stripePriceId,
      },
    });

    console.log("✅ Plan updated successfully!\n");
    console.log("Updated Plan Details:");
    console.log(`  Name: ${updatedPlan.name}`);
    console.log(`  Price: $${updatedPlan.price}`);
    console.log(`  Billing: ${updatedPlan.billingPeriod}`);
    console.log(`  Stripe Product ID: ${updatedPlan.stripeProductId}`);
    console.log(`  Stripe Price ID: ${updatedPlan.stripePriceId}`);
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

updatePlanStripeIds();
