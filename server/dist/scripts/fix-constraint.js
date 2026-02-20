"use strict";
/**
 * Fix unique constraint on valuation_multiples table
 * This ensures the constraint includes scoreRange field
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🔧 Fixing valuation_multiples unique constraint...");
    try {
        // Drop old constraint if it exists
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "valuation_multiples" 
      DROP CONSTRAINT IF EXISTS "valuation_multiples_country_industry_key"
    `);
        // Add new constraint with score_range if it doesn't exist
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "valuation_multiples" 
      DROP CONSTRAINT IF EXISTS "valuation_multiples_country_industry_score_range_key"
    `);
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "valuation_multiples" 
      ADD CONSTRAINT "valuation_multiples_country_industry_score_range_key" 
      UNIQUE ("country", "industry", "score_range")
    `);
        console.log("✅ Constraint fixed successfully");
    }
    catch (error) {
        console.error("❌ Error fixing constraint:", error);
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
