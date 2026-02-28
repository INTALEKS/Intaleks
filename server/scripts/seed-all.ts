/**
 * Comprehensive seed script for Intaleks
 * Seeds all necessary data and skips existing records
 * Safe to run multiple times - idempotent
 */

import { PrismaClient, UserRole, BillingPeriod } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface BaseMultiple {
  country: string;
  industry: string;
  scoreRange: string;
  multiple: number;
}

// Base multiples data
const baseMultiples: BaseMultiple[] = [
  // Australia
  { country: "australia", industry: "construction", scoreRange: "40-50", multiple: 3.0 },
  { country: "australia", industry: "construction", scoreRange: "30-39", multiple: 2.4 },
  { country: "australia", industry: "construction", scoreRange: "20-29", multiple: 1.5 },
  { country: "australia", industry: "construction", scoreRange: "<20", multiple: 0.9 },
  { country: "australia", industry: "finance", scoreRange: "40-50", multiple: 5.0 },
  { country: "australia", industry: "finance", scoreRange: "30-39", multiple: 4.0 },
  { country: "australia", industry: "finance", scoreRange: "20-29", multiple: 2.5 },
  { country: "australia", industry: "finance", scoreRange: "<20", multiple: 1.5 },
  { country: "australia", industry: "healthcare", scoreRange: "40-50", multiple: 5.0 },
  { country: "australia", industry: "healthcare", scoreRange: "30-39", multiple: 4.0 },
  { country: "australia", industry: "healthcare", scoreRange: "20-29", multiple: 2.5 },
  { country: "australia", industry: "healthcare", scoreRange: "<20", multiple: 1.5 },
  { country: "australia", industry: "hospitality", scoreRange: "40-50", multiple: 2.25 },
  { country: "australia", industry: "hospitality", scoreRange: "30-39", multiple: 1.8 },
  { country: "australia", industry: "hospitality", scoreRange: "20-29", multiple: 1.125 },
  { country: "australia", industry: "hospitality", scoreRange: "<20", multiple: 0.675 },
  { country: "australia", industry: "manufacturing", scoreRange: "40-50", multiple: 4.0 },
  { country: "australia", industry: "manufacturing", scoreRange: "30-39", multiple: 3.2 },
  { country: "australia", industry: "manufacturing", scoreRange: "20-29", multiple: 2.0 },
  { country: "australia", industry: "manufacturing", scoreRange: "<20", multiple: 1.2 },
  { country: "australia", industry: "professional", scoreRange: "40-50", multiple: 3.0 },
  { country: "australia", industry: "professional", scoreRange: "30-39", multiple: 2.4 },
  { country: "australia", industry: "professional", scoreRange: "20-29", multiple: 1.5 },
  { country: "australia", industry: "professional", scoreRange: "<20", multiple: 0.9 },
  { country: "australia", industry: "retail", scoreRange: "40-50", multiple: 3.0 },
  { country: "australia", industry: "retail", scoreRange: "30-39", multiple: 2.4 },
  { country: "australia", industry: "retail", scoreRange: "20-29", multiple: 1.5 },
  { country: "australia", industry: "retail", scoreRange: "<20", multiple: 0.9 },
  { country: "australia", industry: "service", scoreRange: "40-50", multiple: 2.0 },
  { country: "australia", industry: "service", scoreRange: "30-39", multiple: 1.6 },
  { country: "australia", industry: "service", scoreRange: "20-29", multiple: 1.0 },
  { country: "australia", industry: "service", scoreRange: "<20", multiple: 0.6 },
  { country: "australia", industry: "technology", scoreRange: "40-50", multiple: 7.5 },
  { country: "australia", industry: "technology", scoreRange: "30-39", multiple: 6.0 },
  { country: "australia", industry: "technology", scoreRange: "20-29", multiple: 3.75 },
  { country: "australia", industry: "technology", scoreRange: "<20", multiple: 2.25 },
  { country: "australia", industry: "wholesale", scoreRange: "40-50", multiple: 3.0 },
  { country: "australia", industry: "wholesale", scoreRange: "30-39", multiple: 2.4 },
  { country: "australia", industry: "wholesale", scoreRange: "20-29", multiple: 1.5 },
  { country: "australia", industry: "wholesale", scoreRange: "<20", multiple: 0.9 },
  { country: "australia", industry: "other", scoreRange: "40-50", multiple: 3.0 },
  { country: "australia", industry: "other", scoreRange: "30-39", multiple: 2.4 },
  { country: "australia", industry: "other", scoreRange: "20-29", multiple: 1.5 },
  { country: "australia", industry: "other", scoreRange: "<20", multiple: 0.9 },

  // Canada
  { country: "canada", industry: "construction", scoreRange: "40-50", multiple: 3.2 },
  { country: "canada", industry: "construction", scoreRange: "30-39", multiple: 2.56 },
  { country: "canada", industry: "construction", scoreRange: "20-29", multiple: 1.6 },
  { country: "canada", industry: "construction", scoreRange: "<20", multiple: 0.96 },
  { country: "canada", industry: "finance", scoreRange: "40-50", multiple: 5.2 },
  { country: "canada", industry: "finance", scoreRange: "30-39", multiple: 4.16 },
  { country: "canada", industry: "finance", scoreRange: "20-29", multiple: 2.6 },
  { country: "canada", industry: "finance", scoreRange: "<20", multiple: 1.56 },
  { country: "canada", industry: "healthcare", scoreRange: "40-50", multiple: 5.2 },
  { country: "canada", industry: "healthcare", scoreRange: "30-39", multiple: 4.16 },
  { country: "canada", industry: "healthcare", scoreRange: "20-29", multiple: 2.6 },
  { country: "canada", industry: "healthcare", scoreRange: "<20", multiple: 1.56 },
  { country: "canada", industry: "hospitality", scoreRange: "40-50", multiple: 2.3 },
  { country: "canada", industry: "hospitality", scoreRange: "30-39", multiple: 1.84 },
  { country: "canada", industry: "hospitality", scoreRange: "20-29", multiple: 1.15 },
  { country: "canada", industry: "hospitality", scoreRange: "<20", multiple: 0.69 },
  { country: "canada", industry: "manufacturing", scoreRange: "40-50", multiple: 4.2 },
  { country: "canada", industry: "manufacturing", scoreRange: "30-39", multiple: 3.36 },
  { country: "canada", industry: "manufacturing", scoreRange: "20-29", multiple: 2.1 },
  { country: "canada", industry: "manufacturing", scoreRange: "<20", multiple: 1.26 },
  { country: "canada", industry: "professional", scoreRange: "40-50", multiple: 3.2 },
  { country: "canada", industry: "professional", scoreRange: "30-39", multiple: 2.56 },
  { country: "canada", industry: "professional", scoreRange: "20-29", multiple: 1.6 },
  { country: "canada", industry: "professional", scoreRange: "<20", multiple: 0.96 },
  { country: "canada", industry: "retail", scoreRange: "40-50", multiple: 3.2 },
  { country: "canada", industry: "retail", scoreRange: "30-39", multiple: 2.56 },
  { country: "canada", industry: "retail", scoreRange: "20-29", multiple: 1.6 },
  { country: "canada", industry: "retail", scoreRange: "<20", multiple: 0.96 },
  { country: "canada", industry: "service", scoreRange: "40-50", multiple: 2.2 },
  { country: "canada", industry: "service", scoreRange: "30-39", multiple: 1.76 },
  { country: "canada", industry: "service", scoreRange: "20-29", multiple: 1.1 },
  { country: "canada", industry: "service", scoreRange: "<20", multiple: 0.66 },
  { country: "canada", industry: "technology", scoreRange: "40-50", multiple: 7.8 },
  { country: "canada", industry: "technology", scoreRange: "30-39", multiple: 6.24 },
  { country: "canada", industry: "technology", scoreRange: "20-29", multiple: 3.9 },
  { country: "canada", industry: "technology", scoreRange: "<20", multiple: 2.34 },
  { country: "canada", industry: "wholesale", scoreRange: "40-50", multiple: 3.2 },
  { country: "canada", industry: "wholesale", scoreRange: "30-39", multiple: 2.56 },
  { country: "canada", industry: "wholesale", scoreRange: "20-29", multiple: 1.6 },
  { country: "canada", industry: "wholesale", scoreRange: "<20", multiple: 0.96 },
  { country: "canada", industry: "other", scoreRange: "40-50", multiple: 3.0 },
  { country: "canada", industry: "other", scoreRange: "30-39", multiple: 2.4 },
  { country: "canada", industry: "other", scoreRange: "20-29", multiple: 1.5 },
  { country: "canada", industry: "other", scoreRange: "<20", multiple: 0.9 },

  // United Kingdom
  { country: "united kingdom", industry: "construction", scoreRange: "40-50", multiple: 2.8 },
  { country: "united kingdom", industry: "construction", scoreRange: "30-39", multiple: 2.24 },
  { country: "united kingdom", industry: "construction", scoreRange: "20-29", multiple: 1.4 },
  { country: "united kingdom", industry: "construction", scoreRange: "<20", multiple: 0.84 },
  { country: "united kingdom", industry: "finance", scoreRange: "40-50", multiple: 4.8 },
  { country: "united kingdom", industry: "finance", scoreRange: "30-39", multiple: 3.84 },
  { country: "united kingdom", industry: "finance", scoreRange: "20-29", multiple: 2.4 },
  { country: "united kingdom", industry: "finance", scoreRange: "<20", multiple: 1.44 },
  { country: "united kingdom", industry: "healthcare", scoreRange: "40-50", multiple: 4.8 },
  { country: "united kingdom", industry: "healthcare", scoreRange: "30-39", multiple: 3.84 },
  { country: "united kingdom", industry: "healthcare", scoreRange: "20-29", multiple: 2.4 },
  { country: "united kingdom", industry: "healthcare", scoreRange: "<20", multiple: 1.44 },
  { country: "united kingdom", industry: "hospitality", scoreRange: "40-50", multiple: 2.0 },
  { country: "united kingdom", industry: "hospitality", scoreRange: "30-39", multiple: 1.6 },
  { country: "united kingdom", industry: "hospitality", scoreRange: "20-29", multiple: 1.0 },
  { country: "united kingdom", industry: "hospitality", scoreRange: "<20", multiple: 0.6 },
  { country: "united kingdom", industry: "manufacturing", scoreRange: "40-50", multiple: 3.8 },
  { country: "united kingdom", industry: "manufacturing", scoreRange: "30-39", multiple: 3.04 },
  { country: "united kingdom", industry: "manufacturing", scoreRange: "20-29", multiple: 1.9 },
  { country: "united kingdom", industry: "manufacturing", scoreRange: "<20", multiple: 1.14 },
  { country: "united kingdom", industry: "professional", scoreRange: "40-50", multiple: 2.8 },
  { country: "united kingdom", industry: "professional", scoreRange: "30-39", multiple: 2.24 },
  { country: "united kingdom", industry: "professional", scoreRange: "20-29", multiple: 1.4 },
  { country: "united kingdom", industry: "professional", scoreRange: "<20", multiple: 0.84 },
  { country: "united kingdom", industry: "retail", scoreRange: "40-50", multiple: 2.8 },
  { country: "united kingdom", industry: "retail", scoreRange: "30-39", multiple: 2.24 },
  { country: "united kingdom", industry: "retail", scoreRange: "20-29", multiple: 1.4 },
  { country: "united kingdom", industry: "retail", scoreRange: "<20", multiple: 0.84 },
  { country: "united kingdom", industry: "service", scoreRange: "40-50", multiple: 1.8 },
  { country: "united kingdom", industry: "service", scoreRange: "30-39", multiple: 1.44 },
  { country: "united kingdom", industry: "service", scoreRange: "20-29", multiple: 0.9 },
  { country: "united kingdom", industry: "service", scoreRange: "<20", multiple: 0.54 },
  { country: "united kingdom", industry: "technology", scoreRange: "40-50", multiple: 7.0 },
  { country: "united kingdom", industry: "technology", scoreRange: "30-39", multiple: 5.6 },
  { country: "united kingdom", industry: "technology", scoreRange: "20-29", multiple: 3.5 },
  { country: "united kingdom", industry: "technology", scoreRange: "<20", multiple: 2.1 },
  { country: "united kingdom", industry: "wholesale", scoreRange: "40-50", multiple: 2.8 },
  { country: "united kingdom", industry: "wholesale", scoreRange: "30-39", multiple: 2.24 },
  { country: "united kingdom", industry: "wholesale", scoreRange: "20-29", multiple: 1.4 },
  { country: "united kingdom", industry: "wholesale", scoreRange: "<20", multiple: 0.84 },
  { country: "united kingdom", industry: "other", scoreRange: "40-50", multiple: 2.5 },
  { country: "united kingdom", industry: "other", scoreRange: "30-39", multiple: 2.0 },
  { country: "united kingdom", industry: "other", scoreRange: "20-29", multiple: 1.25 },
  { country: "united kingdom", industry: "other", scoreRange: "<20", multiple: 0.75 },

  // United States
  { country: "united states", industry: "construction", scoreRange: "40-50", multiple: 3.5 },
  { country: "united states", industry: "construction", scoreRange: "30-39", multiple: 2.8 },
  { country: "united states", industry: "construction", scoreRange: "20-29", multiple: 1.75 },
  { country: "united states", industry: "construction", scoreRange: "<20", multiple: 1.05 },
  { country: "united states", industry: "finance", scoreRange: "40-50", multiple: 5.5 },
  { country: "united states", industry: "finance", scoreRange: "30-39", multiple: 4.4 },
  { country: "united states", industry: "finance", scoreRange: "20-29", multiple: 2.75 },
  { country: "united states", industry: "finance", scoreRange: "<20", multiple: 1.65 },
  { country: "united states", industry: "healthcare", scoreRange: "40-50", multiple: 5.5 },
  { country: "united states", industry: "healthcare", scoreRange: "30-39", multiple: 4.4 },
  { country: "united states", industry: "healthcare", scoreRange: "20-29", multiple: 2.75 },
  { country: "united states", industry: "healthcare", scoreRange: "<20", multiple: 1.65 },
  { country: "united states", industry: "hospitality", scoreRange: "40-50", multiple: 2.5 },
  { country: "united states", industry: "hospitality", scoreRange: "30-39", multiple: 2.0 },
  { country: "united states", industry: "hospitality", scoreRange: "20-29", multiple: 1.25 },
  { country: "united states", industry: "hospitality", scoreRange: "<20", multiple: 0.75 },
  { country: "united states", industry: "manufacturing", scoreRange: "40-50", multiple: 4.5 },
  { country: "united states", industry: "manufacturing", scoreRange: "30-39", multiple: 3.6 },
  { country: "united states", industry: "manufacturing", scoreRange: "20-29", multiple: 2.25 },
  { country: "united states", industry: "manufacturing", scoreRange: "<20", multiple: 1.35 },
  { country: "united states", industry: "professional", scoreRange: "40-50", multiple: 3.5 },
  { country: "united states", industry: "professional", scoreRange: "30-39", multiple: 2.8 },
  { country: "united states", industry: "professional", scoreRange: "20-29", multiple: 1.75 },
  { country: "united states", industry: "professional", scoreRange: "<20", multiple: 1.05 },
  { country: "united states", industry: "retail", scoreRange: "40-50", multiple: 3.5 },
  { country: "united states", industry: "retail", scoreRange: "30-39", multiple: 2.8 },
  { country: "united states", industry: "retail", scoreRange: "20-29", multiple: 1.75 },
  { country: "united states", industry: "retail", scoreRange: "<20", multiple: 1.05 },
  { country: "united states", industry: "service", scoreRange: "40-50", multiple: 2.5 },
  { country: "united states", industry: "service", scoreRange: "30-39", multiple: 2.0 },
  { country: "united states", industry: "service", scoreRange: "20-29", multiple: 1.25 },
  { country: "united states", industry: "service", scoreRange: "<20", multiple: 0.75 },
  { country: "united states", industry: "technology", scoreRange: "40-50", multiple: 8.0 },
  { country: "united states", industry: "technology", scoreRange: "30-39", multiple: 6.4 },
  { country: "united states", industry: "technology", scoreRange: "20-29", multiple: 4.0 },
  { country: "united states", industry: "technology", scoreRange: "<20", multiple: 2.4 },
  { country: "united states", industry: "wholesale", scoreRange: "40-50", multiple: 3.5 },
  { country: "united states", industry: "wholesale", scoreRange: "30-39", multiple: 2.8 },
  { country: "united states", industry: "wholesale", scoreRange: "20-29", multiple: 1.75 },
  { country: "united states", industry: "wholesale", scoreRange: "<20", multiple: 1.05 },
  { country: "united states", industry: "other", scoreRange: "40-50", multiple: 3.0 },
  { country: "united states", industry: "other", scoreRange: "30-39", multiple: 2.4 },
  { country: "united states", industry: "other", scoreRange: "20-29", multiple: 1.5 },
  { country: "united states", industry: "other", scoreRange: "<20", multiple: 0.9 },
];

