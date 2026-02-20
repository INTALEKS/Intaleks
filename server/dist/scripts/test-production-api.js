"use strict";
/**
 * Test script to verify production API returns correct multiples
 */
const API_URL = "https://backend-production-6d2c.up.railway.app/api";
const testCases = [
    // Australia
    { country: "australia", industry: "service", score: 26, expectedMultiple: 1.0, scoreRange: "20-29" },
    { country: "australia", industry: "service", score: 45, expectedMultiple: 2.0, scoreRange: "40-50" },
    { country: "australia", industry: "service", score: 35, expectedMultiple: 1.6, scoreRange: "30-39" },
    { country: "australia", industry: "service", score: 15, expectedMultiple: 0.6, scoreRange: "<20" },
    { country: "australia", industry: "technology", score: 26, expectedMultiple: 3.75, scoreRange: "20-29" },
    { country: "australia", industry: "retail", score: 26, expectedMultiple: 1.5, scoreRange: "20-29" },
    // United States
    { country: "united states", industry: "service", score: 26, expectedMultiple: 1.25, scoreRange: "20-29" },
    { country: "united states", industry: "technology", score: 26, expectedMultiple: 4.0, scoreRange: "20-29" },
    { country: "united states", industry: "finance", score: 26, expectedMultiple: 2.75, scoreRange: "20-29" },
    // United Kingdom
    { country: "united kingdom", industry: "service", score: 26, expectedMultiple: 0.9, scoreRange: "20-29" },
    { country: "united kingdom", industry: "technology", score: 26, expectedMultiple: 3.5, scoreRange: "20-29" },
    // Canada
    { country: "canada", industry: "service", score: 26, expectedMultiple: 1.1, scoreRange: "20-29" },
    { country: "canada", industry: "technology", score: 26, expectedMultiple: 3.9, scoreRange: "20-29" },
];
async function testPreviewAPI(testCase) {
    const scores = {
        ownerDependence: 3,
        recurringRevenue: 2,
        customerConcentration: 3,
        managementDepth: 3,
        growthRate: 2,
        competitiveAdvantage: 3,
        revenueDiversification: 2,
        systemsScalability: 3,
        marginStability: 3,
        externalRisk: 2,
    };
    // Adjust scores to match the test case total
    const currentTotal = Object.values(scores).reduce((sum, val) => sum + val, 0);
    const diff = testCase.score - currentTotal;
    if (diff !== 0) {
        scores.ownerDependence += diff;
    }
    try {
        const response = await fetch(`${API_URL}/questionnaire/preview`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                country: testCase.country,
                industry: testCase.industry,
                ...scores,
            }),
        });
        if (!response.ok) {
            console.error(`❌ HTTP ${response.status} for ${testCase.country} + ${testCase.industry}`);
            return false;
        }
        const result = await response.json();
        const passed = result.totalScore === testCase.score && result.calculatedMultiple === testCase.expectedMultiple && result.scoreRange === testCase.scoreRange;
        if (passed) {
            console.log(`✅ ${testCase.country.padEnd(15)} + ${testCase.industry.padEnd(12)} (score ${testCase.score}): ${result.calculatedMultiple}x (expected ${testCase.expectedMultiple}x)`);
        }
        else {
            console.log(`❌ ${testCase.country.padEnd(15)} + ${testCase.industry.padEnd(12)} (score ${testCase.score}): ${result.calculatedMultiple}x (expected ${testCase.expectedMultiple}x)`);
            console.log(`   Score: ${result.totalScore} (expected ${testCase.score}), Range: ${result.scoreRange} (expected ${testCase.scoreRange})`);
        }
        return passed;
    }
    catch (error) {
        console.error(`❌ Error testing ${testCase.country} + ${testCase.industry}:`, error);
        return false;
    }
}
async function main() {
    console.log("🧪 Testing production API multiples calculation...\n");
    console.log(`API URL: ${API_URL}\n`);
    let passed = 0;
    let failed = 0;
    for (const testCase of testCases) {
        const result = await testPreviewAPI(testCase);
        if (result) {
            passed++;
        }
        else {
            failed++;
        }
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
    if (failed > 0) {
        process.exit(1);
    }
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
