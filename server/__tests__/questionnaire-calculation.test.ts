import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../config/db";
import { calculatePreviewMultiple } from "../services/questionnaire";

describe("Questionnaire Calculation Tests", () => {
  beforeAll(async () => {
    // Ensure we have test data in the database
    console.log("Setting up test data...");
  });

  afterAll(async () => {
    await prisma.$disconnect();
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

  describe("Score Range Calculation", () => {
    testScenarios.forEach((scenario) => {
      it(`should correctly calculate ${scenario.name}`, async () => {
        const result = await calculatePreviewMultiple("australia", "technology", scenario.scores);

        expect(result.totalScore).toBe(scenario.expectedScore);
        expect(result.scoreRange).toBe(scenario.expectedRange);
        expect(result.category).toBe(scenario.expectedCategory);
      });
    });
  });

  describe("Multiple Calculation for All Countries and Industries", () => {
    testCountries.forEach((country) => {
      testIndustries.forEach((industry) => {
        testScenarios.forEach((scenario) => {
          it(`should calculate correct multiple for ${country}/${industry} with ${scenario.name}`, async () => {
            try {
              const result = await calculatePreviewMultiple(country, industry, scenario.scores);

              console.log(`\n${country.toUpperCase()}/${industry.toUpperCase()} - ${scenario.name}:`);
              console.log(`  Total Score: ${result.totalScore}`);
              console.log(`  Score Range: ${result.scoreRange}`);
              console.log(`  Category: ${result.category}`);
              console.log(`  Base Multiple: ${result.baseMultiple}`);
              console.log(`  Score Factor: ${result.scoreFactor}`);
              console.log(`  Calculated Multiple: ${result.calculatedMultiple}`);
              console.log(`  Final Multiple: ${result.finalMultiple}`);

              // Basic validations
              expect(result.totalScore).toBe(scenario.expectedScore);
              expect(result.scoreRange).toBe(scenario.expectedRange);
              expect(result.category).toBe(scenario.expectedCategory);
              expect(result.calculatedMultiple).toBeGreaterThan(0);
              expect(result.baseMultiple).toBeGreaterThan(0);
              expect(result.scoreFactor).toBeGreaterThan(0);

              // Verify the relationship between base and calculated multiple
              const expectedCalculated = result.baseMultiple * result.scoreFactor;
              expect(Math.abs(result.calculatedMultiple - expectedCalculated)).toBeLessThan(0.01);
            } catch (error) {
              console.error(`Error testing ${country}/${industry} with ${scenario.name}:`, error);
              throw error;
            }
          });
        });
      });
    });
  });

  describe("Edge Cases and Validation", () => {
    it("should handle minimum score (10/50)", async () => {
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

      const result = await calculatePreviewMultiple("australia", "construction", minScores);

      expect(result.totalScore).toBe(10);
      expect(result.scoreRange).toBe("<20");
      expect(result.category).toBe("Below Average");
      expect(result.calculatedMultiple).toBeGreaterThan(0);
    });

    it("should handle maximum score (50/50)", async () => {
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

      const result = await calculatePreviewMultiple("australia", "technology", maxScores);

      expect(result.totalScore).toBe(50);
      expect(result.scoreRange).toBe("40-50");
      expect(result.category).toBe("Excellent");
      expect(result.calculatedMultiple).toBeGreaterThan(0);
    });

    it("should handle override multiple", async () => {
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
      const result = await calculatePreviewMultiple("australia", "technology", scores, overrideMultiple);

      expect(result.finalMultiple).toBe(overrideMultiple);
      expect(result.calculatedMultiple).not.toBe(overrideMultiple); // Should be different from calculated
    });
  });

  describe("Specific Issue Testing - Low Multiples with Low Scores", () => {
    it("should correctly handle hospitality (low base) with low score", async () => {
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

      const result = await calculatePreviewMultiple("australia", "hospitality", lowScores);

      console.log("\nHOSPITALITY LOW SCORE TEST:");
      console.log(`  Total Score: ${result.totalScore}`);
      console.log(`  Score Range: ${result.scoreRange}`);
      console.log(`  Base Multiple: ${result.baseMultiple}`);
      console.log(`  Score Factor: ${result.scoreFactor}`);
      console.log(`  Calculated Multiple: ${result.calculatedMultiple}`);
      console.log(`  Final Multiple: ${result.finalMultiple}`);

      // Hospitality base should be 3.5, <20 range should be much lower
      expect(result.scoreRange).toBe("<20");
      expect(result.calculatedMultiple).toBeLessThan(result.baseMultiple);
      expect(result.calculatedMultiple).toBeGreaterThan(0);
    });

    it("should correctly handle construction (medium base) with low score", async () => {
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

      const result = await calculatePreviewMultiple("australia", "construction", lowScores);

      console.log("\nCONSTRUCTION LOW SCORE TEST:");
      console.log(`  Total Score: ${result.totalScore}`);
      console.log(`  Score Range: ${result.scoreRange}`);
      console.log(`  Base Multiple: ${result.baseMultiple}`);
      console.log(`  Score Factor: ${result.scoreFactor}`);
      console.log(`  Calculated Multiple: ${result.calculatedMultiple}`);
      console.log(`  Final Multiple: ${result.finalMultiple}`);

      // Construction base should be 4.0, <20 range should be 1.2
      expect(result.scoreRange).toBe("<20");
      expect(result.baseMultiple).toBe(4.0);
      expect(result.calculatedMultiple).toBe(1.2); // From migration data
      expect(result.scoreFactor).toBe(0.3); // 1.2 / 4.0 = 0.3
    });
  });
});
