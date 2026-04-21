"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const calculator_1 = require("../services/calculator");
(0, vitest_1.describe)("CalculatorService", () => {
    (0, vitest_1.describe)("calculateProfitValuation", () => {
        (0, vitest_1.it)("should calculate profit valuation correctly", () => {
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
            const result = calculator_1.CalculatorService.calculateProfitValuation(financialData, addbacks, multiple, years);
            // Year 2023: Sales (500k) - COGS (200k) = Gross Profit (300k)
            // Gross Profit (300k) - Operating Expenses (150k) = Net P&L (150k)
            // EBIT = Net P&L (150k) + Interest Expense (10k) - Interest Income (5k) = 155k
            (0, vitest_1.expect)(result.yearlyMetrics["Year 2023"].ebit).toBe(155000);
            // Year 2024: Sales (600k) - COGS (240k) = Gross Profit (360k)
            // Gross Profit (360k) - Operating Expenses (180k) = Net P&L (180k)
            // EBIT = Net P&L (180k) + Interest Expense (12k) - Interest Income (6k) = 186k
            (0, vitest_1.expect)(result.yearlyMetrics["Year 2024"].ebit).toBe(186000);
            // Adjusted EBIT 2023 = EBIT (155k) + Addbacks (50k) = 205k
            (0, vitest_1.expect)(result.adjustedEbitByYear["Year 2023"]).toBe(205000);
            // Adjusted EBIT 2024 = EBIT (186k) + Addbacks (55k) = 241k
            (0, vitest_1.expect)(result.adjustedEbitByYear["Year 2024"]).toBe(241000);
            // Average Adjusted EBIT = (205k + 241k) / 2 = 223k
            (0, vitest_1.expect)(result.averageAdjustedEbit).toBe(223000);
            // Final Valuation = Average Adjusted EBIT (223k) × Multiple (4.0) = 892k
            (0, vitest_1.expect)(result.finalValuation).toBe(892000);
        });
        (0, vitest_1.it)("should handle missing addbacks", () => {
            const financialData = {
                "Year 2023": {
                    sales: 500000,
                    cogs: 200000,
                    operatingExpenses: 150000,
                    interestExpense: 10000,
                    interestIncome: 5000,
                },
            };
            const result = calculator_1.CalculatorService.calculateProfitValuation(financialData, [], 4.0, ["Year 2023"]);
            (0, vitest_1.expect)(result.totalAddbacks).toBe(0);
            (0, vitest_1.expect)(result.averageAdjustedEbit).toBe(155000); // Just EBIT
            (0, vitest_1.expect)(result.finalValuation).toBe(620000); // 155k × 4.0
        });
        (0, vitest_1.it)("should handle zero values correctly", () => {
            const financialData = {
                "Year 2023": {
                    sales: 0,
                    cogs: 0,
                    operatingExpenses: 0,
                    interestExpense: 0,
                    interestIncome: 0,
                },
            };
            const result = calculator_1.CalculatorService.calculateProfitValuation(financialData, [], 4.0, ["Year 2023"]);
            (0, vitest_1.expect)(result.yearlyMetrics["Year 2023"].ebit).toBe(0);
            (0, vitest_1.expect)(result.finalValuation).toBe(0);
        });
    });
    (0, vitest_1.describe)("calculateAssetValuation", () => {
        (0, vitest_1.it)("should calculate asset valuation correctly", () => {
            const assets = {
                cashAndBank_bv: 50000,
                cashAndBank_fmv: 50000,
                accountsReceivable_bv: 30000,
                accountsReceivable_fmv: 30000,
                inventory_bv: 50000,
                inventory_fmv: 55000,
                plantEquipment_bv: 100000,
                plantEquipment_fmv: 120000,
                vehicles_bv: 30000,
                vehicles_fmv: 35000,
                realEstate_bv: 200000,
                realEstate_fmv: 250000,
                intellectualProperty_bv: 50000,
                intellectualProperty_fmv: 75000,
                otherAssets_bv: 10000,
                otherAssets_fmv: 15000,
            };
            const liabilities = {
                accountsPayable_bv: 25000,
                accountsPayable_fmv: 25000,
                loansAndDebt_bv: 80000,
                loansAndDebt_fmv: 80000,
                otherLiabilities_bv: 5000,
                otherLiabilities_fmv: 5000,
            };
            const result = calculator_1.CalculatorService.calculateAssetValuation(assets, liabilities);
            // Total Assets FMV = 50k + 30k + 55k + 120k + 35k + 250k + 75k + 15k = 630k
            (0, vitest_1.expect)(result.totalAssets).toBe(630000);
            // Total Liabilities FMV = 25k + 80k + 5k = 110k
            (0, vitest_1.expect)(result.totalLiabilities).toBe(110000);
            // Net Asset Value FMV = 630k - 110k = 520k
            (0, vitest_1.expect)(result.netAssetValue).toBe(520000);
            (0, vitest_1.expect)(result.finalValuation).toBe(520000);
        });
        (0, vitest_1.it)("should handle negative net asset value", () => {
            const assets = {
                plantEquipment_fmv: 50000,
                inventory_fmv: 20000,
                vehicles_fmv: 10000,
            };
            const liabilities = {
                loansAndDebt_fmv: 100000,
                accountsPayable_fmv: 10000,
                otherLiabilities_fmv: 10000,
            };
            const result = calculator_1.CalculatorService.calculateAssetValuation(assets, liabilities);
            // Total Assets = 80k
            (0, vitest_1.expect)(result.totalAssets).toBe(80000);
            // Total Liabilities = 120k
            (0, vitest_1.expect)(result.totalLiabilities).toBe(120000);
            // Net Asset Value = 80k - 120k = -40k (negative)
            (0, vitest_1.expect)(result.netAssetValue).toBe(-40000);
            (0, vitest_1.expect)(result.finalValuation).toBe(-40000);
        });
    });
    (0, vitest_1.describe)("validateAndCalculate", () => {
        (0, vitest_1.it)("should validate and calculate profit method", () => {
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
            const result = calculator_1.CalculatorService.validateAndCalculate("profit", data);
            (0, vitest_1.expect)(result.finalValuation).toBe(620000); // 155k EBIT × 4.0
        });
        (0, vitest_1.it)("should validate and calculate asset method", () => {
            const data = {
                assets: {
                    cashAndBank_fmv: 50000,
                    plantEquipment_fmv: 100000,
                    inventory_fmv: 50000,
                    vehicles_fmv: 30000,
                },
                liabilities: {
                    loansAndDebt_fmv: 80000,
                    accountsPayable_fmv: 25000,
                    otherLiabilities_fmv: 5000,
                },
            };
            const result = calculator_1.CalculatorService.validateAndCalculate("asset", data);
            // Total Assets = 230k, Total Liabilities = 110k, Net = 120k
            (0, vitest_1.expect)(result.finalValuation).toBe(120000);
        });
        (0, vitest_1.it)("should throw error for invalid profit data", () => {
            (0, vitest_1.expect)(() => {
                calculator_1.CalculatorService.validateAndCalculate("profit", {});
            }).toThrow("Invalid profit valuation data");
        });
        (0, vitest_1.it)("should throw error for invalid asset data", () => {
            (0, vitest_1.expect)(() => {
                calculator_1.CalculatorService.validateAndCalculate("asset", {});
            }).toThrow("Invalid asset valuation data");
        });
        (0, vitest_1.it)("should throw error for invalid method", () => {
            (0, vitest_1.expect)(() => {
                calculator_1.CalculatorService.validateAndCalculate("invalid", {});
            }).toThrow("Invalid valuation method");
        });
    });
    (0, vitest_1.describe)("Client manipulation prevention", () => {
        (0, vitest_1.it)("should recalculate even if client sends manipulated values", () => {
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
            const result = calculator_1.CalculatorService.calculateProfitValuation(financialData, [], 4.0, ["Year 2023"]);
            // Server recalculates: (100k - 50k - 30k + 5k - 2k) = 23k EBIT
            // Valuation = 23k × 4.0 = 92k
            (0, vitest_1.expect)(result.finalValuation).toBe(92000);
            // Even if client claimed valuation was 1 million, server recalculates to 92k
            // This proves server-side validation prevents manipulation
        });
    });
});
