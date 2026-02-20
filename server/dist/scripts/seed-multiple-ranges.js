"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
/**
 * Seed script for valuation multiple ranges
 * Creates ranges for each country/industry combination based on questionnaire scores
 */
const countries = ["australia", "usa", "uk", "canada"];
const industries = ["retail", "technology", "service", "manufacturing", "hospitality", "construction", "professional", "finance", "healthcare", "wholesale"];
// Define base multiples for each industry (these are the "standard" multiples at score 30-39)
const industryBaseMultiples = {
    retail: 3.0,
    technology: 7.5,
    service: 4.5,
    manufacturing: 5.0,
    hospitality: 3.5,
    construction: 4.0,
    professional: 5.5,
    finance: 6.0,
    healthcare: 6.5,
    wholesale: 3.5,
};
async function seedMultipleRanges() {
    console.log("🌱 Seeding valuation multiple ranges...");
    const ranges = [];
    for (const country of countries) {
        for (const industry of industries) {
            const baseMultiple = industryBaseMultiples[industry] || 4.0;
            // Premium range (40-50 points) - 1.5x to 2x base multiple
            ranges.push({
                country,
                industry,
                minScore: 40,
                maxScore: 50,
                minMultiple: baseMultiple * 1.5,
                maxMultiple: baseMultiple * 2.0,
                description: "Premium",
            });
            // Standard range (30-39 points) - 1x to 1.5x base multiple
            ranges.push({
                country,
                industry,
                minScore: 30,
                maxScore: 39,
                minMultiple: baseMultiple,
                maxMultiple: baseMultiple * 1.5,
                description: "Standard",
            });
            // Discounted range (20-29 points) - 0.6x to 1x base multiple
            ranges.push({
                country,
                industry,
                minScore: 20,
                maxScore: 29,
                minMultiple: baseMultiple * 0.6,
                maxMultiple: baseMultiple,
                description: "Discounted",
            });
            // High-risk range (10-19 points) - 0.3x to 0.6x base multiple
            ranges.push({
                country,
                industry,
                minScore: 10,
                maxScore: 19,
                minMultiple: baseMultiple * 0.3,
                maxMultiple: baseMultiple * 0.6,
                description: "High-risk",
            });
        }
    }
    // Use createMany with skipDuplicates to avoid errors on re-runs
    const result = await db_1.prisma.valuationMultipleRange.createMany({
        data: ranges,
        skipDuplicates: true,
    });
    console.log(`✅ Seeded ${result.count} valuation multiple ranges`);
    console.log(`📊 Total ranges: ${countries.length} countries × ${industries.length} industries × 4 score ranges = ${countries.length * industries.length * 4} ranges`);
}
// Run the seed function
seedMultipleRanges()
    .catch((error) => {
    console.error("❌ Error seeding multiple ranges:", error);
    process.exit(1);
})
    .finally(async () => {
    await db_1.prisma.$disconnect();
});
