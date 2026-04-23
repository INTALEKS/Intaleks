"use client";

import { useState, useMemo, useEffect } from "react";
import { Download, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar, Footer } from "@/components/home";
import { AccordionSection, MethodToggle, ValuationMethod, CountryIndustrySelector, FinancialDataTable, AddbacksTable, StepProgress, CompanyQuestionnaire, ValuationDocumentList, EarningCapacitySection, AddbacksExamplesSection, ValuationSummaryCard, FinancialInfoSelector, columnsToYearLabels, type FinancialColumn } from "@/components/calculator";
import { AssetMethod } from "@/components/calculator/methods";
import { CouponRedeemForm } from "@/components/calculator/CouponRedeemForm";
import { calculateAverageAdjustedEBIT, formatCurrency, FinancialYearData } from "@/lib/calculator-utils";
import { downloadValuationPDF, ValuationReportData } from "@/lib/valuation-api";
import { getCurrencyForCalculatorCountry } from "@/lib/currency-utils";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ApiClient, type SubscriptionPlan } from "@/app/services/api";
import { ValuationQuestionnaire } from "@/components/calculator/ValuationQuestionnaire";
import { useCalculatePreview } from "@/app/hooks/useQuestionnaire";
import { useValuationMultiples } from "@/app/hooks/useValuationMultiples";
import { useCalculateValuation } from "@/app/hooks/useCalculator";
import { useCreateCheckout } from "@/app/hooks/usePayments";
import type { QuestionnaireScores } from "@/lib/questionnaire-api";
import type { CalculateValuationResponse } from "@/app/services/calculator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

// LocalStorage key for calculator data persistence
const CALCULATOR_STORAGE_KEY = "intaleks_calculator_data";
const CALCULATOR_TIMESTAMP_KEY = "intaleks_calculator_timestamp";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Financial metrics following standard P&L structure with sample placeholders
// Only input fields - calculated fields are handled separately
const financialMetrics = [
  { key: "sales", label: "Sales", placeholder: "500", isInput: true },
  { key: "otherIncome", label: "Other Income", placeholder: "0", isInput: true },
  { key: "cogs", label: "COGS", placeholder: "200", isInput: true },
  { key: "grossProfit", label: "Gross profit", placeholder: "", isInput: false }, // Calculated: Sales + Other Income - COGS
  { key: "operatingExpenses", label: "Operating Expenses", placeholder: "150", isInput: true },
  { key: "netProfitAndLoss", label: "Net profit and Loss", placeholder: "", isInput: false }, // Calculated: Gross Profit - Operating Expenses
  { key: "interestExpense", label: "Interest Expense", placeholder: "10", isInput: true },
  { key: "interestIncome", label: "Interest Income", placeholder: "5", isInput: true },
];

// Type for persisted calculator state
interface CalculatorState {
  companyName: string;
  startedYear: string;
  employees: string;
  stage: string;
  country: string;
  industry: string;
  customMultiple: string;
  questionnaireScores: QuestionnaireScores;
  calculatedMultiple?: number;
  multipleCategory?: string;
  totalScore?: number;
  useQuestionnaireMultiple: boolean;
  selectedYears: FinancialColumn[];
  financialData: Record<string, Record<string, string>>;
  addbacks: Array<{ id: string; reason: string; customReason?: string; values: Record<string, string> }>;
  selectedMethod: ValuationMethod | "";
  assets: Record<string, string>;
  liabilities: Record<string, string>;
  companyLogoData?: string; // base64 encoded logo
  companyLogoName?: string;
  companyLogoType?: string;
}

// SubscribeButton component for authenticated users without subscription
function SubscribeButton() {
  const createCheckout = useCreateCheckout();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      setIsLoadingPlans(true);
      try {
        const response = await ApiClient.getPublicPlans();
        if (response.success) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  const handleSubscribeClick = () => {
    const paidPlan = plans.find((plan) => plan.price > 0);
    if (paidPlan) {
      createCheckout.mutate({
        planId: paidPlan.id,
        successUrl: `${window.location.origin}/calculator?success=true`,
        cancelUrl: `${window.location.origin}/calculator`,
      });
    }
  };

  return (
    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubscribeClick} disabled={createCheckout.isPending || isLoadingPlans}>
      {createCheckout.isPending || isLoadingPlans ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        "Subscribe Now"
      )}
    </Button>
  );
}

