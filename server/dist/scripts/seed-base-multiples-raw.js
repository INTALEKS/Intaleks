"use strict";
/**
 * Seed script for base valuation multiples using raw SQL
 * This bypasses Prisma Client cache issues
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Base multiples from the provided table with score ranges
const baseMultiples = [
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
async function main() {
    console.log("🌱 Seeding base valuation multiples using raw SQL...");
    // Clear existing multiples
    await prisma.$executeRaw `DELETE FROM "valuation_multiples"`;
    console.log("✅ Cleared existing multiples");
    // Insert base multiples using raw SQL
    for (const multiple of baseMultiples) {
        await prisma.$executeRaw `
      INSERT INTO "valuation_multiples" (id, country, industry, score_range, multiple, created_at, updated_at)
      VALUES (gen_random_uuid(), ${multiple.country}, ${multiple.industry}, ${multiple.scoreRange}, ${multiple.multiple}, NOW(), NOW())
    `;
    }
    console.log(`✅ Seeded ${baseMultiples.length} base multiples`);
    // Display summary
    const countries = [...new Set(baseMultiples.map((m) => m.country))];
    const scoreRanges = [...new Set(baseMultiples.map((m) => m.scoreRange))];
    console.log("\n📊 Summary:");
    console.log(`  Score Ranges: ${scoreRanges.join(", ")}`);
    for (const country of countries) {
        const countryMultiples = baseMultiples.filter((m) => m.country === country);
        const industries = [...new Set(countryMultiples.map((m) => m.industry))];
        console.log(`  ${country}: ${industries.length} industries × ${scoreRanges.length} ranges = ${countryMultiples.length} records`);
    }
}
main()
    .catch((e) => {
    console.error("❌ Error seeding base multiples:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
