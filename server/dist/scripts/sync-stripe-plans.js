"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const stripe_1 = require("../config/stripe");
async function syncStripePlans() {
    console.log("🔄 Syncing Subscription Plans with Stripe...\n");
    try {
        const stripe = (0, stripe_1.getStripe)();
        // Get all subscription plans from database
        const plans = await db_1.prisma.subscriptionPlan.findMany({
            where: { isActive: true },
        });
        console.log(`📋 Found ${plans.length} active plans in database\n`);
        for (const plan of plans) {
            console.log(`\n📦 Processing: ${plan.name}`);
            console.log(`   ID: ${plan.id}`);
            console.log(`   Price: $${plan.price}`);
            console.log(`   Billing: ${plan.billingPeriod}`);
            console.log(`   Current Stripe Price ID: ${plan.stripePriceId || "NONE"}`);
            // Check if plan already has a Stripe price ID
            if (plan.stripePriceId) {
                try {
                    // Verify the price exists in Stripe
                    const existingPrice = await stripe.prices.retrieve(plan.stripePriceId);
                    console.log(`   ✅ Stripe price exists and is ${existingPrice.active ? "active" : "inactive"}`);
                    continue;
                }
                catch (error) {
                    console.log(`   ⚠️  Stripe price not found, will create new one`);
                }
            }
            // Create product in Stripe
            console.log(`   🏗️  Creating Stripe product...`);
            const product = await stripe.products.create({
                name: plan.name,
                description: plan.description || undefined,
                metadata: {
                    planId: plan.id,
                },
            });
            console.log(`   ✅ Product created: ${product.id}`);
            // Create price in Stripe
            console.log(`   💰 Creating Stripe price...`);
            const priceData = {
                product: product.id,
                currency: "aud",
                unit_amount: Math.round(plan.price * 100), // Convert to cents
                metadata: {
                    planId: plan.id,
                },
            };
            // Set recurring or one-time based on billing period
            if (plan.billingPeriod === "ONE_TIME") {
                // One-time payment (no recurring)
            }
            else if (plan.billingPeriod === "MONTHLY") {
                priceData.recurring = {
                    interval: "month",
                };
            }
            else if (plan.billingPeriod === "YEARLY") {
                priceData.recurring = {
                    interval: "year",
                };
            }
            const price = await stripe.prices.create(priceData);
            console.log(`   ✅ Price created: ${price.id}`);
            // Update plan in database with Stripe IDs
            await db_1.prisma.subscriptionPlan.update({
                where: { id: plan.id },
                data: {
                    stripeProductId: product.id,
                    stripePriceId: price.id,
                },
            });
            console.log(`   ✅ Database updated with Stripe IDs`);
        }
        console.log("\n\n✅ All plans synced successfully!");
        console.log("\n📊 Summary:");
        const updatedPlans = await db_1.prisma.subscriptionPlan.findMany({
            where: { isActive: true },
        });
        updatedPlans.forEach((p) => {
            console.log(`   ${p.name}: ${p.stripePriceId ? "✅ Synced" : "❌ Not synced"}`);
        });
    }
    catch (error) {
        console.error("\n❌ Sync failed:");
        if (error instanceof Error) {
            console.error(`   Error: ${error.message}`);
            console.error(`   Stack: ${error.stack}`);
        }
        else {
            console.error(error);
        }
        process.exit(1);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
syncStripePlans();
