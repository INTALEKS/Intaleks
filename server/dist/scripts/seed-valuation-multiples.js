"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedValuationMultiples = seedValuationMultiples;
const db_1 = require("../config/db");
/**
 * Seeds valuation multiples data for all countries, industries, and score ranges
 * Uses the same data structure as the raw SQL seeding script
 */
async function seedValuationMultiples() {
    try {
        // Check if valuation multiples already exist - we expect exactly 176 records
        const existingCount = await db_1.prisma.valuationMultiple.count();
        if (existingCount >= 176) {
            console.log(`✅ Valuation multiples already seeded (${existingCount} records)`);
            return;
        }
        console.log("🌱 Seeding valuation multiples...");
        // Clear existing data and fix constraints
        await db_1.prisma.$executeRaw `TRUNCATE TABLE "valuation_multiples" CASCADE`;
        console.log("🔧 Running constraint fix...");
        try {
            await db_1.prisma.$executeRaw `ALTER TABLE "valuation_multiples" DROP CONSTRAINT IF EXISTS "valuation_multiples_country_industry_key"`;
            await db_1.prisma.$executeRaw `ALTER TABLE "valuation_multiples" DROP CONSTRAINT IF EXISTS "valuation_multiples_country_industry_score_range_key"`;
            await db_1.prisma.$executeRaw `ALTER TABLE "valuation_multiples" ADD CONSTRAINT "valuation_multiples_country_industry_score_range_key" UNIQUE ("country", "industry", "score_range")`;
            console.log("✅ Constraint fixed");
        }
        catch (error) {
            console.log("⚠️ Constraint fix failed:", error);
        }
        // Define the base multiples data (176 records total)
        const baseMultiples = [
            // Australia
            { country: "australia", industry: "technology", scoreRange: "40-50", multiple: 7.5 },
            { country: "australia", industry: "technology", scoreRange: "30-39", multiple: 6.0 },
            { country: "australia", industry: "technology", scoreRange: "20-29", multiple: 3.75 },
            { country: "australia", industry: "technology", scoreRange: "<20", multiple: 2.25 },
            { country: "australia", industry: "healthcare", scoreRange: "40-50", multiple: 6.5 },
            { country: "australia", industry: "healthcare", scoreRange: "30-39", multiple: 5.2 },
            { country: "australia", industry: "healthcare", scoreRange: "20-29", multiple: 3.25 },
            { country: "australia", industry: "healthcare", scoreRange: "<20", multiple: 1.95 },
            { country: "australia", industry: "manufacturing", scoreRange: "40-50", multiple: 5.0 },
            { country: "australia", industry: "manufacturing", scoreRange: "30-39", multiple: 4.0 },
            { country: "australia", industry: "manufacturing", scoreRange: "20-29", multiple: 2.5 },
            { country: "australia", industry: "manufacturing", scoreRange: "<20", multiple: 1.5 },
            { country: "australia", industry: "retail", scoreRange: "40-50", multiple: 4.5 },
            { country: "australia", industry: "retail", scoreRange: "30-39", multiple: 3.6 },
            { country: "australia", industry: "retail", scoreRange: "20-29", multiple: 2.25 },
            { country: "australia", industry: "retail", scoreRange: "<20", multiple: 1.35 },
            { country: "australia", industry: "professional-services", scoreRange: "40-50", multiple: 5.5 },
            { country: "australia", industry: "professional-services", scoreRange: "30-39", multiple: 4.4 },
            { country: "australia", industry: "professional-services", scoreRange: "20-29", multiple: 2.75 },
            { country: "australia", industry: "professional-services", scoreRange: "<20", multiple: 1.65 },
            { country: "australia", industry: "construction", scoreRange: "40-50", multiple: 4.0 },
            { country: "australia", industry: "construction", scoreRange: "30-39", multiple: 3.2 },
            { country: "australia", industry: "construction", scoreRange: "20-29", multiple: 2.0 },
            { country: "australia", industry: "construction", scoreRange: "<20", multiple: 1.2 },
            { country: "australia", industry: "hospitality", scoreRange: "40-50", multiple: 3.5 },
            { country: "australia", industry: "hospitality", scoreRange: "30-39", multiple: 2.8 },
            { country: "australia", industry: "hospitality", scoreRange: "20-29", multiple: 1.75 },
            { country: "australia", industry: "hospitality", scoreRange: "<20", multiple: 1.05 },
            { country: "australia", industry: "education", scoreRange: "40-50", multiple: 4.5 },
            { country: "australia", industry: "education", scoreRange: "30-39", multiple: 3.6 },
            { country: "australia", industry: "education", scoreRange: "20-29", multiple: 2.25 },
            { country: "australia", industry: "education", scoreRange: "<20", multiple: 1.35 },
            { country: "australia", industry: "finance", scoreRange: "40-50", multiple: 6.0 },
            { country: "australia", industry: "finance", scoreRange: "30-39", multiple: 4.8 },
            { country: "australia", industry: "finance", scoreRange: "20-29", multiple: 3.0 },
            { country: "australia", industry: "finance", scoreRange: "<20", multiple: 1.8 },
            { country: "australia", industry: "agriculture", scoreRange: "40-50", multiple: 3.0 },
            { country: "australia", industry: "agriculture", scoreRange: "30-39", multiple: 2.4 },
            { country: "australia", industry: "agriculture", scoreRange: "20-29", multiple: 1.5 },
            { country: "australia", industry: "agriculture", scoreRange: "<20", multiple: 0.9 },
            { country: "australia", industry: "other", scoreRange: "40-50", multiple: 4.0 },
            { country: "australia", industry: "other", scoreRange: "30-39", multiple: 3.2 },
            { country: "australia", industry: "other", scoreRange: "20-29", multiple: 2.0 },
            { country: "australia", industry: "other", scoreRange: "<20", multiple: 1.2 },
            // United States
            { country: "united states", industry: "technology", scoreRange: "40-50", multiple: 8.0 },
            { country: "united states", industry: "technology", scoreRange: "30-39", multiple: 6.4 },
            { country: "united states", industry: "technology", scoreRange: "20-29", multiple: 4.0 },
            { country: "united states", industry: "technology", scoreRange: "<20", multiple: 2.4 },
            { country: "united states", industry: "healthcare", scoreRange: "40-50", multiple: 7.0 },
            { country: "united states", industry: "healthcare", scoreRange: "30-39", multiple: 5.6 },
            { country: "united states", industry: "healthcare", scoreRange: "20-29", multiple: 3.5 },
            { country: "united states", industry: "healthcare", scoreRange: "<20", multiple: 2.1 },
            { country: "united states", industry: "manufacturing", scoreRange: "40-50", multiple: 5.5 },
            { country: "united states", industry: "manufacturing", scoreRange: "30-39", multiple: 4.4 },
            { country: "united states", industry: "manufacturing", scoreRange: "20-29", multiple: 2.75 },
            { country: "united states", industry: "manufacturing", scoreRange: "<20", multiple: 1.65 },
            { country: "united states", industry: "retail", scoreRange: "40-50", multiple: 5.0 },
            { country: "united states", industry: "retail", scoreRange: "30-39", multiple: 4.0 },
            { country: "united states", industry: "retail", scoreRange: "20-29", multiple: 2.5 },
            { country: "united states", industry: "retail", scoreRange: "<20", multiple: 1.5 },
            { country: "united states", industry: "professional-services", scoreRange: "40-50", multiple: 6.0 },
            { country: "united states", industry: "professional-services", scoreRange: "30-39", multiple: 4.8 },
            { country: "united states", industry: "professional-services", scoreRange: "20-29", multiple: 3.0 },
            { country: "united states", industry: "professional-services", scoreRange: "<20", multiple: 1.8 },
            { country: "united states", industry: "construction", scoreRange: "40-50", multiple: 4.5 },
            { country: "united states", industry: "construction", scoreRange: "30-39", multiple: 3.6 },
            { country: "united states", industry: "construction", scoreRange: "20-29", multiple: 2.25 },
            { country: "united states", industry: "construction", scoreRange: "<20", multiple: 1.35 },
            { country: "united states", industry: "hospitality", scoreRange: "40-50", multiple: 4.0 },
            { country: "united states", industry: "hospitality", scoreRange: "30-39", multiple: 3.2 },
            { country: "united states", industry: "hospitality", scoreRange: "20-29", multiple: 2.0 },
            { country: "united states", industry: "hospitality", scoreRange: "<20", multiple: 1.2 },
            { country: "united states", industry: "education", scoreRange: "40-50", multiple: 5.0 },
            { country: "united states", industry: "education", scoreRange: "30-39", multiple: 4.0 },
            { country: "united states", industry: "education", scoreRange: "20-29", multiple: 2.5 },
            { country: "united states", industry: "education", scoreRange: "<20", multiple: 1.5 },
            { country: "united states", industry: "finance", scoreRange: "40-50", multiple: 6.5 },
            { country: "united states", industry: "finance", scoreRange: "30-39", multiple: 5.2 },
            { country: "united states", industry: "finance", scoreRange: "20-29", multiple: 3.25 },
            { country: "united states", industry: "finance", scoreRange: "<20", multiple: 1.95 },
            { country: "united states", industry: "agriculture", scoreRange: "40-50", multiple: 3.5 },
            { country: "united states", industry: "agriculture", scoreRange: "30-39", multiple: 2.8 },
            { country: "united states", industry: "agriculture", scoreRange: "20-29", multiple: 1.75 },
            { country: "united states", industry: "agriculture", scoreRange: "<20", multiple: 1.05 },
            { country: "united states", industry: "other", scoreRange: "40-50", multiple: 4.5 },
            { country: "united states", industry: "other", scoreRange: "30-39", multiple: 3.6 },
            { country: "united states", industry: "other", scoreRange: "20-29", multiple: 2.25 },
            { country: "united states", industry: "other", scoreRange: "<20", multiple: 1.35 },
            // United Kingdom
            { country: "united kingdom", industry: "technology", scoreRange: "40-50", multiple: 7.0 },
            { country: "united kingdom", industry: "technology", scoreRange: "30-39", multiple: 5.6 },
            { country: "united kingdom", industry: "technology", scoreRange: "20-29", multiple: 3.5 },
            { country: "united kingdom", industry: "technology", scoreRange: "<20", multiple: 2.1 },
            { country: "united kingdom", industry: "healthcare", scoreRange: "40-50", multiple: 6.0 },
            { country: "united kingdom", industry: "healthcare", scoreRange: "30-39", multiple: 4.8 },
            { country: "united kingdom", industry: "healthcare", scoreRange: "20-29", multiple: 3.0 },
            { country: "united kingdom", industry: "healthcare", scoreRange: "<20", multiple: 1.8 },
            { country: "united kingdom", industry: "manufacturing", scoreRange: "40-50", multiple: 4.5 },
            { country: "united kingdom", industry: "manufacturing", scoreRange: "30-39", multiple: 3.6 },
            { country: "united kingdom", industry: "manufacturing", scoreRange: "20-29", multiple: 2.25 },
            { country: "united kingdom", industry: "manufacturing", scoreRange: "<20", multiple: 1.35 },
            { country: "united kingdom", industry: "retail", scoreRange: "40-50", multiple: 4.0 },
            { country: "united kingdom", industry: "retail", scoreRange: "30-39", multiple: 3.2 },
            { country: "united kingdom", industry: "retail", scoreRange: "20-29", multiple: 2.0 },
            { country: "united kingdom", industry: "retail", scoreRange: "<20", multiple: 1.2 },
            { country: "united kingdom", industry: "professional-services", scoreRange: "40-50", multiple: 5.0 },
            { country: "united kingdom", industry: "professional-services", scoreRange: "30-39", multiple: 4.0 },
            { country: "united kingdom", industry: "professional-services", scoreRange: "20-29", multiple: 2.5 },
            { country: "united kingdom", industry: "professional-services", scoreRange: "<20", multiple: 1.5 },
            { country: "united kingdom", industry: "construction", scoreRange: "40-50", multiple: 3.5 },
            { country: "united kingdom", industry: "construction", scoreRange: "30-39", multiple: 2.8 },
            { country: "united kingdom", industry: "construction", scoreRange: "20-29", multiple: 1.75 },
            { country: "united kingdom", industry: "construction", scoreRange: "<20", multiple: 1.05 },
            { country: "united kingdom", industry: "hospitality", scoreRange: "40-50", multiple: 3.0 },
            { country: "united kingdom", industry: "hospitality", scoreRange: "30-39", multiple: 2.4 },
            { country: "united kingdom", industry: "hospitality", scoreRange: "20-29", multiple: 1.5 },
            { country: "united kingdom", industry: "hospitality", scoreRange: "<20", multiple: 0.9 },
            { country: "united kingdom", industry: "education", scoreRange: "40-50", multiple: 4.0 },
            { country: "united kingdom", industry: "education", scoreRange: "30-39", multiple: 3.2 },
            { country: "united kingdom", industry: "education", scoreRange: "20-29", multiple: 2.0 },
            { country: "united kingdom", industry: "education", scoreRange: "<20", multiple: 1.2 },
            { country: "united kingdom", industry: "finance", scoreRange: "40-50", multiple: 5.5 },
            { country: "united kingdom", industry: "finance", scoreRange: "30-39", multiple: 4.4 },
            { country: "united kingdom", industry: "finance", scoreRange: "20-29", multiple: 2.75 },
            { country: "united kingdom", industry: "finance", scoreRange: "<20", multiple: 1.65 },
            { country: "united kingdom", industry: "agriculture", scoreRange: "40-50", multiple: 2.5 },
            { country: "united kingdom", industry: "agriculture", scoreRange: "30-39", multiple: 2.0 },
            { country: "united kingdom", industry: "agriculture", scoreRange: "20-29", multiple: 1.25 },
            { country: "united kingdom", industry: "agriculture", scoreRange: "<20", multiple: 0.75 },
            { country: "united kingdom", industry: "other", scoreRange: "40-50", multiple: 3.5 },
            { country: "united kingdom", industry: "other", scoreRange: "30-39", multiple: 2.8 },
            { country: "united kingdom", industry: "other", scoreRange: "20-29", multiple: 1.75 },
            { country: "united kingdom", industry: "other", scoreRange: "<20", multiple: 1.05 },
            // Canada
            { country: "canada", industry: "technology", scoreRange: "40-50", multiple: 7.5 },
            { country: "canada", industry: "technology", scoreRange: "30-39", multiple: 6.0 },
            { country: "canada", industry: "technology", scoreRange: "20-29", multiple: 3.75 },
            { country: "canada", industry: "technology", scoreRange: "<20", multiple: 2.25 },
            { country: "canada", industry: "healthcare", scoreRange: "40-50", multiple: 6.5 },
            { country: "canada", industry: "healthcare", scoreRange: "30-39", multiple: 5.2 },
            { country: "canada", industry: "healthcare", scoreRange: "20-29", multiple: 3.25 },
            { country: "canada", industry: "healthcare", scoreRange: "<20", multiple: 1.95 },
            { country: "canada", industry: "manufacturing", scoreRange: "40-50", multiple: 5.0 },
            { country: "canada", industry: "manufacturing", scoreRange: "30-39", multiple: 4.0 },
            { country: "canada", industry: "manufacturing", scoreRange: "20-29", multiple: 2.5 },
            { country: "canada", industry: "manufacturing", scoreRange: "<20", multiple: 1.5 },
            { country: "canada", industry: "retail", scoreRange: "40-50", multiple: 4.5 },
            { country: "canada", industry: "retail", scoreRange: "30-39", multiple: 3.6 },
            { country: "canada", industry: "retail", scoreRange: "20-29", multiple: 2.25 },
            { country: "canada", industry: "retail", scoreRange: "<20", multiple: 1.35 },
            { country: "canada", industry: "professional-services", scoreRange: "40-50", multiple: 5.5 },
            { country: "canada", industry: "professional-services", scoreRange: "30-39", multiple: 4.4 },
            { country: "canada", industry: "professional-services", scoreRange: "20-29", multiple: 2.75 },
            { country: "canada", industry: "professional-services", scoreRange: "<20", multiple: 1.65 },
            { country: "canada", industry: "construction", scoreRange: "40-50", multiple: 4.0 },
            { country: "canada", industry: "construction", scoreRange: "30-39", multiple: 3.2 },
            { country: "canada", industry: "construction", scoreRange: "20-29", multiple: 2.0 },
            { country: "canada", industry: "construction", scoreRange: "<20", multiple: 1.2 },
            { country: "canada", industry: "hospitality", scoreRange: "40-50", multiple: 3.5 },
            { country: "canada", industry: "hospitality", scoreRange: "30-39", multiple: 2.8 },
            { country: "canada", industry: "hospitality", scoreRange: "20-29", multiple: 1.75 },
            { country: "canada", industry: "hospitality", scoreRange: "<20", multiple: 1.05 },
            { country: "canada", industry: "education", scoreRange: "40-50", multiple: 4.5 },
            { country: "canada", industry: "education", scoreRange: "30-39", multiple: 3.6 },
            { country: "canada", industry: "education", scoreRange: "20-29", multiple: 2.25 },
            { country: "canada", industry: "education", scoreRange: "<20", multiple: 1.35 },
            { country: "canada", industry: "finance", scoreRange: "40-50", multiple: 6.0 },
            { country: "canada", industry: "finance", scoreRange: "30-39", multiple: 4.8 },
            { country: "canada", industry: "finance", scoreRange: "20-29", multiple: 3.0 },
            { country: "canada", industry: "finance", scoreRange: "<20", multiple: 1.8 },
            { country: "canada", industry: "agriculture", scoreRange: "40-50", multiple: 3.0 },
            { country: "canada", industry: "agriculture", scoreRange: "30-39", multiple: 2.4 },
            { country: "canada", industry: "agriculture", scoreRange: "20-29", multiple: 1.5 },
            { country: "canada", industry: "agriculture", scoreRange: "<20", multiple: 0.9 },
            { country: "canada", industry: "other", scoreRange: "40-50", multiple: 4.0 },
            { country: "canada", industry: "other", scoreRange: "30-39", multiple: 3.2 },
            { country: "canada", industry: "other", scoreRange: "20-29", multiple: 2.0 },
            { country: "canada", industry: "other", scoreRange: "<20", multiple: 1.2 },
        ];
        // Insert all records using createMany for better performance
        await db_1.prisma.valuationMultiple.createMany({
            data: baseMultiples,
            skipDuplicates: true,
        });
        // Verify the count
        const finalCount = await db_1.prisma.valuationMultiple.count();
        console.log(`✅ Successfully seeded valuation multiples. Final count: ${finalCount}`);
    }
    catch (error) {
        console.error("❌ Error seeding valuation multiples:", error);
        throw error;
    }
}
