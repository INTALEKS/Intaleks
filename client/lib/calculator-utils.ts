// Standard EBIT Calculation (Top-Down Approach)
// This follows IFRS/GAAP standards used globally

export interface FinancialYearData {
  sales: number;
  otherIncome: number;
  grossProfit: number; // Calculated: Sales + Other Income - COGS
  cogs: number;
  operatingExpenses: number;
  netProfitAndLoss: number; // Calculated: Gross Profit - Operating Expenses
  interestExpense: number;
  interestIncome: number;
  taxExpense: number;
  ebit: number; // Calculated: Net Profit + Interest Expense - Interest Income - Tax Expense
}

export interface Addback {
  id: string;
  description: string;
  value: number;
}

// Calculate Gross Profit
export const calculateGrossProfit = (sales: number, cogs: number): number => {
  return sales - cogs;
};

// Calculate EBIT (Earnings Before Interest and Taxes)
export const calculateEBIT = (grossProfit: number, operatingExpenses: number): number => {
  return grossProfit - operatingExpenses;
};

// Calculate Net Profit
export const calculateNetProfit = (ebit: number, interestExpense: number, interestIncome: number, taxExpense: number): number => {
  return ebit - interestExpense + interestIncome - taxExpense;
};

// Calculate Adjusted EBIT (EBIT + Addbacks)
export const calculateAdjustedEBIT = (ebit: number, totalAddbacks: number): number => {
  return ebit + totalAddbacks;
};

// Calculate Average Adjusted EBIT across years
// Average Adjusted EBIT = (Σ (EBIT_year + Addbacks_year)) / number of years
export const calculateAverageAdjustedEBIT = (ebitValues: number[], addbackValues: number[]): number => {
  const length = Math.min(ebitValues.length, addbackValues.length);
  if (length === 0) return 0;

  const total = Array.from({ length }).reduce((sum: number, _, index) => {
    const ebit = ebitValues[index] || 0;
    const addbacks = addbackValues[index] || 0;
    return sum + ebit + addbacks;
  }, 0);

  return total / length;
};

// Calculate Average EBIT across years
export const calculateAverageEBIT = (ebitValues: number[]): number => {
  if (ebitValues.length === 0) return 0;
  return ebitValues.reduce((sum, val) => sum + val, 0) / ebitValues.length;
};

// Asset Method Valuation
export const calculateAssetValuation = (totalAssets: number, totalLiabilities: number): number => {
  return totalAssets - totalLiabilities;
};

// Profit Method Valuation (Capitalization of Earnings)
export const calculateProfitValuation = (adjustedEBIT: number, capitalizationRate: number): number => {
  if (capitalizationRate <= 0) return 0;
  return (adjustedEBIT / capitalizationRate) * 100;
};

// DCF Method - Present Value calculation
export const calculatePresentValue = (cashflow: number, discountRate: number, year: number): number => {
  return cashflow / Math.pow(1 + discountRate / 100, year);
};

// DCF Method - Terminal Value
export const calculateTerminalValue = (lastYearCashflow: number, growthRate: number, discountRate: number): number => {
  if (discountRate <= growthRate) return 0;
  return (lastYearCashflow * (1 + growthRate / 100)) / ((discountRate - growthRate) / 100);
};

// Format currency
export const formatCurrency = (value: number, currency: string = "AUD"): string => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

import { valuationMultiplesAPI } from "./valuation-multiples-api";

// Industry multiples (now fetched from API with score ranges)
export const industryMultiples: Record<string, Record<string, Record<string, number>>> = {};

// Cache for industry multiples
let multiplesCache: Record<string, Record<string, Record<string, number>>> | null = null;
let multiplesPromise: Promise<Record<string, Record<string, Record<string, number>>>> | null = null;

/**
 * Load industry multiples from API
 */
export const loadIndustryMultiples = async (): Promise<Record<string, Record<string, Record<string, number>>>> => {
  if (multiplesCache) {
    return multiplesCache;
  }

  if (multiplesPromise) {
    return multiplesPromise;
  }

  multiplesPromise = valuationMultiplesAPI.getIndustryMultiples().then((multiples) => {
    multiplesCache = multiples;
    // Update the exported object
    Object.assign(industryMultiples, multiples);
    multiplesPromise = null;
    return multiples;
  });

  return multiplesPromise;
};

/**
 * Get base industry multiple (40-50 score range) with automatic loading
 */
export const getIndustryMultiple = async (country: string, industry: string): Promise<number> => {
  try {
    await loadIndustryMultiples();
    // Return the base multiple (40-50 range)
    return multiplesCache?.[country]?.[industry]?.["40-50"] || 4.0;
  } catch (error) {
    console.error("Failed to load industry multiples:", error);
    return 4.0; // Fallback to default
  }
};

/**
 * Get base industry multiple (synchronous version for backward compatibility)
 * Falls back to cached values or default 4.0
 */
export const getIndustryMultipleSync = (country: string, industry: string): number => {
  return multiplesCache?.[country]?.[industry]?.["40-50"] || 4.0;
};

// Initialize multiples on module load (with error handling)
loadIndustryMultiples().catch((error) => {
  console.error("Failed to initialize industry multiples:", error);
  // Continue with default values
});
