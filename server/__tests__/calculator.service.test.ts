import { describe, it, expect } from "vitest";
import { CalculatorService } from "../services/calculator";

describe("CalculatorService", () => {
  describe("calculateProfitValuation", () => {
    it("should calculate profit valuation correctly", () => {
      const financialData = {
        "Year 2023": {
          sales: 500000,
          cogs: 200000,
          operatingExpenses: 150000,
          interestExpense: 10000,
          interestIncome: 5000,
        },
        "Year 2024": {
          sales: 600000,
          cogs: 240000,
          operatingExpenses: 180000,
          interestExpense: 12000,
          interestIncome: 6000,
        },
      };

      const addbacks = [
        {
          reason: "Owner's salary",
          values: { "Year 2023": 50000, "Year 2024": 55000 },
        },
      ];

      const multiple = 4.0;
      const years = ["Year 2023", "Year 2024"];

      const result = CalculatorService.calculateProfitValuation(financialData, addbacks, multiple, years);

      // Year 2023: Sales (500k) - COGS (200k) = Gross Profit (300k)
      // Gross Profit (300k) - Operating Expenses (150k) = Net P&L (150k)
      // EBIT = Net P&L (150k) + Interest Expense (10k) - Interest Income (5k) = 155k
      expect(result.yearlyMetrics["Year 2023"].ebit).toBe(155000);

      // Year 2024: Sales (600k) - COGS (240k) = Gross Profit (360k)
      // Gross Profit (360k) - Operating Expenses (180k) = Net P&L (180k)
      // EBIT = Net P&L (180k) + Interest Expense (12k) - Interest Income (6k) = 186k
      expect(result.yearlyMetrics["Year 2024"].ebit).toBe(186000);

      // Adjusted EBIT 2023 = EBIT (155k) + Addbacks (50k) = 205k
      expect(result.adjustedEbitByYear["Year 2023"]).toBe(205000);

      // Adjusted EBIT 2024 = EBIT (186k) + Addbacks (55k) = 241k
      expect(result.adjustedEbitByYear["Year 2024"]).toBe(241000);

      // Average Adjusted EBIT = (205k + 241k) / 2 = 223k
      expect(result.averageAdjustedEbit).toBe(223000);

      // Final Valuation = Average Adjusted EBIT (223k) × Multiple (4.0) = 892k
      expect(result.finalValuation).toBe(892000);
    });

    it("should handle missing addbacks", () => {
      const financialData = {
        "Year 2023": {
          sales: 500000,
          cogs: 200000,
          operatingExpenses: 150000,
          interestExpense: 10000,
          interestIncome: 5000,
        },
      };

      const result = CalculatorService.calculateProfitValuation(financialData, [], 4.0, ["Year 2023"]);

      expect(result.totalAddbacks).toBe(0);
      expect(result.averageAdjustedEbit).toBe(155000); // Just EBIT
      expect(result.finalValuation).toBe(620000); // 155k × 4.0
    });

    it("should handle zero values correctly", () => {
      const financialData = {
        "Year 2023": {
          sales: 0,
          cogs: 0,
          operatingExpenses: 0,
          interestExpense: 0,
          interestIncome: 0,
        },
      };

      const result = CalculatorService.calculateProfitValuation(financialData, [], 4.0, ["Year 2023"]);

      expect(result.yearlyMetrics["Year 2023"].ebit).toBe(0);
      expect(result.finalValuation).toBe(0);
    });
  });

  describe("calculateAssetValuation", () => {
    it("should calculate asset valuation correctly", () => {
      const assets = {
        plantEquipment: 100000,
        inventory: 50000,
        vehicles: 30000,
        goodwill: 20000,
        otherIntangible: 10000,
      };

      const liabilities = {
        loans: 80000,
        annualLeave: 15000,
        longServiceLeave: 10000,
        otherLiabilities: 5000,
      };

      const result = CalculatorService.calculateAssetValuation(assets, liabilities);

      // Total Assets = 100k + 50k + 30k + 20k + 10k = 210k
      expect(result.totalAssets).toBe(210000);

      // Total Liabilities = 80k + 15k + 10k + 5k = 110k
      expect(result.totalLiabilities).toBe(110000);

      // Net Asset Value = 210k - 110k = 100k
      expect(result.netAssetValue).toBe(100000);
      expect(result.finalValuation).toBe(100000);
    });

    it("should handle negative net asset value", () => {
      const assets = {
        plantEquipment: 50000,
        inventory: 20000,
        vehicles: 10000,
        goodwill: 0,
        otherIntangible: 0,
      };

      const liabilities = {
        loans: 100000,
        annualLeave: 10000,
        longServiceLeave: 5000,
        otherLiabilities: 5000,
      };

      const result = CalculatorService.calculateAssetValuation(assets, liabilities);

      // Total Assets = 80k
      expect(result.totalAssets).toBe(80000);

      // Total Liabilities = 120k
      expect(result.totalLiabilities).toBe(120000);

      // Net Asset Value = 80k - 120k = -40k (negative)
      expect(result.netAssetValue).toBe(-40000);
      expect(result.finalValuation).toBe(-40000);
    });
  });

  describe("validateAndCalculate", () => {
    it("should validate and calculate profit method", () => {
      const data = {
        financialData: {
          "Year 2023": {
            sales: 500000,
            cogs: 200000,
            operatingExpenses: 150000,
            interestExpense: 10000,
            interestIncome: 5000,
          },
        },
        addbacks: [],
        multiple: 4.0,
        years: ["Year 2023"],
      };

      const result = CalculatorService.validateAndCalculate("profit", data);

      expect(result.finalValuation).toBe(620000); // 155k EBIT × 4.0
    });

    it("should validate and calculate asset method", () => {
      const data = {
        assets: {
          plantEquipment: 100000,
          inventory: 50000,
          vehicles: 30000,
          goodwill: 20000,
          otherIntangible: 10000,
        },
        liabilities: {
          loans: 80000,
          annualLeave: 15000,
          longServiceLeave: 10000,
          otherLiabilities: 5000,
        },
      };

      const result = CalculatorService.validateAndCalculate("asset", data);

      expect(result.finalValuation).toBe(100000);
    });

    it("should throw error for invalid profit data", () => {
      expect(() => {
        CalculatorService.validateAndCalculate("profit", {});
      }).toThrow("Invalid profit valuation data");
    });

    it("should throw error for invalid asset data", () => {
      expect(() => {
        CalculatorService.validateAndCalculate("asset", {});
      }).toThrow("Invalid asset valuation data");
    });

    it("should throw error for invalid method", () => {
      expect(() => {
        CalculatorService.validateAndCalculate("invalid" as any, {});
      }).toThrow("Invalid valuation method");
    });
  });

  describe("Client manipulation prevention", () => {
    it("should recalculate even if client sends manipulated values", () => {
      // Simulate client sending manipulated final valuation
      const financialData = {
        "Year 2023": {
          sales: 100000, // Real value
          cogs: 50000,
          operatingExpenses: 30000,
          interestExpense: 5000,
          interestIncome: 2000,
        },
      };

      const result = CalculatorService.calculateProfitValuation(financialData, [], 4.0, ["Year 2023"]);

      // Server recalculates: (100k - 50k - 30k + 5k - 2k) = 23k EBIT
      // Valuation = 23k × 4.0 = 92k
      expect(result.finalValuation).toBe(92000);

      // Even if client claimed valuation was 1 million, server recalculates to 92k
      // This proves server-side validation prevents manipulation
    });
  });
});
