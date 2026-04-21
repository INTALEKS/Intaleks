/**
 * Server-side calculator service
 * Recalculates all valuation metrics to prevent client-side manipulation
 */

interface FinancialYearData {
  sales: number;
  otherIncome?: number;
  cogs: number;
  operatingExpenses: number;
  interestExpense: number;
  interestIncome: number;
}

interface AddbackData {
  reason: string;
  customReason?: string;
  values: Record<string, number>; // year -> amount
}

interface AssetData {
  cashAndBank_bv?: number;
  cashAndBank_fmv?: number;
  accountsReceivable_bv?: number;
  accountsReceivable_fmv?: number;
  inventory_bv?: number;
  inventory_fmv?: number;
  plantEquipment_bv?: number;
  plantEquipment_fmv?: number;
  vehicles_bv?: number;
  vehicles_fmv?: number;
  realEstate_bv?: number;
  realEstate_fmv?: number;
  intellectualProperty_bv?: number;
  intellectualProperty_fmv?: number;
  otherAssets_bv?: number;
  otherAssets_fmv?: number;
  landUseRights_bv?: number;
  landUseRights_fmv?: number;
}

interface LiabilityData {
  accountsPayable_bv?: number;
  accountsPayable_fmv?: number;
  loansAndDebt_bv?: number;
  loansAndDebt_fmv?: number;
  otherLiabilities_bv?: number;
  otherLiabilities_fmv?: number;
}

interface CalculationResult {
  // Financial metrics per year
  yearlyMetrics: Record<
    string,
    {
      sales: number;
      otherIncome: number;
      cogs: number;
      grossProfit: number;
      operatingExpenses: number;
      netProfitAndLoss: number;
      interestExpense: number;
      interestIncome: number;
      ebit: number;
    }
  >;

  // Addbacks
  totalAddbacksByYear: Record<string, number>;
  totalAddbacks: number;

  // Adjusted EBIT
  adjustedEbitByYear: Record<string, number>;
  averageAdjustedEbit: number;

  // Final valuation
  finalValuation: number;

  // Asset method (if applicable)
  totalAssets?: number;
  totalLiabilities?: number;
  netAssetValue?: number;
}

export class CalculatorService {
  /**
   * Validate addbacks: if a reason is provided, at least one value must be non-zero
   */
  static validateAddbacks(addbacks: AddbackData[]): void {
    for (const addback of addbacks) {
      // Skip empty addbacks (no reason)
      if (!addback.reason) continue;

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
  static calculateProfitValuation(financialData: Record<string, FinancialYearData>, addbacks: AddbackData[], multiple: number, years: string[]): CalculationResult {
    // Validate addbacks first
    this.validateAddbacks(addbacks);

    // Calculate metrics for each year
    const yearlyMetrics: Record<string, any> = {};

    for (const year of years) {
      const data = financialData[year];
      if (!data) continue;

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
    const totalAddbacksByYear: Record<string, number> = {};
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
    const adjustedEbitByYear: Record<string, number> = {};
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
  static calculateAssetValuation(assets: AssetData, liabilities: LiabilityData): CalculationResult {
    // Calculate total assets for both Book Value and Fair Market Value
    const totalAssetsBV = (Number(assets.cashAndBank_bv) || 0) + (Number(assets.accountsReceivable_bv) || 0) + (Number(assets.inventory_bv) || 0) + (Number(assets.plantEquipment_bv) || 0) + (Number(assets.vehicles_bv) || 0) + (Number(assets.realEstate_bv) || 0) + (Number(assets.intellectualProperty_bv) || 0) + (Number(assets.otherAssets_bv) || 0) + (Number(assets.landUseRights_bv) || 0);

    const totalAssetsFMV = (Number(assets.cashAndBank_fmv) || 0) + (Number(assets.accountsReceivable_fmv) || 0) + (Number(assets.inventory_fmv) || 0) + (Number(assets.plantEquipment_fmv) || 0) + (Number(assets.vehicles_fmv) || 0) + (Number(assets.realEstate_fmv) || 0) + (Number(assets.intellectualProperty_fmv) || 0) + (Number(assets.otherAssets_fmv) || 0) + (Number(assets.landUseRights_fmv) || 0);

    // Calculate total liabilities for both Book Value and Fair Market Value
    const totalLiabilitiesBV = (Number(liabilities.accountsPayable_bv) || 0) + (Number(liabilities.loansAndDebt_bv) || 0) + (Number(liabilities.otherLiabilities_bv) || 0);

    const totalLiabilitiesFMV = (Number(liabilities.accountsPayable_fmv) || 0) + (Number(liabilities.loansAndDebt_fmv) || 0) + (Number(liabilities.otherLiabilities_fmv) || 0);

    // Calculate net asset value for both (use FMV as the primary valuation)
    const netAssetValueBV = totalAssetsBV - totalLiabilitiesBV;
    const netAssetValueFMV = totalAssetsFMV - totalLiabilitiesFMV;

    return {
      yearlyMetrics: {},
      totalAddbacksByYear: {},
      totalAddbacks: 0,
      adjustedEbitByYear: {},
      averageAdjustedEbit: 0,
      finalValuation: netAssetValueFMV, // Use Fair Market Value as the final valuation
      totalAssets: totalAssetsFMV,
      totalLiabilities: totalLiabilitiesFMV,
      netAssetValue: netAssetValueFMV,
    };
  }

  /**
   * Validate and recalculate valuation
   * This is the main entry point that should be used by controllers
   */
  static validateAndCalculate(method: "profit" | "asset", data: any): CalculationResult {
    if (method === "profit") {
      const { financialData, addbacks, multiple, years } = data;

      if (!financialData || !Array.isArray(years) || !multiple) {
        throw new Error("Invalid profit valuation data");
      }

      return this.calculateProfitValuation(financialData, addbacks || [], Number(multiple), years);
    } else if (method === "asset") {
      const { assets, liabilities } = data;

      if (!assets || !liabilities) {
        throw new Error("Invalid asset valuation data");
      }

      return this.calculateAssetValuation(assets, liabilities);
    } else {
      throw new Error("Invalid valuation method");
    }
  }
}
