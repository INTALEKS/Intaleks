"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualSeedEssential = manualSeedEssential;
const db_1 = require("../config/db");
/**
 * Manually seed essential valuation multiples for testing
 * This adds just the Australia/Technology records needed for the calculation
 */
async function manualSeedEssential() {
    try {
        console.log("🌱 Manually seeding essential valuation multiples...");
        // Essential records for Australia/Technology
        const essentialRecords = [
            { country: "australia", industry: "technology", scoreRange: "40-50", multiple: 7.5 },
            { country: "australia", industry: "technology", scoreRange: "30-39", multiple: 6.0 },
            { country: "australia", industry: "technology", scoreRange: "20-29", multiple: 3.75 },
            { country: "australia", industry: "technology", scoreRange: "<20", multiple: 2.25 },
        ];
        for (const record of essentialRecords) {
            try {
                await db_1.prisma.valuationMultiple.upsert({
                    where: {
                        country_industry_scoreRange: {
                            country: record.country,
                            industry: record.industry,
                            scoreRange: record.scoreRange,
                        },
                    },
                    update: {
                        multiple: record.multiple,
                    },
                    create: record,
                });
                console.log(`✅ Seeded ${record.country}/${record.industry}/${record.scoreRange} = ${record.multiple}x`);
            }
            catch (error) {
                console.error(`❌ Failed to seed ${record.country}/${record.industry}/${record.scoreRange}:`, error);
            }
        }
        console.log("✅ Essential seeding completed");
    }
    catch (error) {
        console.error("❌ Essential seeding failed:", error);
        throw error;
    }
}
// Run if called directly
if (require.main === module) {
    manualSeedEssential()
        .then(() => {
        console.log("✅ Manual seeding completed");
        process.exit(0);
    })
        .catch((error) => {
        console.error("❌ Manual seeding failed:", error);
        process.exit(1);
    });
}
