"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
// Complete dataset: 4 countries × 11 industries × 4 score ranges = 176 records
const allValuationMultiples = [
    // AUSTRALIA
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
    { country: "australia", industry: "wholesale", scoreRange: "40-50", multiple: 3.0 },
    { country: "australia", industry: "wholesale", scoreRange: "30-39", multiple: 2.4 },
    { country: "australia", industry: "wholesale", scoreRange: "20-29", multiple: 1.5 },
    { country: "australia", industry: "wholesale", scoreRange: "<20", multiple: 0.9 },
    // UNITED STATES
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
    { country: "united states", industry: "wholesale", scoreRange: "40-50", multiple: 3.5 },
    { country: "united states", industry: "wholesale", scoreRange: "30-39", multiple: 2.8 },
    { country: "united states", industry: "wholesale", scoreRange: "20-29", multiple: 1.75 },
    { country: "united states", industry: "wholesale", scoreRange: "<20", multiple: 1.05 },
    // UNITED KINGDOM
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
    { country: "united kingdom", industry: "wholesale", scoreRange: "40-50", multiple: 2.8 },
    { country: "united kingdom", industry: "wholesale", scoreRange: "30-39", multiple: 2.24 },
    { country: "united kingdom", industry: "wholesale", scoreRange: "20-29", multiple: 1.4 },
    { country: "united kingdom", industry: "wholesale", scoreRange: "<20", multiple: 0.84 },
    // CANADA
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
    { country: "canada", industry: "wholesale", scoreRange: "40-50", multiple: 3.2 },
    { country: "canada", industry: "wholesale", scoreRange: "30-39", multiple: 2.56 },
    { country: "canada", industry: "wholesale", scoreRange: "20-29", multiple: 1.6 },
    { country: "canada", industry: "wholesale", scoreRange: "<20", multiple: 0.96 },
];
async function resetValuationMultiples() {
    console.log("🔄 Starting valuation multiples reset and reseed...\n");
    try {
        // Step 1: Delete all existing records
        console.log("🗑️  Deleting all existing valuation multiples...");
        const deleteResult = await db_1.prisma.valuationMultiple.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.count} existing records\n`);
        // Step 2: Insert all records in batches to avoid timeout
        console.log("📥 Inserting fresh valuation multiples data...");
        const batchSize = 50;
        let totalInserted = 0;
        for (let i = 0; i < allValuationMultiples.length; i += batchSize) {
            const batch = allValuationMultiples.slice(i, i + batchSize);
            await db_1.prisma.valuationMultiple.createMany({
                data: batch,
                skipDuplicates: true,
            });
            totalInserted += batch.length;
            console.log(`  ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allValuationMultiples.length / batchSize)} (${totalInserted}/${allValuationMultiples.length} records)`);
        }
        console.log(`\n✅ Successfully inserted ${totalInserted} valuation multiple records\n`);
        // Step 3: Verify the data
        console.log("🔍 Verifying data integrity...");
        const finalCount = await db_1.prisma.valuationMultiple.count();
        console.log(`   Total records in database: ${finalCount}`);
        // Verify by country
        const countries = ["australia", "united states", "united kingdom", "canada"];
        for (const country of countries) {
            const countryCount = await db_1.prisma.valuationMultiple.count({
                where: { country },
            });
            console.log(`   ${country}: ${countryCount} records`);
        }
        // Verify by industry
        const industries = ["technology", "healthcare", "manufacturing", "retail", "professional-services", "construction", "hospitality", "education", "finance", "agriculture", "wholesale"];
        console.log("\n   Records by industry:");
        for (const industry of industries) {
            const industryCount = await db_1.prisma.valuationMultiple.count({
                where: { industry },
            });
            console.log(`   ${industry}: ${industryCount} records`);
        }
        console.log("\n✅ Reset and reseed completed successfully!");
        console.log(`📊 Expected: 176 records (4 countries × 11 industries × 4 score ranges)`);
        console.log(`📊 Actual: ${finalCount} records`);
        if (finalCount === 176) {
            console.log("✅ Data integrity verified - all records present!");
        }
        else {
            console.log(`⚠️  Warning: Expected 176 records but found ${finalCount}`);
        }
    }
    catch (error) {
        console.error("❌ Error during reset and reseed:", error);
        throw error;
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
// Run the script
resetValuationMultiples();
