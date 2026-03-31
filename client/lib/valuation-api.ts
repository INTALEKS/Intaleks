import { FinancialYearData } from "./calculator-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

export interface Addback {
  id: string;
  reason: string;
  values: Record<string, number>; // year -> value mapping (e.g., {"2023": 5000, "2024": 6000, "2025": 7000})
}

export interface ValuationReportData {
  // Company Info
  companyName: string;
  country: string;
  industry: string;

  // Financial Data
  financialYears: string[];
  years?: string[]; // Server expects 'years' field for validation
  financialData: Record<string, FinancialYearData>;
  addbacks: Addback[];
  totalAddbacks: number;
  averageEbit: number;
  adjustedEbit: number;

  // Per-year derived values for clearer PDF presentation
  // adjustedEbitPerYear[yearLabel] = EBIT_year + Addbacks_year for that year
  adjustedEbitPerYear?: Record<string, number>;
  // totalAddbacksPerYear[yearLabel] = sum of all add-backs for that year
  totalAddbacksPerYear?: Record<string, number>;

  // Valuation Method
  valuationMethod: "asset" | "profit";

  // Valuation Multiple
  customMultiple?: string;
  // Source of the valuation multiple used in the report
  multipleSource?: "questionnaire" | "industry" | "custom";

  // Asset Method
  assets?: {
    plantEquipment: number;
    inventory: number;
    vehicles: number;
    goodwill: number;
    otherIntangible: number;
    landUseRights?: number;
  };
  liabilities?: {
    loans: number;
    annualLeave: number;
    longServiceLeave: number;
    otherLiabilities: number;
  };
  totalAssets?: number;
  totalLiabilities?: number;
  assetValuation?: number;

  // Profit Method
  profitValuation?: number;

  // Final Valuation
  finalValuation: number;

  // Equity Value (China & Indonesia only)
  totalDebt?: number;
  cashEquivalents?: number;
  equityValue?: number;

  // Extended fields for multi-page PDF with cover page (Requirements: 6.1)
  startedYear?: string;
  employees?: string;
  stage?: "startup" | "1-2-years" | "3-5-years" | "5-10-years" | "10-plus-years";
  logoBase64?: string; // Base64 encoded logo image
  logoMimeType?: string; // 'image/png' | 'image/jpeg' | 'image/svg+xml'
  generatedDate?: string;
  /** Days in each reporting period, keyed by the year label string */
  daysInPeriod?: Record<string, number>;
  /** ISO 4217 currency code, e.g. "AUD", "USD", "CAD" */
  currencyCode?: string;

  // Questionnaire data for RAVDA Scorecard
  questionnaireScore?: number;
  questionnaireCategory?: string;
  calculatedMultiple?: number;
  questionnaireScores?: {
    ownerDependence: number;
    recurringRevenue: number;
    customerConcentration: number;
    managementDepth: number;
    growthRate: number;
    competitiveAdvantage: number;
    revenueDiversification: number;
    systemsScalability: number;
    marginStability: number;
    externalRisk: number;
  };
}

export async function generateValuationPDF(data: ValuationReportData): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/valuation/generate-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate PDF");
  }

  return response.blob();
}

export async function downloadValuationPDF(data: ValuationReportData): Promise<void> {
  try {
    const blob = await generateValuationPDF(data);

    // Create a professional filename with company name and Intaleks branding
    const companyName = data.companyName || "Company";
    const filename = `${companyName} - Intaleks Business Valuation Report.pdf`;

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}
