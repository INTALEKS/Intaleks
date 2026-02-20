import { calculatePreviewMultiple } from "../services/questionnaire";

async function testWholesaleFix() {
  console.log("=== TESTING WHOLESALE FIX ===\n");

  // Test the exact scenario from the user's screenshot
  const testScores = {
    ownerDependence: 2,
    recurringRevenue: 2,
    customerConcentration: 2,
    managementDepth: 2,
    growthRate: 3,
    competitiveAdvantage: 2,
    revenueDiversification: 3,
    systemsScalability: 2,
    marginStability: 3,
    externalRisk: 2,
  };

  console.log("Test Scores:", testScores);
  console.log(
    "Total Score:",
    Object.values(testScores).reduce((sum, val) => sum + val, 0),
  );

  // Test US Wholesale (the problematic case)
  console.log("\n=== US WHOLESALE TEST ===");
  const result = await calculatePreviewMultiple("united states", "wholesale", testScores);

  console.log("Result:", {
    totalScore: result.totalScore,
    scoreRange: result.scoreRange,
    category: result.category,
    baseMultiple: result.baseMultiple,
    scoreFactor: result.scoreFactor,
    calculatedMultiple: result.calculatedMultiple,
    finalMultiple: result.finalMultiple,
  });

  console.log("\n=== EXPECTED vs ACTUAL ===");
  console.log("Expected for score 23/50 with US Wholesale:");
  console.log("- Score Range: 20-29 (Average)");
  console.log("- Base Multiple: 3.5x (40-50 range)");
  console.log("- Score Factor: 0.5 (50% for 20-29 range)");
  console.log("- Calculated Multiple: 1.75x (3.5 × 0.5)");

  console.log("\nActual Result:");
  console.log(`- Score Range: ${result.scoreRange}`);
  console.log(`- Base Multiple: ${result.baseMultiple}x`);
  console.log(`- Score Factor: ${result.scoreFactor}`);
  console.log(`- Calculated Multiple: ${result.calculatedMultiple}x`);

  const isCorrect = result.totalScore === 23 && result.scoreRange === "20-29" && result.baseMultiple === 3.5 && result.scoreFactor === 0.5 && result.calculatedMultiple === 1.75;

  console.log(`\n${isCorrect ? "✅ FIX SUCCESSFUL" : "❌ FIX FAILED"}`);

  if (!isCorrect) {
    console.log("The calculation is still incorrect!");
  } else {
    console.log("The wholesale industry calculation is now working correctly!");
    console.log("Score 23/50 with US Wholesale now gives 1.75x instead of 4.0x");
  }
}

testWholesaleFix().catch(console.error);