export default function CalculatorPage() {
  const router = useRouter();
  const { isAuthenticated, hasActiveSubscription, hasCouponAccess, couponUsed, hasCalculatorAccess, subscriptionStatus, user } = useAuthState();
  const queryClient = useQueryClient();
  const { getMultiple } = useValuationMultiples();

  // Helper function to get initial state from localStorage with expiration check
  const getInitialState = () => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const savedState = localStorage.getItem(CALCULATOR_STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(CALCULATOR_TIMESTAMP_KEY);

      if (savedState) {
        // If there's data but no timestamp, it's old data - clear it
        if (!savedTimestamp) {
          console.log("No timestamp found for calculator data, clearing old localStorage");
          localStorage.removeItem(CALCULATOR_STORAGE_KEY);
          return null;
        }

        const timestamp = parseInt(savedTimestamp, 10);
        const now = Date.now();
        const age = now - timestamp;

        // Check if cache has expired (older than 24 hours)
        if (age > CACHE_EXPIRY_MS) {
          console.log("Calculator cache expired, clearing localStorage");
          localStorage.removeItem(CALCULATOR_STORAGE_KEY);
          localStorage.removeItem(CALCULATOR_TIMESTAMP_KEY);
          return null;
        }

        return JSON.parse(savedState) as CalculatorState;
      }
    } catch (error) {
      console.error("Failed to parse saved state:", error);
      // Clear corrupted data
      if (typeof window !== "undefined") {
        localStorage.removeItem(CALCULATOR_STORAGE_KEY);
        localStorage.removeItem(CALCULATOR_TIMESTAMP_KEY);
      }
    }
    return null;
  };

  const initialState = getInitialState();

  // Track if we've restored data from localStorage
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Terms and Conditions acceptance state
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hasCheckedTerms, setHasCheckedTerms] = useState(false);

  // ============================================
  // STEP 1: Company Information State
  // ============================================
  const [companyName, setCompanyName] = useState(initialState?.companyName || "");
  const [startedYear, setStartedYear] = useState(initialState?.startedYear || "");
  const [employees, setEmployees] = useState(initialState?.employees || "");
  const [stage, setStage] = useState(initialState?.stage || "");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [country, setCountry] = useState(initialState?.country || "");
  const [industry, setIndustry] = useState(initialState?.industry || "");
  const [customMultiple, setCustomMultiple] = useState(initialState?.customMultiple || "");

  // ============================================
  // Questionnaire State
  // ============================================
  const [questionnaireScores, setQuestionnaireScores] = useState<QuestionnaireScores>(
    initialState?.questionnaireScores || {
      ownerDependence: 0,
      recurringRevenue: 0,
      customerConcentration: 0,
      managementDepth: 0,
      growthRate: 0,
      competitiveAdvantage: 0,
      revenueDiversification: 0,
      systemsScalability: 0,
      marginStability: 0,
      externalRisk: 0,
    },
  );
  const [calculatedMultiple, setCalculatedMultiple] = useState<number | undefined>(initialState?.calculatedMultiple);
  const [multipleCategory, setMultipleCategory] = useState<string | undefined>(initialState?.multipleCategory);
  const [totalScore, setTotalScore] = useState<number | undefined>(initialState?.totalScore);
  const [useQuestionnaireMultiple, setUseQuestionnaireMultiple] = useState(initialState?.useQuestionnaireMultiple || false);

  const calculatePreviewMutation = useCalculatePreview();

  // Auto-select Australia as default country if no country is selected
  useEffect(() => {
    if (!country && isInitialMount) {
      setCountry("australia");
    }
  }, [country, isInitialMount]);

  // ============================================
  // STEP 2: Financial Data State
  // ============================================
  // Financial column selection state — replaces raw year numbers
  const [selectedYears, setSelectedYears] = useState<FinancialColumn[]>(
    initialState?.selectedYears && Array.isArray(initialState.selectedYears) && initialState.selectedYears.length > 0 && typeof (initialState.selectedYears[0] as unknown) !== "number"
      ? (initialState.selectedYears as FinancialColumn[]).map((col) => ({
          ...col,
          periodDate: col.periodDate ? new Date(col.periodDate) : undefined,
        }))
      : [
          { type: "2Yr Prev" as const, daysInPeriod: 365, periodDate: undefined },
          { type: "Year 1" as const, daysInPeriod: 365, periodDate: undefined },
          { type: "Year 2" as const, daysInPeriod: 365, periodDate: undefined },
        ],
  );

  // Derive year label strings from the column definitions
  const financialYears = useMemo(() => columnsToYearLabels(selectedYears), [selectedYears]);

  const [financialData, setFinancialData] = useState<Record<string, Record<string, string>>>(initialState?.financialData || {});
  const [addbacks, setAddbacks] = useState(
    initialState?.addbacks || [
      { id: "1", reason: "", customReason: "", values: {} as Record<string, string> },
      { id: "2", reason: "", customReason: "", values: {} as Record<string, string> },
      { id: "3", reason: "", customReason: "", values: {} as Record<string, string> },
    ],
  );

  // ============================================
  // STEP 3: Valuation Model State
  // ============================================
  const [selectedMethod, setSelectedMethod] = useState<ValuationMethod | "">(initialState?.selectedMethod || "");

  // Asset Method
  const [assets, setAssets] = useState<Record<string, string>>(initialState?.assets || {});
  const [liabilities, setLiabilities] = useState<Record<string, string>>(initialState?.liabilities || {});

  // Equity Value Calculation (China & Indonesia only)
  const [totalDebt, setTotalDebt] = useState("");
  const [cashEquivalents, setCashEquivalents] = useState("");

  // ============================================
  // UI State
  // ============================================
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [showValuationReport, setShowValuationReport] = useState(false);
  const [serverCalculatedValues, setServerCalculatedValues] = useState<CalculateValuationResponse | null>(null);

  const calculateValuationMutation = useCalculateValuation();

  // ============================================
  // CALCULATED VALUES
  // ============================================

  const calculatedMetrics = useMemo(() => {
    const metrics: Record<string, FinancialYearData> = {};

    financialYears.forEach((year) => {
      // Input values from user
      const sales = parseFloat(financialData?.sales?.[year] as string) || 0;
      const otherIncome = parseFloat(financialData?.otherIncome?.[year] as string) || 0;
      const cogs = parseFloat(financialData?.cogs?.[year] as string) || 0;
      const operatingExpenses = parseFloat(financialData?.operatingExpenses?.[year] as string) || 0;
      const interestExpense = parseFloat(financialData?.interestExpense?.[year] as string) || 0;
      const interestIncome = parseFloat(financialData?.interestIncome?.[year] as string) || 0;

      // Calculated values
      const grossProfit = sales + otherIncome - cogs; // Gross Profit = Sales + Other Income - COGS
      const netProfitAndLoss = grossProfit - operatingExpenses; // Net Profit = Gross Profit - Operating Expenses

      // EBIT = Net Profit + Interest Expense - Interest Income
      const ebit = netProfitAndLoss + interestExpense - interestIncome;

      metrics[year] = {
        sales,
        otherIncome,
        grossProfit,
        cogs,
        operatingExpenses,
        netProfitAndLoss,
        interestExpense,
        interestIncome,
        ebit,
      };
    });

    return metrics;
  }, [financialData, financialYears]);

  // Populate calculated fields back into financialData for display
  const displayFinancialData = useMemo(() => {
    const data = { ...financialData };

    financialYears.forEach((year) => {
      const metrics = calculatedMetrics[year];
      if (metrics) {
        // Set calculated fields
        if (!data.grossProfit) data.grossProfit = {};
        if (!data.netProfitAndLoss) data.netProfitAndLoss = {};

        data.grossProfit[year] = metrics.grossProfit.toLocaleString();
        data.netProfitAndLoss[year] = metrics.netProfitAndLoss.toLocaleString();
      }
    });

    return data;
  }, [financialData, calculatedMetrics, financialYears]);

  const ebitValues = useMemo(() => {
    const values: Record<string, string> = {};
    financialYears.forEach((year) => {
      values[year] = calculatedMetrics[year]?.ebit.toLocaleString() || "0";
    });
    return values;
  }, [calculatedMetrics, financialYears]);

  const totalAddbacksByYear = useMemo(() => {
    const totals: Record<string, number> = {};
    financialYears.forEach((year) => {
      totals[year] = addbacks.reduce((sum, addback) => sum + (parseFloat(addback.values[year]) || 0), 0);
    });
    return totals;
  }, [addbacks, financialYears]);

  // Calculate Adjusted EBIT for each year (EBIT + Addbacks for that year)
  const adjustedEbitByYear = useMemo(() => {
    const adjusted: Record<string, number> = {};
    financialYears.forEach((year) => {
      const ebit = calculatedMetrics[year]?.ebit || 0;
      const addbacksForYear = totalAddbacksByYear[year] || 0;
      adjusted[year] = ebit + addbacksForYear;
    });
    return adjusted;
  }, [calculatedMetrics, financialYears, totalAddbacksByYear]);

  // Calculate average Adjusted EBIT across all years using the explicit formula:
  // Average Adjusted EBIT = (Σ (EBIT_year + Addbacks_year)) / number of years
  const averageAdjustedEbit = useMemo(() => {
    const ebitValues = financialYears.map((year) => calculatedMetrics[year]?.ebit || 0);
    const addbackValues = financialYears.map((year) => totalAddbacksByYear[year] || 0);
    return calculateAverageAdjustedEBIT(ebitValues, addbackValues);
  }, [calculatedMetrics, financialYears, totalAddbacksByYear]);

  const baseIndustryMultiple = useMemo(() => getMultiple(country, industry) || 4.0, [country, industry, getMultiple]);

  const currencySymbol = useMemo(() => getCurrencyForCalculatorCountry(country).symbol, [country]);
  const currencyCode = useMemo(() => getCurrencyForCalculatorCountry(country).code, [country]);

  // Single source of truth for the multiple used in server calculations and PDF generation
  const effectiveProfitMultiple = useMemo(() => {
    if (useQuestionnaireMultiple && calculatedMultiple) {
      return calculatedMultiple;
    }

    const parsedCustom = parseFloat(customMultiple);
    if (!Number.isNaN(parsedCustom) && parsedCustom >= 0) {
      return parsedCustom;
    }

    return baseIndustryMultiple;
  }, [useQuestionnaireMultiple, calculatedMultiple, customMultiple, baseIndustryMultiple]);

  // Calculate final valuation based on method
  const finalValuation = useMemo(() => {
    if (selectedMethod === "asset") {
      const isChina = country.toLowerCase() === "china";
      // Calculate FMV total (this is the primary valuation)
      const totalAssetsFMV = Object.entries(assets).reduce((sum, [key, val]) => {
        // Only include FMV fields
        if (!key.endsWith("_fmv")) return sum;
        if (key === "landUseRights_fmv" && !isChina) return sum;
        return sum + (parseFloat(String(val)) || 0);
      }, 0);
      const totalLiabilitiesFMV = Object.entries(liabilities).reduce((sum, [key, val]) => {
        // Only include FMV fields
        if (!key.endsWith("_fmv")) return sum;
        return sum + (parseFloat(String(val)) || 0);
      }, 0);
      return totalAssetsFMV - totalLiabilitiesFMV;
    } else if (selectedMethod === "profit") {
      // Valuation = Average Adjusted EBIT × Effective Multiple
      return averageAdjustedEbit * effectiveProfitMultiple;
    }
    return 0;
  }, [selectedMethod, assets, liabilities, country, averageAdjustedEbit, effectiveProfitMultiple]);

  // Calculate Book Value and Fair Market Value separately for Asset Method
  const assetMethodValues = useMemo(() => {
    if (selectedMethod !== "asset") return { bookValue: 0, fairMarketValue: 0 };

    const isChina = country.toLowerCase() === "china";

    // Calculate Book Value
    const totalAssetsBV = Object.entries(assets).reduce((sum, [key, val]) => {
      if (!key.endsWith("_bv")) return sum;
      if (key === "landUseRights_bv" && !isChina) return sum;
      return sum + (parseFloat(String(val)) || 0);
    }, 0);
    const totalLiabilitiesBV = Object.entries(liabilities).reduce((sum, [key, val]) => {
      if (!key.endsWith("_bv")) return sum;
      return sum + (parseFloat(String(val)) || 0);
    }, 0);
    const bookValue = totalAssetsBV - totalLiabilitiesBV;

    // Calculate Fair Market Value
    const totalAssetsFMV = Object.entries(assets).reduce((sum, [key, val]) => {
      if (!key.endsWith("_fmv")) return sum;
      if (key === "landUseRights_fmv" && !isChina) return sum;
      return sum + (parseFloat(String(val)) || 0);
    }, 0);
    const totalLiabilitiesFMV = Object.entries(liabilities).reduce((sum, [key, val]) => {
      if (!key.endsWith("_fmv")) return sum;
      return sum + (parseFloat(String(val)) || 0);
    }, 0);
    const fairMarketValue = totalAssetsFMV - totalLiabilitiesFMV;

    return { bookValue, fairMarketValue };
  }, [selectedMethod, assets, liabilities, country]);

  // Equity Value = Enterprise Value (finalValuation) - Total Debt + Cash & Equivalents
  // Only relevant for China & Indonesia
  const equityValue = useMemo(() => {
    const debt = parseFloat(totalDebt) || 0;
    const cash = parseFloat(cashEquivalents) || 0;
    return finalValuation - debt + cash;
  }, [finalValuation, totalDebt, cashEquivalents]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const toggleSection = (section: number) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleShowReport = async () => {
    // Check authentication and subscription
    if (!isAuthenticated) {
      toast.error("Please log in to view the valuation report");
      router.push("/login?returnUrl=/calculator");
      return;
    }

    if (!hasCalculatorAccess) {
      toast.error("An active subscription or coupon code is required to view valuation reports");
      router.push("/#pricing");
      return;
    }

    // Validate addbacks
    if (!validateAddbacks) {
      toast.error("Please provide values for all addback reasons you've selected");
      return;
    }

    // Prepare data for server-side calculation
    try {
      let calculationData;

      if (selectedMethod === "profit") {
        // Convert financial data to proper format
        const formattedFinancialData: Record<string, { sales: number; otherIncome: number; cogs: number; operatingExpenses: number; interestExpense: number; interestIncome: number }> = {};
        financialYears.forEach((year) => {
          formattedFinancialData[year] = {
            sales: parseFloat((financialData?.sales?.[year] as string) || "0"),
            otherIncome: parseFloat((financialData?.otherIncome?.[year] as string) || "0"),
            cogs: parseFloat((financialData?.cogs?.[year] as string) || "0"),
            operatingExpenses: parseFloat((financialData?.operatingExpenses?.[year] as string) || "0"),
            interestExpense: parseFloat((financialData?.interestExpense?.[year] as string) || "0"),
            interestIncome: parseFloat((financialData?.interestIncome?.[year] as string) || "0"),
          };
        });

        // Format addbacks
        const formattedAddbacks = addbacks.map((addback) => ({
          reason: addback.reason,
          values: Object.fromEntries(Object.entries(addback.values).map(([year, value]) => [year, parseFloat(value as string) || 0])),
        }));

        calculationData = {
          valuationMethod: "profit" as const,
          financialData: formattedFinancialData,
          addbacks: formattedAddbacks,
          multiple: effectiveProfitMultiple,
          years: financialYears,
        };
      } else {
        // Asset method
        const isChina = country.toLowerCase() === "china";
        calculationData = {
          valuationMethod: "asset" as const,
          assets: {
            plantEquipment: parseFloat(assets.plantEquipment) || 0,
            inventory: parseFloat(assets.inventory) || 0,
            vehicles: parseFloat(assets.vehicles) || 0,
            goodwill: parseFloat(assets.goodwill) || 0,
            otherIntangible: parseFloat(assets.otherIntangible) || 0,
            ...(isChina && { landUseRights: parseFloat(assets.landUseRights as string) || 0 }),
          },
          liabilities: {
            loans: parseFloat(liabilities.loans) || 0,
            annualLeave: parseFloat(liabilities.annualLeave) || 0,
            longServiceLeave: parseFloat(liabilities.longServiceLeave) || 0,
            otherLiabilities: parseFloat(liabilities.otherLiabilities) || 0,
          },
        };
      }

      // Call server to calculate
      const result = await calculateValuationMutation.mutateAsync(calculationData);

      // Store server-calculated values
      setServerCalculatedValues(result);

      // Show the report
      setShowValuationReport(true);
      toast.success("Valuation report loaded successfully");
    } catch (error) {
      console.error("Failed to calculate valuation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to calculate valuation");
    }
  };

  const handleCalculateMultiple = async () => {
    try {
      const result = await calculatePreviewMutation.mutateAsync({
        country,
        industry,
        scores: questionnaireScores,
      });
      setCalculatedMultiple(result.calculatedMultiple);
      setMultipleCategory(result.category);
      setTotalScore(result.totalScore);
      setUseQuestionnaireMultiple(true);
      toast.success(`Multiple calculated: ${result.calculatedMultiple.toFixed(2)}x (${result.category})`);
    } catch (error) {
      toast.error("Failed to calculate multiple");
      console.error(error);
    }
  };

  // Auto-recalculate when questionnaire scores change (if already calculated once)
  useEffect(() => {
    // Only auto-recalculate if user has already calculated once
    if (!useQuestionnaireMultiple) return;

    // Check if questionnaire is complete
    const isComplete = Object.values(questionnaireScores).every((score) => score > 0);
    if (!isComplete) return;

    // Silently recalculate in the background
    const recalculate = async () => {
      try {
        const result = await calculatePreviewMutation.mutateAsync({
          country,
          industry,
          scores: questionnaireScores,
        });
        setCalculatedMultiple(result.calculatedMultiple);
        setMultipleCategory(result.category);
        setTotalScore(result.totalScore);
      } catch (error) {
        console.error("Auto-recalculation failed:", error);
      }
    };

    recalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionnaireScores, country, industry]);

  const handleFinancialDataChange = (metric: string, year: string, value: string) => {
    setFinancialData((prev) => ({
      ...prev,
      [metric]: { ...prev[metric], [year]: value },
    }));
  };

  const handleAddbackChange = (id: string, field: "reason" | "customReason" | "values", value: string | Record<string, string>) => {
    setAddbacks((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleAddAddback = () => {
    setAddbacks((prev) => [...prev, { id: String(prev.length + 1), reason: "", customReason: "", values: {} }]);
  };

  const handleDownloadPDF = async () => {
    // Check if all steps are complete first
    if (!isStep4Complete) {
      toast.error("Please complete all steps before downloading");
      return;
    }

    // Additional validation for addbacks
    if (!validateAddbacks) {
      toast.error("Please provide values for all addback reasons you've selected");
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error("Please log in to download the valuation document");
      router.push("/login?returnUrl=/calculator");
      return;
    }

    // Check if user has active subscription or coupon access
    if (!hasCalculatorAccess) {
      toast.error("An active subscription or coupon code is required to download valuation reports");
      router.push("/#pricing");
      return;
    }

    setIsDownloading(true);

    try {
      // Convert logo to base64 if provided (Requirements: 6.1)
      let logoBase64: string | undefined;
      let logoMimeType: string | undefined;

      if (companyLogo) {
        const reader = new FileReader();
        const logoData = await new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // Extract base64 data (remove data:image/xxx;base64, prefix)
            const base64Match = result.match(/^data:([^;]+);base64,(.+)$/);
            if (base64Match) {
              resolve({
                base64: base64Match[2],
                mimeType: base64Match[1],
              });
            } else {
              reject(new Error("Invalid image format"));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(companyLogo);
        });
        logoBase64 = logoData.base64;
        logoMimeType = logoData.mimeType;
      } else {
        // Check localStorage for saved logo data
        const savedLogoData = localStorage.getItem("companyLogo");
        if (savedLogoData) {
          try {
            const { base64, mimeType } = JSON.parse(savedLogoData);
            // Extract base64 data (remove data:image/xxx;base64, prefix if present)
            const base64Match = base64.match(/^data:([^;]+);base64,(.+)$/);
            if (base64Match) {
              logoBase64 = base64Match[2];
              logoMimeType = base64Match[1];
            } else {
              // Already clean base64 data
              logoBase64 = base64;
              logoMimeType = mimeType;
            }
          } catch (error) {
            console.error("Error loading saved logo:", error);
          }
        }
      }

      // Determine multiple source for transparency in PDF
      let multipleSource: ValuationReportData["multipleSource"] = "industry";
      const parsedCustomMultiple = parseFloat(customMultiple);
      const hasCustomMultiple = !Number.isNaN(parsedCustomMultiple) && parsedCustomMultiple >= 0;

      if (useQuestionnaireMultiple && calculatedMultiple) {
        multipleSource = "questionnaire";
      } else if (hasCustomMultiple && Math.abs(parsedCustomMultiple - baseIndustryMultiple) > 0.001) {
        multipleSource = "custom";
      }

      // Prepare data for PDF generation with extended fields (Requirements: 6.1)
      const reportData: ValuationReportData = {
        companyName: companyName || "Company Name",
        country,
        industry,
        customMultiple,
        financialYears,
        years: financialYears, // Server expects 'years' field
        financialData: calculatedMetrics,
        addbacks: addbacks.map((a) => ({
          id: a.id,
          reason: a.reason,
          values: Object.fromEntries(Object.entries(a.values).map(([year, value]) => [year, parseFloat(value) || 0])),
        })),
        totalAddbacks: financialYears.reduce((sum, year) => sum + (totalAddbacksByYear[year] || 0), 0),
        averageEbit: financialYears.reduce((sum, year) => sum + (calculatedMetrics[year]?.ebit || 0), 0) / financialYears.length,
        adjustedEbit: averageAdjustedEbit,
        adjustedEbitPerYear: Object.fromEntries(financialYears.map((year) => [year, adjustedEbitByYear[year] || 0])),
        totalAddbacksPerYear: Object.fromEntries(financialYears.map((year) => [year, totalAddbacksByYear[year] || 0])),
        valuationMethod: selectedMethod as "profit" | "asset",
        finalValuation,
        // Extended fields for multi-page PDF with cover page
        startedYear: startedYear || undefined,
        employees: employees || undefined,
        stage: stage as "startup" | "1-2-years" | "3-5-years" | "5-10-years" | "10-plus-years" | undefined,
        logoBase64,
        logoMimeType,
        generatedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        daysInPeriod: Object.fromEntries(selectedYears.map((col, i) => [financialYears[i], col.daysInPeriod])),
        currencyCode: getCurrencyForCalculatorCountry(country).code,
        // Questionnaire data for RAVDA Scorecard
        questionnaireScore: totalScore,
        questionnaireCategory: multipleCategory,
        calculatedMultiple: effectiveProfitMultiple,
        multipleSource,
        questionnaireScores: questionnaireScores, // Always include questionnaire scores for PDF display
        // Equity Value for China & Indonesia
        ...((country.toLowerCase() === "china" || country.toLowerCase() === "indonesia") &&
          selectedMethod === "profit" && {
            totalDebt: parseFloat(totalDebt) || 0,
            cashEquivalents: parseFloat(cashEquivalents) || 0,
            equityValue,
          }),
      };

      // Add method-specific data
      if (selectedMethod === "asset") {
        const isChina = country.toLowerCase() === "china";
        reportData.assets = {
          plantEquipment: parseFloat(assets.plantEquipment) || 0,
          inventory: parseFloat(assets.inventory) || 0,
          vehicles: parseFloat(assets.vehicles) || 0,
          goodwill: parseFloat(assets.goodwill) || 0,
          otherIntangible: parseFloat(assets.otherIntangible) || 0,
          ...(isChina && { landUseRights: parseFloat(assets.landUseRights as string) || 0 }),
        };
        reportData.liabilities = {
          loans: parseFloat(liabilities.loans) || 0,
          annualLeave: parseFloat(liabilities.annualLeave) || 0,
          longServiceLeave: parseFloat(liabilities.longServiceLeave) || 0,
          otherLiabilities: parseFloat(liabilities.otherLiabilities) || 0,
        };
        reportData.totalAssets = Object.values(reportData.assets).reduce((a, b) => a + b, 0);
        reportData.totalLiabilities = Object.values(reportData.liabilities).reduce((a, b) => a + b, 0);
        reportData.assetValuation = finalValuation;
      } else if (selectedMethod === "profit") {
        reportData.profitValuation = finalValuation;
      }

      // Download PDF - server will also save to database and R2
      await downloadValuationPDF(reportData);

      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["valuations"] });

      // Clear saved data after successful download
      clearSavedData();

      toast.success("Valuation report downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================
  // STEP COMPLETION LOGIC
  // ============================================

  // Step 1 is complete only when all required fields have meaningful values including logo
  const isStep1Complete = useMemo(() => {
    const hasCompanyName = companyName.trim().length > 0;
    const hasStartedYear = startedYear.trim().length > 0;
    const hasEmployees = employees.trim().length > 0;
    const hasStage = stage.trim().length > 0;
    const hasCountry = country.trim().length > 0;
    const hasIndustry = industry.trim().length > 0;

    return hasCompanyName && hasStartedYear && hasEmployees && hasStage && hasCountry && hasIndustry;
  }, [companyName, startedYear, employees, stage, country, industry]);

  // Step 2 is only complete after Step 1 is complete and questionnaire multiple is calculated
  const isStep2Complete = useMemo(() => {
    return isStep1Complete && useQuestionnaireMultiple && calculatedMultiple !== undefined;
  }, [isStep1Complete, useQuestionnaireMultiple, calculatedMultiple]);

  // Step 3 is complete when Step 2 is complete and user has selected a valuation method
  const isStep3Complete = useMemo(() => {
    return isStep2Complete && !!selectedMethod;
  }, [isStep2Complete, selectedMethod]);

  // Validate addbacks: if a reason is provided, at least one value must be non-zero
  const validateAddbacks = useMemo(() => {
    return addbacks.every((addback) => {
      // If no reason is selected, it's valid (empty addback)
      if (!addback.reason) return true;

      // If reason is selected, check if at least one value is non-zero
      const hasNonZeroValue = Object.values(addback.values).some((val) => {
        const numVal = parseFloat(val as string);
        return !isNaN(numVal) && numVal !== 0;
      });

      return hasNonZeroValue;
    });
  }, [addbacks]);

  // Step 4 is complete when financial data is entered based on selected method
  const isStep4Complete = useMemo(() => {
    if (!isStep3Complete) return false;

    // Require active subscription or coupon access for step 4
    if (!isAuthenticated || !hasCalculatorAccess) return false;

    if (selectedMethod === "profit") {
      // For profit method, check if sales data exists for all years
      const hasSalesData = financialYears.every((year) => {
        const sales = parseFloat((financialData?.sales?.[year] as string) || "0");
        return sales > 0;
      });

      // Validate addbacks
      if (!validateAddbacks) {
        return false;
      }

      return hasSalesData;
    } else if (selectedMethod === "asset") {
      // For asset method, need at least one asset value
      const hasAssets = Object.values(assets).some((val) => parseFloat(val) > 0);
      return hasAssets;
    }

    return false;
  }, [isStep3Complete, isAuthenticated, hasCalculatorAccess, selectedMethod, financialData, financialYears, assets, validateAddbacks]);

  // Step 5 (Download) is complete when step 4 is done
  const isStep5Complete = isStep4Complete;

  // Can download only if all steps are complete
  const canAttemptDownload = isStep4Complete;

  // Helper function to get missing requirements
  const getMissingRequirements = useMemo(() => {
    const missing: string[] = [];

    if (!isStep1Complete) {
      if (!companyName.trim()) missing.push("Company name");
      if (!startedYear.trim()) missing.push("Started year");
      if (!employees.trim()) missing.push("Number of employees");
      if (!stage) missing.push("Company stage");
      if (!country) missing.push("Country");
      if (!industry) missing.push("Industry");
    }

    if (isStep1Complete && !isStep2Complete) {
      if (!useQuestionnaireMultiple || calculatedMultiple === undefined) {
        missing.push("Calculate valuation multiple");
      }
    }

    if (isStep2Complete && !isStep3Complete) {
      if (!selectedMethod) {
        missing.push("Select valuation method");
      }
    }

    if (isStep3Complete && !isStep4Complete) {
      if (!isAuthenticated) {
        missing.push("Log in to continue");
      } else if (!hasCalculatorAccess) {
        missing.push("Active subscription or coupon");
      } else if (selectedMethod === "profit") {
        const missingSalesYears = financialYears.filter((year) => {
          const sales = parseFloat((financialData?.sales?.[year] as string) || "0");
          return sales <= 0;
        });
        if (missingSalesYears.length > 0) {
          missing.push(`Sales data for ${missingSalesYears.join(", ")}`);
        }
        if (!validateAddbacks) {
          missing.push("Complete or remove incomplete addbacks");
        }
      } else if (selectedMethod === "asset") {
        const hasAssets = Object.values(assets).some((val) => parseFloat(val) > 0);
        if (!hasAssets) {
          missing.push("At least one asset value");
        }
      }
    }

    return missing;
  }, [isStep1Complete, isStep2Complete, isStep3Complete, isStep4Complete, companyName, startedYear, employees, stage, country, industry, useQuestionnaireMultiple, calculatedMultiple, selectedMethod, isAuthenticated, hasCalculatorAccess, financialYears, financialData, assets, validateAddbacks]);

  const completedSteps = useMemo(() => {
    const steps: number[] = [];
    if (isStep1Complete) steps.push(1);
    if (isStep2Complete) steps.push(2);
    if (isStep3Complete) steps.push(3);
    if (isStep4Complete) steps.push(4);
    if (isStep5Complete) steps.push(5);
    return steps;
  }, [isStep1Complete, isStep2Complete, isStep3Complete, isStep4Complete, isStep5Complete]);

  const currentStep = useMemo(() => {
    if (!isStep1Complete) return 1;
    if (!isStep2Complete) return 2;
    if (!isStep3Complete) return 3;
    if (!isStep4Complete) return 4;
    return 5;
  }, [isStep1Complete, isStep2Complete, isStep3Complete, isStep4Complete]);

  const steps = [
    { number: 1, label: "Company Info" },
    { number: 2, label: "Multiple Assessment" },
    { number: 3, label: "Valuation Model" },
    { number: 4, label: "Financials" },
    { number: 5, label: "Download" },
  ];

  // ============================================
  // LOCALSTORAGE PERSISTENCE
  // ============================================

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Skip saving on initial mount to avoid overwriting with default values
    if (isInitialMount) {
      return;
    }

    const saveState = async () => {
      // Convert logo to base64 if present
      let logoData: string | undefined;
      let logoName: string | undefined;
      let logoType: string | undefined;

      if (companyLogo) {
        try {
          const reader = new FileReader();
          logoData = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(companyLogo);
          });
          logoName = companyLogo.name;
          logoType = companyLogo.type;
        } catch (error) {
          console.error("Failed to convert logo to base64:", error);
        }
      }

      const stateToSave: CalculatorState = {
        companyName,
        startedYear,
        employees,
        stage,
        country,
        industry,
        customMultiple,
        questionnaireScores,
        calculatedMultiple,
        multipleCategory,
        totalScore,
        useQuestionnaireMultiple,
        selectedYears,
        financialData,
        addbacks,
        selectedMethod,
        assets,
        liabilities,
        companyLogoData: logoData,
        companyLogoName: logoName,
        companyLogoType: logoType,
      };

      try {
        localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(stateToSave));
        localStorage.setItem(CALCULATOR_TIMESTAMP_KEY, Date.now().toString());
        console.log("Calculator data saved to localStorage");
      } catch (error) {
        console.error("Failed to save calculator state:", error);
      }
    };

    saveState();
  }, [isInitialMount, companyName, startedYear, employees, stage, country, industry, customMultiple, questionnaireScores, calculatedMultiple, multipleCategory, totalScore, useQuestionnaireMultiple, selectedYears, financialData, addbacks, selectedMethod, assets, liabilities, companyLogo]);

  // Restore logo and check terms on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Restore logo from base64 if present
        if (initialState?.companyLogoData && initialState?.companyLogoName && initialState?.companyLogoType) {
          try {
            const response = await fetch(initialState.companyLogoData);
            const blob = await response.blob();
            const file = new File([blob], initialState.companyLogoName, { type: initialState.companyLogoType });
            setCompanyLogo(file);
          } catch (error) {
            console.error("Failed to restore logo:", error);
          }
        }

        // Only check terms for authenticated users
        if (isAuthenticated && user) {
          // For authenticated users, check database
          if (user.termsAccepted) {
            setTermsAccepted(true);
            setHasCheckedTerms(true);
            if (initialState) {
              console.log("Calculator data restored from localStorage");
              toast.success("Your previous data has been restored");
            }
          } else {
            // User hasn't accepted terms in database - show modal
            setShowTermsDialog(true);
            setHasCheckedTerms(true);
          }
        } else {
          // For unauthenticated users, no terms check needed
          setTermsAccepted(true);
          setHasCheckedTerms(true);
          if (initialState) {
            console.log("Calculator data restored from localStorage");
          }
        }
      } catch (error) {
        console.error("Failed to initialize calculator:", error);
        setHasCheckedTerms(true);
      } finally {
        setHasRestoredData(true);
        // Allow saving after initialization is complete
        setTimeout(() => setIsInitialMount(false), 100);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Clear localStorage after successful download
  const clearSavedData = () => {
    try {
      localStorage.removeItem(CALCULATOR_STORAGE_KEY);
      localStorage.removeItem(CALCULATOR_TIMESTAMP_KEY);
    } catch (error) {
      console.error("Failed to clear calculator state:", error);
    }
  };

  // ============================================
  // AUTHENTICATION CHECK - Allow unauthenticated access
  // ============================================

  // No redirect - allow everyone to access calculator
  // Paywall will be shown when trying to view valuation results

  // ============================================
  // LOADING STATE
  // ============================================

  // Show loading state while restoring data (no auth check needed)
  if (!hasRestoredData || !hasCheckedTerms) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 via-white to-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading calculator...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle terms acceptance
  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to continue");
      return;
    }

    try {
      // Only authenticated users need to accept terms
      if (isAuthenticated) {
        const response = await ApiClient.acceptTerms();

        if (response.success) {
          setShowTermsDialog(false);
          toast.success("Terms and conditions accepted successfully!");
          await queryClient.refetchQueries({ queryKey: ["auth"] });

          // Restore saved data after accepting terms
          try {
            const savedState = localStorage.getItem(CALCULATOR_STORAGE_KEY);
            if (savedState) {
              const parsed: CalculatorState = JSON.parse(savedState);

              setCompanyName(parsed.companyName || "");
              setStartedYear(parsed.startedYear || "");
              setEmployees(parsed.employees || "");
              setStage(parsed.stage || "startup");
              setCountry(parsed.country || "australia");
              setIndustry(parsed.industry || "retail");
              setCustomMultiple(parsed.customMultiple || "3");
              setQuestionnaireScores(
                parsed.questionnaireScores || {
                  ownerDependence: 0,
                  recurringRevenue: 0,
                  customerConcentration: 0,
                  managementDepth: 0,
                  growthRate: 0,
                  competitiveAdvantage: 0,
                  revenueDiversification: 0,
                  systemsScalability: 0,
                  marginStability: 0,
                  externalRisk: 0,
                },
              );
              setCalculatedMultiple(parsed.calculatedMultiple);
              setMultipleCategory(parsed.multipleCategory);
              setTotalScore(parsed.totalScore);
              setUseQuestionnaireMultiple(parsed.useQuestionnaireMultiple || false);
              if (parsed.selectedYears && Array.isArray(parsed.selectedYears) && parsed.selectedYears.length > 0 && typeof (parsed.selectedYears[0] as unknown) !== "number") {
                setSelectedYears(
                  (parsed.selectedYears as FinancialColumn[]).map((col) => ({
                    ...col,
                    periodDate: col.periodDate ? new Date(col.periodDate) : undefined,
                  })),
                );
              }
              setFinancialData(parsed.financialData || {});
              setAddbacks(
                parsed.addbacks || [
                  { id: "1", reason: "", values: {} },
                  { id: "2", reason: "", values: {} },
                  { id: "3", reason: "", values: {} },
                ],
              );
              setSelectedMethod(parsed.selectedMethod || "profit");
              setAssets(parsed.assets || {});
              setLiabilities(parsed.liabilities || {});

              // Restore logo from base64
              if (parsed.companyLogoData && parsed.companyLogoName && parsed.companyLogoType) {
                try {
                  const response = await fetch(parsed.companyLogoData);
                  const blob = await response.blob();
                  const file = new File([blob], parsed.companyLogoName, { type: parsed.companyLogoType });
                  setCompanyLogo(file);
                } catch (logoError) {
                  console.error("Failed to restore logo:", logoError);
                }
              }

              console.log("Calculator data restored after accepting terms");
              toast.success("Your previous data has been restored");
            }
          } catch (restoreError) {
            console.error("Failed to restore data after accepting terms:", restoreError);
          }
        }
      }
    } catch (error) {
      console.error("Failed to accept terms:", error);
      toast.error("Failed to accept terms. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 via-white to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Advanced Business <span className="italic text-blue-500">Valuation</span> Engine
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">Input basic information about your company and get professional Business valuation documents.</p>

        <Button className="bg-black hover:bg-gray-800" onClick={handleDownloadPDF} disabled={isDownloading || !canAttemptDownload}>
          {!canAttemptDownload ? (
            "Complete all steps to download"
          ) : isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : !isAuthenticated ? (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Log in to Download
            </>
          ) : !hasActiveSubscription ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Subscribe to Download
            </>
          ) : (
            <>
              Download Valuation Document
              <Download className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {/* Show missing requirements */}
        {!canAttemptDownload && getMissingRequirements.length > 0 && (
          <div className="mt-4 max-w-md mx-auto bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-800 mb-2">Please complete the following:</p>
            <ul className="text-sm text-orange-700 space-y-1">
              {getMissingRequirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Educational Sections */}
      <div className="max-w-5xl mx-auto px-4 space-y-6 mb-8">
        <EarningCapacitySection />
        <AddbacksExamplesSection />
      </div>

      {/* Calculator Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">The Business Valuation Calculator</h2>
      </div>

      {/* Step Progress */}
      <div className="max-w-4xl mx-auto px-4">
        <StepProgress steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pb-16 space-y-4">
        {/* STEP 1: Company Questionnaire */}
        <AccordionSection title="Company Questionaire" stepNumber={1} isOpen={openSections[1]} onToggle={() => toggleSection(1)}>
          <CompanyQuestionnaire companyName={companyName} onCompanyNameChange={setCompanyName} startedYear={startedYear} onStartedYearChange={setStartedYear} employees={employees} onEmployeesChange={setEmployees} stage={stage} onStageChange={setStage} logo={companyLogo} onLogoChange={setCompanyLogo} />
          <div className="mt-6">
            <CountryIndustrySelector country={country} industry={industry} customMultiple={customMultiple} onCountryChange={setCountry} onIndustryChange={setIndustry} onCustomMultipleChange={setCustomMultiple} />
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-600">
                Based on your selection, the default valuation multiple is: <span className="font-bold text-blue-600">{customMultiple || baseIndustryMultiple}x</span>
              </p>
              {useQuestionnaireMultiple && calculatedMultiple && (
                <p className="text-sm text-green-600 mt-2 font-semibold">
                  ✓ Using your calculated multiple: <span className="font-bold">{calculatedMultiple.toFixed(2)}x</span> from Business Strength Assessment
                </p>
              )}
            </div>
          </div>
        </AccordionSection>

        {/* STEP 2: Business Strength Questionnaire */}
        <AccordionSection title="Business Strength Assessment (Calculate Your Multiple)" stepNumber={2} isOpen={openSections[2]} onToggle={() => toggleSection(2)}>
          <ValuationQuestionnaire scores={questionnaireScores} onScoresChange={setQuestionnaireScores} onCalculate={handleCalculateMultiple} isCalculating={calculatePreviewMutation.isPending} calculatedMultiple={calculatedMultiple} totalScore={totalScore} category={multipleCategory} />
        </AccordionSection>

        {/* STEP 3: Valuation Model Selection Only */}
        <AccordionSection title="Choose a valuation model" stepNumber={3} isOpen={openSections[3]} onToggle={() => toggleSection(3)}>
          <MethodToggle selectedMethod={selectedMethod} onMethodChange={setSelectedMethod} />

          {/* Sign Up Banner for Unauthenticated Users */}
          {!isAuthenticated && (
            <div className="mt-6 bg-linear-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white text-center">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">Log In Required</h3>
                <p className="text-blue-100 mb-4 max-w-md">Log In and continue your business valuation</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => router.push("/login?returnUrl=/calculator")}>
                    Sign In
                  </Button>
                  <Button className="border-white text-white" onClick={() => router.push("/signup?returnUrl=/calculator")}>
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </AccordionSection>

        {/* STEP 4: Financial Data + Selected Method Calculation */}
        <AccordionSection title="Financial Data (Please enter your financial data below)" stepNumber={4} isOpen={openSections[4]} onToggle={() => toggleSection(4)}>
          <div className="relative">
            {/* Overlay for users without active subscription or coupon access */}
            {(!isAuthenticated || !hasCalculatorAccess) && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  {isAuthenticated && hasCouponAccess && couponUsed ? (
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Coupon Already Used</h3>
                      <p className="text-gray-600 mb-6 max-w-md">Your one-time coupon access has been used. Subscribe to continue using the calculator.</p>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push("/#pricing")}>
                        View Pricing Plans
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{!isAuthenticated ? "Login Required" : "Access Required"}</h3>
                      <p className="text-gray-600 mb-6 max-w-md">{!isAuthenticated ? "Please log in and subscribe to enter your financial data and calculate your business valuation" : "An active subscription or coupon code is required to enter financial data and generate valuations"}</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {!isAuthenticated ? (
                          <>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push("/login?returnUrl=/calculator")}>
                              Log In
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/signup?returnUrl=/calculator")}>
                              Sign Up
                            </Button>
                          </>
                        ) : (
                          <>
                            <SubscribeButton />
                            {subscriptionStatus && subscriptionStatus !== "NONE" && (
                              <Button variant="outline" onClick={() => router.push("/settings")}>
                                Manage Subscription
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      {isAuthenticated && !hasCalculatorAccess && <CouponRedeemForm />}
                    </>
                  )}
                </div>
              </div>
            )}

            {selectedMethod === "profit" && (
              <>
                <FinancialInfoSelector columns={selectedYears} onColumnsChange={setSelectedYears} disabled={!isAuthenticated || !hasCalculatorAccess} />

                <div className="mt-6">
                  <FinancialDataTable
                    title="ACCOUNTING PROFIT AND LOSS"
                    metrics={financialMetrics}
                    years={financialYears}
                    values={displayFinancialData}
                    onChange={handleFinancialDataChange}
                    calculatedRow={{
                      label: "EBIT CALCULATED",
                      values: ebitValues,
                    }}
                    disabled={!isAuthenticated || !hasCalculatorAccess}
                    currencySymbol={currencySymbol}
                    currencyCode={currencyCode}
                  />
                </div>

                <div className="mt-6">
                  <AddbacksTable addbacks={addbacks} financialYears={financialYears} onAddbackChange={handleAddbackChange} onAddAddback={handleAddAddback} totalValuesByYear={Object.fromEntries(financialYears.map((year) => [year, (totalAddbacksByYear[year] || 0).toLocaleString()]))} adjustedEbitByYear={adjustedEbitByYear} disabled={!isAuthenticated || !hasCalculatorAccess} currencySymbol={currencySymbol} currencyCode={currencyCode} />
                </div>

                {/* Adjusted EBIT Calculation Breakdown */}
                <div className="mt-6 border border-blue-300 rounded-lg overflow-hidden">
                  <div className="bg-blue-500 px-4 py-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Adjusted EBIT Calculation</h3>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {financialYears.map((year) => {
                        const ebit = calculatedMetrics[year]?.ebit || 0;
                        const addbacks = totalAddbacksByYear[year] || 0;
                        const adjustedEbit = adjustedEbitByYear[year] || 0;

                        return (
                          <div key={year} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="text-sm font-semibold text-gray-700 mb-3 text-center">{year}</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">EBIT:</span>
                                <span className="font-medium text-gray-900">{formatCurrency(ebit, currencyCode)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">+ Addbacks:</span>
                                <span className="font-medium text-gray-900">{formatCurrency(addbacks, currencyCode)}</span>
                              </div>
                              <div className="border-t border-gray-300 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-red-700">= Adjusted EBIT:</span>
                                  <span className="font-bold text-red-700">{formatCurrency(adjustedEbit, currencyCode)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Equity Value Calculation — China & Indonesia only */}
                {(country.toLowerCase() === "china" || country.toLowerCase() === "indonesia") && (
                  <div className="mt-6 border border-blue-300 rounded-lg overflow-hidden">
                    <div className="bg-blue-500 px-4 py-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wide">Equity Value Calculation</h3>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                      <div className="grid grid-cols-2 gap-4 items-center">
                        <span className="text-sm text-gray-700">Total Debt</span>
                        <input type="number" value={totalDebt} onChange={(e) => setTotalDebt(e.target.value)} placeholder="0" disabled={!isAuthenticated || !hasCalculatorAccess} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 items-center">
                        <span className="text-sm text-gray-700">Cash &amp; Equivalents</span>
                        <input type="number" value={cashEquivalents} onChange={(e) => setCashEquivalents(e.target.value)} placeholder="0" disabled={!isAuthenticated || !hasCalculatorAccess} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 items-center bg-gray-900 rounded-md px-4 py-3 mt-2">
                        <span className="text-sm font-bold text-white">Equity Value</span>
                        <span className="text-sm text-gray-300 text-right">
                          Enterprise Value (EV) &minus; Total Debt + Cash &amp; Equivalents
                          <span className="block font-bold text-white mt-1">
                            {currencySymbol}
                            {equityValue.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* <div className="mt-6">
                  <ProfitMethod averageEbit={averageEbit} totalAddbacks={totalAddbacks} capitalizationRate={capitalizationRate} onCapitalizationRateChange={setCapitalizationRate} />
                </div> */}
              </>
            )}

            {selectedMethod === "asset" && (
              <div className="mt-6">
                <AssetMethod assets={assets} liabilities={liabilities} onAssetChange={(key, value) => setAssets((prev) => ({ ...prev, [key]: value }))} onLiabilityChange={(key, value) => setLiabilities((prev) => ({ ...prev, [key]: value }))} disabled={!isAuthenticated || !hasCalculatorAccess} country={country} currencySymbol={currencySymbol} />
              </div>
            )}
          </div>
        </AccordionSection>

        {/* STEP 5: Download */}
        <AccordionSection title="Download Valuation Document (PDF)" stepNumber={5} isOpen={openSections[5]} onToggle={() => toggleSection(5)}>
          <div className="py-6 space-y-6">
            {/* Comprehensive Valuation Summary Card */}
            <ValuationSummaryCard companyName={companyName} country={country} industry={industry} averageSales={serverCalculatedValues?.method === "profit" ? serverCalculatedValues.averageSales : financialYears.reduce((sum, year) => sum + parseFloat((financialData?.sales?.[year] as string) || "0"), 0) / financialYears.length} averageCOGS={serverCalculatedValues?.method === "profit" ? serverCalculatedValues.averageCOGS : financialYears.reduce((sum, year) => sum + parseFloat((financialData?.cogs?.[year] as string) || "0"), 0) / financialYears.length} averageEbit={serverCalculatedValues?.method === "profit" ? serverCalculatedValues.averageEbit : financialYears.reduce((sum, year) => sum + (calculatedMetrics[year]?.ebit || 0), 0) / financialYears.length} averageAddbacks={serverCalculatedValues?.method === "profit" ? serverCalculatedValues.averageAddbacks : financialYears.reduce((sum, year) => sum + (totalAddbacksByYear[year] || 0), 0) / financialYears.length} adjustedEbit={serverCalculatedValues?.method === "profit" ? serverCalculatedValues.adjustedEbit : averageAdjustedEbit} valuationMethod={selectedMethod} valuationMultiple={serverCalculatedValues?.method === "profit" ? serverCalculatedValues.valuationMultiple : effectiveProfitMultiple} finalValuation={serverCalculatedValues?.finalValuation ?? finalValuation} totalAssets={serverCalculatedValues?.method === "asset" ? serverCalculatedValues.totalAssets : selectedMethod === "asset" ? Object.values(assets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) : undefined} totalLiabilities={serverCalculatedValues?.method === "asset" ? serverCalculatedValues.totalLiabilities : selectedMethod === "asset" ? Object.values(liabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) : undefined} netAssetValueBV={selectedMethod === "asset" ? assetMethodValues.bookValue : undefined} netAssetValueFMV={selectedMethod === "asset" ? assetMethodValues.fairMarketValue : undefined} questionnaireScore={totalScore} questionnaireCategory={multipleCategory} isAuthenticated={isAuthenticated} hasActiveSubscription={hasCalculatorAccess} showReport={showValuationReport} onShowReport={handleShowReport} />

            {/* Equity Value Card — China & Indonesia only */}
            {(country.toLowerCase() === "china" || country.toLowerCase() === "indonesia") && selectedMethod === "profit" && (
              <div className="bg-linear-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5 shadow-lg">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-4">China &amp; Indonesia Only — Equity Value Calculation</p>
                {/* Equity Value Result */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">= Equity Value</span>
                      {/* <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">NEW FINAL OUTPUT</span> */}
                    </div>
                    <p className="text-3xl font-bold text-orange-500 mb-1">
                      {currencySymbol}
                      {equityValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      EV ({currencySymbol}
                      {(serverCalculatedValues?.finalValuation ?? finalValuation).toLocaleString()}) &minus; Total Debt ({currencySymbol}
                      {(parseFloat(totalDebt) || 0).toLocaleString()}) + Cash ({currencySymbol}
                      {(parseFloat(cashEquivalents) || 0).toLocaleString()})
                    </p>
                  </div>
                  <span className="text-4xl">📊</span>
                </div>
              </div>
            )}

            <div className="text-center">
              {!isStep4Complete ? (
                <p className="text-amber-600 mb-4">Please complete all previous steps before downloading.</p>
              ) : !isAuthenticated ? (
                <>
                  <p className="text-gray-600 mb-4">Please log in to download your valuation report.</p>
                  <Button className="bg-blue-500 hover:bg-blue-600" size="lg" onClick={() => router.push("/login?returnUrl=/calculator")}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Log in to Download
                  </Button>
                </>
              ) : !hasCalculatorAccess ? (
                <>
                  <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        {hasCouponAccess && couponUsed ? (
                          <>
                            <h4 className="font-semibold text-gray-900 mb-2">Coupon Already Used</h4>
                            <p className="text-gray-600 mb-4">Your one-time coupon access has been used. Subscribe to download additional reports.</p>
                            <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => router.push("/#pricing")}>
                              View Pricing Plans
                            </Button>
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold text-gray-900 mb-2">Premium Feature</h4>
                            <p className="text-gray-600 mb-4">Downloading valuation reports requires an active subscription. Subscribe now to access professional PDF reports, unlimited downloads, and investor-ready documentation.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => router.push("/#pricing")}>
                                View Pricing Plans
                              </Button>
                              {subscriptionStatus && subscriptionStatus !== "NONE" && (
                                <Button variant="outline" onClick={() => router.push("/settings")}>
                                  Manage Subscription
                                </Button>
                              )}
                            </div>
                            <CouponRedeemForm />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!hasCouponAccess && subscriptionStatus && subscriptionStatus !== "NONE" && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        {subscriptionStatus === "CANCELED" && "Your subscription has been canceled. Renew to regain access to downloads."}
                        {subscriptionStatus === "PAST_DUE" && "Your subscription payment is past due. Please update your payment method to continue downloading."}
                        {subscriptionStatus === "INCOMPLETE" && "Your subscription setup is incomplete. Please complete the payment process to download reports."}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">Your valuation report is ready. It includes all financial data, calculations, and the selected valuation method.</p>
                  <Button className="bg-black hover:bg-gray-800" size="lg" onClick={handleDownloadPDF} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Download Valuation Document
                  </Button>
                </>
              )}
            </div>

            {/* Previous Documents */}
            {isAuthenticated && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-700 mb-4">Your Previous Documents</h4>
                <ValuationDocumentList
                  onViewDocument={(doc) => {
                    // Open the Cloudflare URL directly in a new tab
                    if (doc.fileUrl) {
                      window.open(doc.fileUrl, "_blank");
                    } else {
                      toast.error("Document URL not available");
                    }
                  }}
                  onDownloadDocument={(doc) => {
                    // Download from the Cloudflare URL directly
                    if (doc.fileUrl) {
                      const link = document.createElement("a");
                      link.href = doc.fileUrl;
                      link.download = `${doc.companyName}-valuation.pdf`;
                      link.click();
                      toast.success("Document downloaded successfully");
                    } else {
                      toast.error("Document URL not available");
                    }
                  }}
                />
              </div>
            )}
          </div>
        </AccordionSection>
      </main>

      {/* Footer */}
      <Footer />

      {/* Terms and Conditions Dialog */}
      <Dialog
        open={showTermsDialog}
        onOpenChange={(open) => {
          // Prevent closing without accepting
          if (!open && !termsAccepted) {
            toast.error("You must accept the terms and conditions to use the calculator");
            return;
          }
          setShowTermsDialog(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Terms and Conditions</DialogTitle>
            <DialogDescription>Please read and accept our terms and conditions before using the Business Valuation Calculator.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="prose prose-sm max-w-none">
              <h3 className="font-semibold text-gray-900">Intaleks – Online Business Valuation Software Platform</h3>

              <h4 className="font-semibold text-gray-900 mt-4">1. Introduction</h4>
              <p className="text-gray-600">These Terms and Conditions govern access to and use of the valuation software platform operated by Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832) trading as Intaleks. By using the Platform, you agree to be bound by these Terms.</p>

              <h4 className="font-semibold text-gray-900 mt-4">2. Nature of the Service</h4>
              <p className="text-gray-600">The Platform provides automated business valuation estimates generated using algorithms, data sources, and user inputs. Estimates are computer-generated, model-based, and dependent on input quality. The Platform does not provide certified valuations or legal, financial, taxation, accounting, or investment advice.</p>

              <h4 className="font-semibold text-gray-900 mt-4">3. Disclaimer – Guidance Only</h4>
              <p className="text-gray-600">
                <strong>Valuation outputs are informational guides only and cannot be used for legal proceedings, tax matters, regulatory submissions, or as certified valuations.</strong> Users must obtain a qualified, independent valuation for legal or commercial purposes.
              </p>

              <h4 className="font-semibold text-gray-900 mt-4">4. User Responsibilities</h4>
              <p className="text-gray-600">Users agree to provide accurate information, have legal authority to provide data, use the Platform lawfully, and not misuse or reverse engineer the Platform.</p>

              <h4 className="font-semibold text-gray-900 mt-4">5. Accuracy and Limitations</h4>
              <p className="text-gray-600">Valuations are estimates only. No guarantees are made regarding accuracy, completeness, reliability, or suitability. Results may be affected by market conditions, poor inputs, or model assumptions.</p>

              <h4 className="font-semibold text-gray-900 mt-4">6. Limitation of Liability</h4>
              <p className="text-gray-600">The Platform is provided &quot;as is.&quot; The Company is not liable for financial losses, business interruptions, indirect damages, or decisions based on valuation outputs. Liability is limited to fees paid for relevant services.</p>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ Important Legal Notice:</strong> The Platform provides automated valuation estimates only and is not a certified valuation and cannot be used for legal, tax, court, or regulatory purposes.
                </p>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  For complete terms and conditions, please visit our{" "}
                  <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    Terms and Conditions page
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4 border-t">
              <Checkbox id="terms-accept" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} />
              <label htmlFor="terms-accept" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                I have read and agree to the{" "}
                <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                . I understand that valuations are estimates only and cannot be used for legal, tax, or regulatory purposes.
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleAcceptTerms} disabled={!termsAccepted} className="bg-blue-500 hover:bg-blue-600">
              Accept and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