async function seedValuationMultiples() {
  console.log("\n📊 Seeding valuation multiples...");

  const existingCount = await prisma.valuationMultiple.count();

  if (existingCount > 0) {
    console.log(`✅ Valuation multiples already seeded (${existingCount} records)`);
    return;
  }

  let inserted = 0;
  for (const multiple of baseMultiples) {
    await prisma.valuationMultiple.create({
      data: {
        country: multiple.country,
        industry: multiple.industry,
        scoreRange: multiple.scoreRange,
        multiple: multiple.multiple,
      },
    });
    inserted++;
  }

  console.log(`✅ Seeded ${inserted} valuation multiples`);
}

async function seedSubscriptionPlans() {
  console.log("\n💳 Seeding subscription plans...");

  const existingPlan = await prisma.subscriptionPlan.findUnique({
    where: { name: "One-Off" },
  });

  if (existingPlan) {
    console.log("✅ Subscription plan already exists");
    return;
  }

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name: "One-Off",
      price: 39900, // $399.00
      billingPeriod: BillingPeriod.ONE_TIME,
      features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking"],
      active: true,
    },
  });

  console.log(`✅ Created subscription plan: ${plan.name} ($${plan.price / 100})`);
}

async function seedDefaultAdmin() {
  console.log("\n🔐 Seeding default admin user...");

  const adminExists = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (adminExists) {
    console.log("✅ Admin user already exists");
    return;
  }

  const email = process.env.ADMIN_EMAIL || "admin@intaleks.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const name = process.env.ADMIN_NAME || "Admin User";

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: UserRole.ADMIN,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  console.log("✅ Created admin user:");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Change password after first login!");
}

async function main() {
  console.log("🌱 Starting Intaleks database seeding...");
  console.log("==========================================");

  try {
    await seedValuationMultiples();
    await seedSubscriptionPlans();
    await seedDefaultAdmin();

    console.log("\n==========================================");
    console.log("✅ Database seeding completed successfully!");
    console.log("==========================================\n");
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
