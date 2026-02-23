"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = require("../config/stripe");
async function testStripeConnection() {
    console.log("🔍 Testing Stripe Connection...\n");
    try {
        const stripe = (0, stripe_1.getStripe)();
        console.log("✅ Stripe client initialized");
        // Test 1: List products
        console.log("\n📦 Testing: List products...");
        const products = await stripe.products.list({ limit: 3 });
        console.log(`✅ Found ${products.data.length} products`);
        products.data.forEach((p) => {
            console.log(`   - ${p.name} (${p.id})`);
        });
        // Test 2: List prices
        console.log("\n💰 Testing: List prices...");
        const prices = await stripe.prices.list({ limit: 5 });
        console.log(`✅ Found ${prices.data.length} prices`);
        prices.data.forEach((p) => {
            console.log(`   - ${p.id}: ${p.currency} ${p.unit_amount ? p.unit_amount / 100 : "N/A"}`);
        });
        // Test 3: List webhook endpoints
        console.log("\n🔗 Testing: List webhook endpoints...");
        const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
        console.log(`✅ Found ${webhooks.data.length} webhook endpoints`);
        webhooks.data.forEach((w) => {
            console.log(`   - ${w.url}`);
            console.log(`     Status: ${w.status}`);
            console.log(`     Events: ${w.enabled_events.join(", ")}`);
        });
        console.log("\n✅ All Stripe tests passed!");
    }
    catch (error) {
        console.error("\n❌ Stripe test failed:");
        if (error instanceof Error) {
            console.error(`   Error: ${error.message}`);
            console.error(`   Stack: ${error.stack}`);
        }
        else {
            console.error(error);
        }
        process.exit(1);
    }
}
testStripeConnection();
