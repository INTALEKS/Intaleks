/**
 * Startup seed script - runs automatically when server starts
 * Only seeds missing data, skips existing records
 * Runs silently in background
 */

import { PrismaClient, UserRole, BillingPeriod } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function startupSeed() {
  try {
    // Check and seed valuation multiples
    const multiplesCount = await prisma.valuationMultiple.count();
    if (multiplesCount === 0) {
      console.log("🌱 Seeding valuation multiples...");
      // Import and run the full seed
      await import("./seed-base-multiples-raw");
    }

    // Check and seed subscription plan
    const planExists = await prisma.subscriptionPlan.findUnique({
      where: { name: "One-Off" },
    });
    if (!planExists) {
      console.log("🌱 Seeding subscription plan...");
      await prisma.subscriptionPlan.create({
        data: {
          name: "One-Off",
          price: 39900,
          billingPeriod: BillingPeriod.ONE_TIME,
          features: ["Worldwide Industry Multiples (US, Canada, UK, Australia)", "Professional PDF Report", "Company Logo Integration", "Business Assessment Survey", "Asset & Liability Tracking", "Unlimited Valuations", "Export to Excel/PDF"],
          active: true,
        },
      });
    }

    // Check and seed admin user
    const adminExists = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });
    if (!adminExists) {
      const email = process.env.ADMIN_EMAIL || "admin@intaleks.com";
      const password = process.env.ADMIN_PASSWORD || "Admin123!";
      const name = process.env.ADMIN_NAME || "Admin User";

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: UserRole.ADMIN,
          termsAccepted: true,
          termsAcceptedAt: new Date(),
        },
      });

      console.log(`🔐 Created admin user: ${email}`);
    }
  } catch (error) {
    console.error("⚠️  Startup seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if in development mode
if (process.env.NODE_ENV === "development") {
  startupSeed();
}

export default startupSeed;
