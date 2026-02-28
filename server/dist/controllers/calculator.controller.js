"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateValuation = void 0;
const calculator_1 = require("../services/calculator");
/**
 * Calculate valuation with server-side validation
 * POST /api/calculator/calculate
 *
 * SECURITY: Requires authentication and active subscription
 * All calculations performed server-side to prevent manipulation
 */
const calculateValuation = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { valuationMethod, financialData, addbacks, multiple, years, assets, liabilities } = req.body;
        if (!valuationMethod) {
            return res.status(400).json({ error: "Valuation method is required" });
        }
        let result;
        try {
            if (valuationMethod === "profit") {
                // Validate required fields
                if (!financialData || !years || !multiple) {
                    return res.status(400).json({
                        error: "Missing required fields for profit method: financialData, years, multiple",
                    });
                }
                // Server-side calculation
                result = calculator_1.CalculatorService.validateAndCalculate("profit", {
                    financialData,
                    addbacks: addbacks || [],
                    multiple: Number(multiple),
                    years,
                });
                // Calculate averages for display
                const numYears = years.length;
                const averageSales = years.reduce((sum, year) => {
                    return sum + (Number(financialData[year]?.sales) || 0);
                }, 0) / numYears;
                const averageCOGS = years.reduce((sum, year) => {
                    return sum + (Number(financialData[year]?.cogs) || 0);
                }, 0) / numYears;
                const averageEbit = years.reduce((sum, year) => {
                    return sum + (result.yearlyMetrics[year]?.ebit || 0);
                }, 0) / numYears;
                const averageAddbacks = years.reduce((sum, year) => {
                    return sum + (result.totalAddbacksByYear[year] || 0);
                }, 0) / numYears;
                // Log for audit
                console.log(`[AUDIT] User ${userId} calculated profit valuation: ${result.finalValuation.toFixed(2)}`);
                return res.json({
                    success: true,
                    method: "profit",
                    averageSales,
                    averageCOGS,
                    averageEbit,
                    averageAddbacks,
                    adjustedEbit: result.averageAdjustedEbit,
                    valuationMultiple: multiple,
                    finalValuation: result.finalValuation,
                    yearlyMetrics: result.yearlyMetrics,
                    adjustedEbitByYear: result.adjustedEbitByYear,
                });
            }
            else if (valuationMethod === "asset") {
                // Validate required fields
                if (!assets || !liabilities) {
                    return res.status(400).json({
                        error: "Missing required fields for asset method: assets, liabilities",
                    });
                }
                // Server-side calculation
                result = calculator_1.CalculatorService.validateAndCalculate("asset", {
                    assets,
                    liabilities,
                });
                // Log for audit
                console.log(`[AUDIT] User ${userId} calculated asset valuation: ${result.finalValuation.toFixed(2)}`);
                return res.json({
                    success: true,
                    method: "asset",
                    totalAssets: result.totalAssets,
                    totalLiabilities: result.totalLiabilities,
                    netAssetValue: result.netAssetValue,
                    finalValuation: result.finalValuation,
                });
            }
            else {
                return res.status(400).json({ error: "Invalid valuation method" });
            }
        }
        catch (calcError) {
            console.error("Calculation error:", calcError);
            return res.status(400).json({
                error: "Invalid calculation data",
                message: calcError instanceof Error ? calcError.message : "Calculation failed",
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.calculateValuation = calculateValuation;
