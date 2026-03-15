/**
 * Startup seed script - runs automatically when server starts
 * Only seeds missing data, skips existing records
 * Runs silently in background
 */

import { PrismaClient, UserRole, BillingPeriod } from "@prisma/client";
import bcrypt from "bcrypt";
import Stripe from "stripe";

const prisma = new PrismaClient();

async function ensureStripePlan(plan: { id: string; name: string; price: number; billingPeriod: BillingPeriod }): Promise<void> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.warn("⚠️  STRIPE_SECRET_KEY not set — skipping Stripe product sync");
    return;
  }

  const stripe = new Stripe(stripeKey);

  // Create Stripe product
  const product = await stripe.products.create({
    name: plan.name,
    metadata: { planId: plan.id },
  });

  // Create Stripe price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.price,
    currency: "usd",
    ...(plan.billingPeriod === BillingPeriod.MONTHLY && { recurring: { interval: "month" } }),
    ...(plan.billingPeriod === BillingPeriod.YEARLY && { recurring: { interval: "year" } }),
    // ONE_TIME has no recurring
  });

  // Store IDs back to DB
  await prisma.subscriptionPlan.update({
    where: { id: plan.id },
    data: { stripeProductId: product.id, stripePriceId: price.id },
  });

  console.log(`✅ Stripe product+price created for plan "${plan.name}": ${price.id}`);
}

async function startupSeed() {
  try {
    // Check and seed valuation multiples
    const multiplesCount = await prisma.valuationMultiple.count();
    if (multiplesCount === 0) {
      console.log("🌱 Seeding valuation multiples...");
      await import("./seed-base-multiples-raw");
    }

    // Check and seed subscription plan
    let plan = await prisma.subscriptionPlan.findUnique({ where: { name: "One-Off" } });

    if (!plan) {
      console.log("🌱 Seeding subscription plan...");
      plan = await prisma.subscriptionPlan.create({
        data: {
          name: "One-Off",
          price: 49500,
          billingPeriod: BillingPeriod.ONE_TIME,
          features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking", "Unlimited Valuations", "Export to Excel/PDF"],
          active: true,
        },
      });
    }

    // Sync Stripe product/price if missing
    if (!plan.stripePriceId) {
      console.log("🔗 Linking plan to Stripe...");
      await ensureStripePlan(plan);
    }

    // Check and seed admin user
    const email = process.env.ADMIN_EMAIL || "admin@intaleks.com";
    const password = process.env.ADMIN_PASSWORD || "Admin123!";
    const firstName = process.env.ADMIN_FIRST_NAME || "Admin";
    const lastName = process.env.ADMIN_LAST_NAME || "User";

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      const adminExists = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: UserRole.ADMIN,
            termsAccepted: true,
            termsAcceptedAt: new Date(),
          },
        });
        console.log(`🔐 Created admin user: ${email}`);
      }
    } else if (existingUser.role !== UserRole.ADMIN) {
      await prisma.user.update({ where: { email }, data: { role: UserRole.ADMIN } });
      console.log(`🔐 Upgraded existing user to admin: ${email}`);
    }
  } catch (error) {
    console.error("⚠️  Startup seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export default startupSeed;
