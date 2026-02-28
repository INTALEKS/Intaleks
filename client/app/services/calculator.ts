import { ApiClient } from "./api";

export interface CalculateValuationRequest {
  valuationMethod: "profit" | "asset";
  financialData?: Record<string, any>;
  addbacks?: Array<{ reason: string; values: Record<string, number> }>;
  multiple?: number;
  years?: string[];
  assets?: Record<string, number>;
  liabilities?: Record<string, number>;
}

export interface ProfitValuationResponse {
  success: true;
  method: "profit";
  averageSales: number;
  averageCOGS: number;
  averageEbit: number;
  averageAddbacks: number;
  adjustedEbit: number;
  valuationMultiple: number;
  finalValuation: number;
  yearlyMetrics: Record<string, any>;
  adjustedEbitByYear: Record<string, number>;
}

export interface AssetValuationResponse {
  success: true;
  method: "asset";
  totalAssets: number;
  totalLiabilities: number;
  netAssetValue: number;
  finalValuation: number;
}

export type CalculateValuationResponse = ProfitValuationResponse | AssetValuationResponse;

export const CalculatorAPI = {
  /**
   * Calculate valuation on server with full validation
   * Requires authentication and active subscription
   */
  async calculateValuation(data: CalculateValuationRequest): Promise<CalculateValuationResponse> {
    const response = await fetch(`${ApiClient.BASE_URL}/calculator/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to calculate valuation");
    }

    return response.json();
  },
};
