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
    currency: "aud",
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
    // Check and seed valuation multiples (skip if already seeded)
    const multiplesCount = await prisma.valuationMultiple.count();
    if (multiplesCount === 0) {
      console.log("🌱 Seeding valuation multiples...");
      await import("./seed-base-multiples-raw");
    } else {
      console.log(`✅ Valuation multiples already seeded (${multiplesCount} records) - skipping`);
    }

    // Check and seed the one-time access plans.
    let plan = await prisma.subscriptionPlan.findUnique({ where: { name: "2 Months Access" } });

    const planFeatures = ["Worldwide Industry Multiples (US, Canada, UK, Australia, China, Indonesia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking", "Unlimited Valuations", "Export to PDF"];

    if (!plan) {
      console.log("🌱 Seeding subscription plan...");
      plan = await prisma.subscriptionPlan.create({
        data: {
          name: "2 Months Access",
          price: 49500,
          billingPeriod: BillingPeriod.ONE_TIME,
          features: planFeatures,
          active: true,
        },
      });
    } else {
      // Always keep features in sync
      plan = await prisma.subscriptionPlan.update({
        where: { name: "2 Months Access" },
        data: { features: planFeatures },
      });
      console.log("✅ Subscription plan already exists - updated features");
    }

    // Sync Stripe product/price if missing
    if (!plan.stripePriceId) {
      console.log("🔗 Linking plan to Stripe...");
      await ensureStripePlan(plan);
    } else {
      console.log(`✅ Stripe already configured (Price ID: ${plan.stripePriceId}) - skipping`);
    }

    for (const accessPlan of [
      { name: "6 Months Access", price: 69500 },
      { name: "12 Months Access", price: 99500 },
    ]) {
      const existing = await prisma.subscriptionPlan.upsert({
        where: { name: accessPlan.name },
        create: { ...accessPlan, billingPeriod: BillingPeriod.ONE_TIME, features: planFeatures, active: true },
        update: { features: planFeatures, active: true },
      });
      if (!existing.stripePriceId) await ensureStripePlan(existing);
    }

    // Check and seed super admin user
    const email = process.env.ADMIN_EMAIL || "admin@intaleks.com";
    const password = process.env.ADMIN_PASSWORD || "Admin123!";
    const firstName = process.env.ADMIN_FIRST_NAME || "Admin";
    const lastName = process.env.ADMIN_LAST_NAME || "User";

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: UserRole.SUPER_ADMIN,
          termsAccepted: true,
          termsAcceptedAt: new Date(),
        },
      });
      console.log(`🔐 Created super admin user: ${email}`);
    } else if (existingUser.role !== UserRole.SUPER_ADMIN) {
      await prisma.user.update({ where: { email }, data: { role: UserRole.SUPER_ADMIN } });
      console.log(`🔐 Upgraded existing user to super admin: ${email}`);
    } else {
      console.log(`✅ Super admin user already exists: ${email} - skipping`);
    }
  } catch (error) {
    console.error("⚠️  Startup seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export default startupSeed;
