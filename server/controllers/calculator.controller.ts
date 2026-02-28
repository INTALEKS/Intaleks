import { Request, Response, NextFunction } from "express";
import { CalculatorService } from "../services/calculator";

/**
 * Calculate valuation with server-side validation
 * POST /api/calculator/calculate
 *
 * SECURITY: Requires authentication and active subscription
 * All calculations performed server-side to prevent manipulation
 */
export const calculateValuation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { valuationMethod, financialData, addbacks, multiple, years, assets, liabilities } = req.body;

    if (!valuationMethod) {
      return res.status(400).json({ error: "Valuation method is required" });
    }

    let result: any;

    try {
      if (valuationMethod === "profit") {
        // Validate required fields
        if (!financialData || !years || !multiple) {
          return res.status(400).json({
            error: "Missing required fields for profit method: financialData, years, multiple",
          });
        }

        // Server-side calculation
        result = CalculatorService.validateAndCalculate("profit", {
          financialData,
          addbacks: addbacks || [],
          multiple: Number(multiple),
          years,
        });

        // Calculate averages for display
        const numYears = years.length;
        const averageSales =
          years.reduce((sum: number, year: string) => {
            return sum + (Number(financialData[year]?.sales) || 0);
          }, 0) / numYears;

        const averageCOGS =
          years.reduce((sum: number, year: string) => {
            return sum + (Number(financialData[year]?.cogs) || 0);
          }, 0) / numYears;

        const averageEbit =
          years.reduce((sum: number, year: string) => {
            return sum + (result.yearlyMetrics[year]?.ebit || 0);
          }, 0) / numYears;

        const averageAddbacks =
          years.reduce((sum: number, year: string) => {
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
      } else if (valuationMethod === "asset") {
        // Validate required fields
        if (!assets || !liabilities) {
          return res.status(400).json({
            error: "Missing required fields for asset method: assets, liabilities",
          });
        }

        // Server-side calculation
        result = CalculatorService.validateAndCalculate("asset", {
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
      } else {
        return res.status(400).json({ error: "Invalid valuation method" });
      }
    } catch (calcError) {
      console.error("Calculation error:", calcError);
      return res.status(400).json({
        error: "Invalid calculation data",
        message: calcError instanceof Error ? calcError.message : "Calculation failed",
      });
    }
  } catch (error) {
    next(error);
  }
};
