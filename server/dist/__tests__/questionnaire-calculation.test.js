"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_1 = require("../config/db");
const questionnaire_1 = require("../services/questionnaire");
(0, vitest_1.describe)("Questionnaire Calculation Tests", () => {
    (0, vitest_1.beforeAll)(async () => {
        // Ensure we have test data in the database
        console.log("Setting up test data...");
    });
    (0, vitest_1.afterAll)(async () => {
        await db_1.prisma.$disconnect();
    });
    // Test data for different score scenarios
    const testScenarios = [
        {
            name: "High Score (45/50) - Excellent",
            scores: {
                ownerDependence: 5,
                recurringRevenue: 5,
                customerConcentration: 5,
                managementDepth: 5,
                growthRate: 5,
                competitiveAdvantage: 5,
                revenueDiversification: 5,
                systemsScalability: 5,
                marginStability: 5,
                externalRisk: 5,
            },
            expectedScore: 50,
            expectedRange: "40-50",
            expectedCategory: "Excellent",
        },
        {
            name: "Good Score (35/50) - Good",
            scores: {
                ownerDependence: 4,
                recurringRevenue: 4,
                customerConcentration: 3,
                managementDepth: 4,
                growthRate: 3,
                competitiveAdvantage: 4,
                revenueDiversification: 3,
                systemsScalability: 4,
                marginStability: 3,
                externalRisk: 3,
            },
            expectedScore: 35,
            expectedRange: "30-39",
            expectedCategory: "Good",
        },
        {
            name: "Average Score (25/50) - Average",
            scores: {
                ownerDependence: 3,
                recurringRevenue: 2,
                customerConcentration: 3,
                managementDepth: 2,
                growthRate: 3,
                competitiveAdvantage: 2,
                revenueDiversification: 3,
                systemsScalability: 2,
                marginStability: 3,
                externalRisk: 2,
            },
            expectedScore: 25,
            expectedRange: "20-29",
            expectedCategory: "Average",
        },
        {
            name: "Low Score (15/50) - Below Average",
            scores: {
                ownerDependence: 1,
                recurringRevenue: 1,
                customerConcentration: 2,
                managementDepth: 1,
                growthRate: 2,
                competitiveAdvantage: 1,
                revenueDiversification: 2,
                systemsScalability: 1,
                marginStability: 2,
                externalRisk: 2,
            },
            expectedScore: 15,
            expectedRange: "<20",
            expectedCategory: "Below Average",
        },
    ];
    const testCountries = ["australia", "united states", "united kingdom", "canada"];
    const testIndustries = ["construction", "technology", "healthcare", "hospitality", "finance"];
    (0, vitest_1.describe)("Score Range Calculation", () => {
        testScenarios.forEach((scenario) => {
            (0, vitest_1.it)(`should correctly calculate ${scenario.name}`, async () => {
                const result = await (0, questionnaire_1.calculatePreviewMultiple)("australia", "technology", scenario.scores);
                (0, vitest_1.expect)(result.totalScore).toBe(scenario.expectedScore);
                (0, vitest_1.expect)(result.scoreRange).toBe(scenario.expectedRange);
                (0, vitest_1.expect)(result.category).toBe(scenario.expectedCategory);
            });
        });
    });
    (0, vitest_1.describe)("Multiple Calculation for All Countries and Industries", () => {
        testCountries.forEach((country) => {
            testIndustries.forEach((industry) => {
                testScenarios.forEach((scenario) => {
                    (0, vitest_1.it)(`should calculate correct multiple for ${country}/${industry} with ${scenario.name}`, async () => {
                        try {
                            const result = await (0, questionnaire_1.calculatePreviewMultiple)(country, industry, scenario.scores);
                            console.log(`\n${country.toUpperCase()}/${industry.toUpperCase()} - ${scenario.name}:`);
                            console.log(`  Total Score: ${result.totalScore}`);
                            console.log(`  Score Range: ${result.scoreRange}`);
                            console.log(`  Category: ${result.category}`);
                            console.log(`  Base Multiple: ${result.baseMultiple}`);
                            console.log(`  Score Factor: ${result.scoreFactor}`);
                            console.log(`  Calculated Multiple: ${result.calculatedMultiple}`);
                            console.log(`  Final Multiple: ${result.finalMultiple}`);
                            // Basic validations
                            (0, vitest_1.expect)(result.totalScore).toBe(scenario.expectedScore);
                            (0, vitest_1.expect)(result.scoreRange).toBe(scenario.expectedRange);
                            (0, vitest_1.expect)(result.category).toBe(scenario.expectedCategory);
                            (0, vitest_1.expect)(result.calculatedMultiple).toBeGreaterThan(0);
                            (0, vitest_1.expect)(result.baseMultiple).toBeGreaterThan(0);
                            (0, vitest_1.expect)(result.scoreFactor).toBeGreaterThan(0);
                            // Verify the relationship between base and calculated multiple
                            const expectedCalculated = result.baseMultiple * result.scoreFactor;
                            (0, vitest_1.expect)(Math.abs(result.calculatedMultiple - expectedCalculated)).toBeLessThan(0.01);
                        }
                        catch (error) {
                            console.error(`Error testing ${country}/${industry} with ${scenario.name}:`, error);
                            throw error;
                        }
                    });
                });
            });
        });
    });
    (0, vitest_1.describe)("Edge Cases and Validation", () => {
        (0, vitest_1.it)("should handle minimum score (10/50)", async () => {
            const minScores = {
                ownerDependence: 1,
                recurringRevenue: 1,
                customerConcentration: 1,
                managementDepth: 1,
                growthRate: 1,
                competitiveAdvantage: 1,
                revenueDiversification: 1,
                systemsScalability: 1,
                marginStability: 1,
                externalRisk: 1,
            };
            const result = await (0, questionnaire_1.calculatePreviewMultiple)("australia", "construction", minScores);
            (0, vitest_1.expect)(result.totalScore).toBe(10);
            (0, vitest_1.expect)(result.scoreRange).toBe("<20");
            (0, vitest_1.expect)(result.category).toBe("Below Average");
            (0, vitest_1.expect)(result.calculatedMultiple).toBeGreaterThan(0);
        });
        (0, vitest_1.it)("should handle maximum score (50/50)", async () => {
            const maxScores = {
                ownerDependence: 5,
                recurringRevenue: 5,
                customerConcentration: 5,
                managementDepth: 5,
                growthRate: 5,
                competitiveAdvantage: 5,
                revenueDiversification: 5,
                systemsScalability: 5,
                marginStability: 5,
                externalRisk: 5,
            };
            const result = await (0, questionnaire_1.calculatePreviewMultiple)("australia", "technology", maxScores);
            (0, vitest_1.expect)(result.totalScore).toBe(50);
            (0, vitest_1.expect)(result.scoreRange).toBe("40-50");
            (0, vitest_1.expect)(result.category).toBe("Excellent");
            (0, vitest_1.expect)(result.calculatedMultiple).toBeGreaterThan(0);
        });
        (0, vitest_1.it)("should handle override multiple", async () => {
            const scores = {
                ownerDependence: 3,
                recurringRevenue: 3,
                customerConcentration: 3,
                managementDepth: 3,
                growthRate: 3,
                competitiveAdvantage: 3,
                revenueDiversification: 3,
                systemsScalability: 3,
                marginStability: 3,
                externalRisk: 3,
            };
            const overrideMultiple = 10.5;
            const result = await (0, questionnaire_1.calculatePreviewMultiple)("australia", "technology", scores, overrideMultiple);
            (0, vitest_1.expect)(result.finalMultiple).toBe(overrideMultiple);
            (0, vitest_1.expect)(result.calculatedMultiple).not.toBe(overrideMultiple); // Should be different from calculated
        });
    });
    (0, vitest_1.describe)("Specific Issue Testing - Low Multiples with Low Scores", () => {
        (0, vitest_1.it)("should correctly handle hospitality (low base) with low score", async () => {
            const lowScores = {
                ownerDependence: 1,
                recurringRevenue: 1,
                customerConcentration: 1,
                managementDepth: 1,
                growthRate: 1,
                competitiveAdvantage: 1,
                revenueDiversification: 1,
                systemsScalability: 1,
                marginStability: 1,
                externalRisk: 1,
            };
            const result = await (0, questionnaire_1.calculatePreviewMultiple)("australia", "hospitality", lowScores);
            console.log("\nHOSPITALITY LOW SCORE TEST:");
            console.log(`  Total Score: ${result.totalScore}`);
            console.log(`  Score Range: ${result.scoreRange}`);
            console.log(`  Base Multiple: ${result.baseMultiple}`);
            console.log(`  Score Factor: ${result.scoreFactor}`);
            console.log(`  Calculated Multiple: ${result.calculatedMultiple}`);
            console.log(`  Final Multiple: ${result.finalMultiple}`);
            // Hospitality base should be 3.5, <20 range should be much lower
            (0, vitest_1.expect)(result.scoreRange).toBe("<20");
            (0, vitest_1.expect)(result.calculatedMultiple).toBeLessThan(result.baseMultiple);
            (0, vitest_1.expect)(result.calculatedMultiple).toBeGreaterThan(0);
        });
        (0, vitest_1.it)("should correctly handle construction (medium base) with low score", async () => {
            const lowScores = {
                ownerDependence: 1,
                recurringRevenue: 1,
                customerConcentration: 1,
                managementDepth: 1,
                growthRate: 1,
                competitiveAdvantage: 1,
                revenueDiversification: 1,
                systemsScalability: 1,
                marginStability: 1,
                externalRisk: 1,
            };
            const result = await (0, questionnaire_1.calculatePreviewMultiple)("australia", "construction", lowScores);
            console.log("\nCONSTRUCTION LOW SCORE TEST:");
            console.log(`  Total Score: ${result.totalScore}`);
            console.log(`  Score Range: ${result.scoreRange}`);
            console.log(`  Base Multiple: ${result.baseMultiple}`);
            console.log(`  Score Factor: ${result.scoreFactor}`);
            console.log(`  Calculated Multiple: ${result.calculatedMultiple}`);
            console.log(`  Final Multiple: ${result.finalMultiple}`);
            // Construction base should be 4.0, <20 range should be 1.2
            (0, vitest_1.expect)(result.scoreRange).toBe("<20");
            (0, vitest_1.expect)(result.baseMultiple).toBe(4.0);
            (0, vitest_1.expect)(result.calculatedMultiple).toBe(1.2); // From migration data
            (0, vitest_1.expect)(result.scoreFactor).toBe(0.3); // 1.2 / 4.0 = 0.3
        });
    });
});
