"use strict";
/**
 * Server-side calculator service
 * Recalculates all valuation metrics to prevent client-side manipulation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorService = void 0;
class CalculatorService {
    /**
     * Validate addbacks: if a reason is provided, at least one value must be non-zero
     */
    static validateAddbacks(addbacks) {
        for (const addback of addbacks) {
            // Skip empty addbacks (no reason)
            if (!addback.reason)
                continue;
            // Check if at least one value is non-zero
            const hasNonZeroValue = Object.values(addback.values).some((val) => {
                const numVal = Number(val);
                return !isNaN(numVal) && numVal !== 0;
            });
            if (!hasNonZeroValue) {
                throw new Error(`Addback with reason "${addback.reason}" must have at least one non-zero value`);
            }
        }
    }
    /**
     * Calculate profit-based valuation
     */
    static calculateProfitValuation(financialData, addbacks, multiple, years) {
        // Validate addbacks first
        this.validateAddbacks(addbacks);
        // Calculate metrics for each year
        const yearlyMetrics = {};
        for (const year of years) {
            const data = financialData[year];
            if (!data)
                continue;
            const sales = Number(data.sales) || 0;
            const otherIncome = Number(data.otherIncome) || 0;
            const cogs = Number(data.cogs) || 0;
            const operatingExpenses = Number(data.operatingExpenses) || 0;
            const interestExpense = Number(data.interestExpense) || 0;
            const interestIncome = Number(data.interestIncome) || 0;
            const grossProfit = sales + otherIncome - cogs;
            const netProfitAndLoss = grossProfit - operatingExpenses;
            const ebit = netProfitAndLoss + interestExpense - interestIncome;
            yearlyMetrics[year] = {
                sales,
                otherIncome,
                cogs,
                grossProfit,
                operatingExpenses,
                netProfitAndLoss,
                interestExpense,
                interestIncome,
                ebit,
            };
        }
        // Calculate addbacks per year
        const totalAddbacksByYear = {};
        let totalAddbacks = 0;
        for (const year of years) {
            let yearTotal = 0;
            for (const addback of addbacks) {
                const value = Number(addback.values[year]) || 0;
                yearTotal += value;
            }
            totalAddbacksByYear[year] = yearTotal;
            totalAddbacks += yearTotal;
        }
        // Calculate adjusted EBIT per year
        const adjustedEbitByYear = {};
        let totalAdjustedEbit = 0;
        for (const year of years) {
            const ebit = yearlyMetrics[year]?.ebit || 0;
            const addbacksForYear = totalAddbacksByYear[year] || 0;
            const adjustedEbit = ebit + addbacksForYear;
            adjustedEbitByYear[year] = adjustedEbit;
            totalAdjustedEbit += adjustedEbit;
        }
        // Calculate average adjusted EBIT
        const averageAdjustedEbit = years.length > 0 ? totalAdjustedEbit / years.length : 0;
        // Calculate final valuation
        const finalValuation = averageAdjustedEbit * multiple;
        return {
            yearlyMetrics,
            totalAddbacksByYear,
            totalAddbacks,
            adjustedEbitByYear,
            averageAdjustedEbit,
            finalValuation,
        };
    }
    /**
     * Calculate asset-based valuation
     */
    static calculateAssetValuation(assets, liabilities) {
        // Calculate total assets (landUseRights is China-only, included when present)
        const totalAssets = (Number(assets.plantEquipment) || 0) + (Number(assets.inventory) || 0) + (Number(assets.vehicles) || 0) + (Number(assets.goodwill) || 0) + (Number(assets.otherIntangible) || 0) + (Number(assets.landUseRights) || 0);
        // Calculate total liabilities
        const totalLiabilities = (Number(liabilities.loans) || 0) + (Number(liabilities.annualLeave) || 0) + (Number(liabilities.longServiceLeave) || 0) + (Number(liabilities.otherLiabilities) || 0);
        // Calculate net asset value
        const netAssetValue = totalAssets - totalLiabilities;
        return {
            yearlyMetrics: {},
            totalAddbacksByYear: {},
            totalAddbacks: 0,
            adjustedEbitByYear: {},
            averageAdjustedEbit: 0,
            finalValuation: netAssetValue,
            totalAssets,
            totalLiabilities,
            netAssetValue,
        };
    }
    /**
     * Validate and recalculate valuation
     * This is the main entry point that should be used by controllers
     */
    static validateAndCalculate(method, data) {
        if (method === "profit") {
            const { financialData, addbacks, multiple, years } = data;
            if (!financialData || !Array.isArray(years) || !multiple) {
                throw new Error("Invalid profit valuation data");
            }
            return this.calculateProfitValuation(financialData, addbacks || [], Number(multiple), years);
        }
        else if (method === "asset") {
            const { assets, liabilities } = data;
            if (!assets || !liabilities) {
                throw new Error("Invalid asset valuation data");
            }
            return this.calculateAssetValuation(assets, liabilities);
        }
        else {
            throw new Error("Invalid valuation method");
        }
    }
}
exports.CalculatorService = CalculatorService;
