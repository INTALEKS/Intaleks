# Stripe Product Linking Guide

## Problem

Your payment checkout is failing with error: `STRIPE_CHECKOUT_SESSION_FAILED`

This happens because your database subscription plans don't have Stripe product/price IDs linked to them.

## Solution

Follow these 2 steps to link your manually created Stripe products to your database plans:

### Step 1: View Available Products and Plans

Run this command to see all your Stripe products and database plans:

```bash
railway run npx tsx scripts/link-existing-stripe-products.ts
```

This will display:

- All products in your Stripe account with their Product IDs and Price IDs
- All subscription plans in your database with their Plan IDs
- Current linking status (which plans are already linked)

### Step 2: Link Each Plan

For each subscription plan, run this command to link it to a Stripe product:

```bash
railway run npx tsx scripts/update-plan-stripe-ids.ts <PLAN_ID> <STRIPE_PRODUCT_ID> <STRIPE_PRICE_ID>
```

**Example:**

```bash
railway run npx tsx scripts/update-plan-stripe-ids.ts cmkbhwweu0000mnijdax7pcdi prod_RAbcXYZ123 price_1AbcXYZ123
```

Replace:

- `<PLAN_ID>` - The ID from your database plan (shown in Step 1)
- `<STRIPE_PRODUCT_ID>` - The product ID from Stripe (starts with `prod_`)
- `<STRIPE_PRICE_ID>` - The price ID from Stripe (starts with `price_`)

### Step 3: Verify

After linking all plans, test the payment flow:

1. Go to your frontend: https://intaleks.vercel.app
2. Select a subscription plan
3. Click checkout
4. You should now be redirected to Stripe checkout page

## Important Notes

- You need to link ALL subscription plans that users can purchase
- Make sure the price in Stripe matches the price in your database
- The currency should be AUD (Australian Dollars)
- Billing period should match (monthly/yearly)

## Troubleshooting

If you still get errors after linking:

1. Verify the Stripe product is active (not archived)
2. Verify the Stripe price is active
3. Check that the price currency is AUD
4. Ensure the billing interval matches (month/year)
