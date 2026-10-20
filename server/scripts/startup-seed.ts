/**
 * Startup seed script - runs automatically when server starts
 * Only seeds missing data, skips existing records
 * Runs silently in background
 */

import { PrismaClient, UserRole, BillingPeriod } from "@prisma/client";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import { StripeSyncService } from "../services/stripe-sync";

const prisma = new PrismaClient();

async function ensureStripePlan(plan: {
  id: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
}): Promise<void> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.warn("⚠️  STRIPE_SECRET_KEY not set — skipping Stripe product sync");
    return;
  }

  const stripe = new Stripe(stripeKey);

  const createPrice = async (productId: string) =>
    stripe.prices.create({
      product: productId,
      unit_amount: plan.price,
      currency: "aud",
      ...(plan.billingPeriod === BillingPeriod.MONTHLY && { recurring: { interval: "month" } }),
      ...(plan.billingPeriod === BillingPeriod.YEARLY && { recurring: { interval: "year" } }),
      // ONE_TIME has no recurring
    });

  if (plan.stripePriceId && plan.stripeProductId) {
    try {
      const existingPrice = await stripe.prices.retrieve(plan.stripePriceId);
      if (existingPrice.active && existingPrice.unit_amount === plan.price) {
        console.log(`✅ Stripe price already matches plan "${plan.name}"`);
        return;
      }

      // Stripe prices are immutable: archive the old price and replace it on
      // the existing product so checkout always uses the database amount.
      await stripe.prices.update(plan.stripePriceId, { active: false });
      const replacementPrice = await createPrice(plan.stripeProductId);
      await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: { stripePriceId: replacementPrice.id },
      });
      console.log(`✅ Stripe price updated for plan "${plan.name}": ${replacementPrice.id}`);
      return;
    } catch (error) {
      console.warn(`⚠️  Could not verify existing Stripe price for "${plan.name}", creating a replacement`, error);
    }
  }

  // Create a Stripe product only when the plan has not been linked before.
  const product = await stripe.products.create({ name: plan.name, metadata: { planId: plan.id } });
  const price = await createPrice(product.id);

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

    // Migrate the legacy one-off plan and keep only the $495 retail plan active.
    let plan = await prisma.subscriptionPlan.findUnique({ where: { name: "2 Months Access" } });

    const planFeatures = ["Worldwide Industry Multiples (US, Canada, UK, Australia, China, Indonesia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking", "Unlimited Valuations", "Export to PDF"];

    const legacyPlan = await prisma.subscriptionPlan.findUnique({ where: { name: "One-Off" } });
    if (!plan) {
      if (legacyPlan) {
        console.log("🔄 Migrating legacy One-Off plan to 2 Months Access...");
        plan = await prisma.subscriptionPlan.update({
          where: { id: legacyPlan.id },
          data: {
            name: "2 Months Access",
            price: 49500,
            billingPeriod: BillingPeriod.ONE_TIME,
            features: planFeatures,
            active: true,
          },
        });
      } else {
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
      }
    } else if (legacyPlan?.active) {
      // Keep historic data intact, but never expose the retired plan at
      // checkout once the current two-month plan exists.
      await prisma.subscriptionPlan.update({ where: { id: legacyPlan.id }, data: { active: false } });
      console.log("✅ Retired legacy One-Off subscription plan");
    } else {
      // Always keep features in sync
      plan = await prisma.subscriptionPlan.update({
        where: { name: "2 Months Access" },
        data: { features: planFeatures },
      });
      console.log("✅ Subscription plan already exists - updated features");
    }

    // Keep Stripe aligned with the plan details; this is safe to run at startup.
    await ensureStripePlan(plan);

    for (const planName of ["6 Months Access", "12 Months Access"]) {
      const retiredPlan = await prisma.subscriptionPlan.findUnique({ where: { name: planName } });
      if (!retiredPlan) continue;

      if (retiredPlan.active) {
        await prisma.subscriptionPlan.update({
          where: { id: retiredPlan.id },
          data: { active: false },
        });

        if (process.env.STRIPE_SECRET_KEY && retiredPlan.stripeProductId) {
          try {
            await StripeSyncService.archiveProduct(retiredPlan.stripeProductId, retiredPlan.stripePriceId ?? undefined);
          } catch (error) {
            // The inactive DB flag and checkout guard still prevent new purchases.
            console.error(`⚠️  Failed to archive retired Stripe plan "${planName}":`, error);
          }
        }
      }

      console.log(`✅ Retired subscription plan: ${planName}`);
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
