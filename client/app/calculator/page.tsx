"use client";

import { useState, useMemo, useEffect } from "react";
import { Download, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/home";
import { AccordionSection, MethodToggle, ValuationMethod, CountryIndustrySelector, FinancialDataTable, AddbacksTable, StepProgress, CompanyQuestionnaire, ValuationDocumentList, YearSelector, EarningCapacitySection, AddbacksExamplesSection, ValuationSummaryCard } from "@/components/calculator";
import { AssetMethod, ProfitMethod } from "@/components/calculator/methods";
import { calculateAverageEBIT, formatCurrency, FinancialYearData } from "@/lib/calculator-utils";
import { downloadValuationPDF, ValuationReportData } from "@/lib/valuation-api";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ValuationQuestionnaire } from "@/components/calculator/ValuationQuestionnaire";
import { useCalculatePreview } from "@/app/hooks/useQuestionnaire";
import { useValuationMultiples } from "@/app/hooks/useValuationMultiples";
import type { QuestionnaireScores } from "@/lib/questionnaire-api";

// Financial metrics following standard P&L structure with sample placeholders
// Only input fields - calculated fields are handled separately
const financialMetrics = [
  { key: "sales", label: "Sales", placeholder: "500", isInput: true },
  { key: "cogs", label: "COGS", placeholder: "200", isInput: true },
  { key: "grossProfit", label: "Gross profit", placeholder: "", isInput: false }, // Calculated: Sales - COGS
  { key: "operatingExpenses", label: "Operating Expenses", placeholder: "150", isInput: true },
  { key: "netProfitAndLoss", label: "Net profit and Loss", placeholder: "", isInput: false }, // Calculated: Gross Profit - Operating Expenses
  { key: "interestExpense", label: "Interest Expense", placeholder: "10", isInput: true },
  { key: "interestIncome", label: "Interest Income", placeholder: "5", isInput: true },
];

const currentYear = new Date().getFullYear();

export default function CalculatorPage() {
  const router = useRouter();
  const { isAuthenticated, hasActiveSubscription, subscriptionStatus } = useAuthState();
  const queryClient = useQueryClient();
  const { getMultiple } = useValuationMultiples();

  // ============================================
  // STEP 1: Company Information State
  // ============================================
  const [companyName, setCompanyName] = useState("");
  const [startedYear, setStartedYear] = useState("");
  const [employees, setEmployees] = useState("");
  const [stage, setStage] = useState("startup");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [country, setCountry] = useState("australia");
  const [industry, setIndustry] = useState("retail");
  const [customMultiple, setCustomMultiple] = useState("3");

  // ============================================
  // Questionnaire State
  // ============================================
  const [questionnaireScores, setQuestionnaireScores] = useState<QuestionnaireScores>({
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
  });
  const [calculatedMultiple, setCalculatedMultiple] = useState<number | undefined>(undefined);
  const [multipleCategory, setMultipleCategory] = useState<string | undefined>(undefined);
  const [totalScore, setTotalScore] = useState<number | undefined>(undefined);
  const [useQuestionnaireMultiple, setUseQuestionnaireMultiple] = useState(false);

  const calculatePreviewMutation = useCalculatePreview();

  // ============================================
  // STEP 2: Financial Data State
  // ============================================
  // Year selection state - default to last 3 years excluding current year
  const [selectedYears, setSelectedYears] = useState<number[]>([currentYear - 3, currentYear - 2, currentYear - 1]);

  // Generate financial years array based on selected years
  const financialYears = useMemo(() => {
    return selectedYears.map((year) => `Year ${year}`);
  }, [selectedYears]);

  const [financialData, setFinancialData] = useState<Record<string, Record<string, string>>>({});
  const [addbacks, setAddbacks] = useState([
    { id: "1", reason: "", values: {} as Record<string, string> },
    { id: "2", reason: "", values: {} as Record<string, string> },
    { id: "3", reason: "", values: {} as Record<string, string> },
  ]);

  // ============================================
  // STEP 3: Valuation Model State
  // ============================================
  const [selectedMethod, setSelectedMethod] = useState<ValuationMethod>("profit");

  // Asset Method
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [liabilities, setLiabilities] = useState<Record<string, string>>({});

  // Profit Method
  const [capitalizationRate, setCapitalizationRate] = useState("25");

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

  // ============================================
  // CALCULATED VALUES
  // ============================================

  const calculatedMetrics = useMemo(() => {
    const metrics: Record<string, FinancialYearData> = {};

    financialYears.forEach((year) => {
      // Input values from user
      const sales = parseFloat(financialData?.sales?.[year] as string) || 0;
      const cogs = parseFloat(financialData?.cogs?.[year] as string) || 0;
      const operatingExpenses = parseFloat(financialData?.operatingExpenses?.[year] as string) || 0;
      const interestExpense = parseFloat(financialData?.interestExpense?.[year] as string) || 0;
      const interestIncome = parseFloat(financialData?.interestIncome?.[year] as string) || 0;

      // Calculated values
      const grossProfit = sales - cogs; // Gross Profit = Sales - COGS
      const netProfitAndLoss = grossProfit - operatingExpenses; // Net Profit = Gross Profit - Operating Expenses

      // EBIT = Net Profit + Interest Expense - Interest Income
      const ebit = netProfitAndLoss + interestExpense - interestIncome;

      metrics[year] = {
        sales,
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

  const averageEbit = useMemo(() => {
    const ebitArray = financialYears.map((year) => calculatedMetrics[year]?.ebit || 0);
    return calculateAverageEBIT(ebitArray);
  }, [calculatedMetrics, financialYears]);

  const totalAddbacks = useMemo(() => {
    // Sum all addback values across all years
    return addbacks.reduce((sum, addback) => {
      const addbackTotal = Object.values(addback.values).reduce((yearSum, val) => yearSum + (parseFloat(val) || 0), 0);
      return sum + addbackTotal;
    }, 0);
  }, [addbacks]);

  const totalAddbacksByYear = useMemo(() => {
    const totals: Record<string, number> = {};
    financialYears.forEach((year) => {
      totals[year] = addbacks.reduce((sum, addback) => sum + (parseFloat(addback.values[year]) || 0), 0);
    });
    return totals;
  }, [addbacks, financialYears]);

  const adjustedEbit = averageEbit + totalAddbacks;

  // This is now just for display purposes - not used in calculation
  const displayMultiple = useMemo(() => {
    // Use questionnaire multiple if calculated, otherwise use default from API
    if (useQuestionnaireMultiple && calculatedMultiple) {
      return calculatedMultiple;
    }
    // Get from API or fallback to 4.0
    return getMultiple(country, industry) || 4.0;
  }, [country, industry, useQuestionnaireMultiple, calculatedMultiple, getMultiple]);

  // Calculate final valuation based on method
  const finalValuation = useMemo(() => {
    if (selectedMethod === "asset") {
      const totalAssets = Object.values(assets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      const totalLiabilities = Object.values(liabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      return totalAssets - totalLiabilities;
    } else if (selectedMethod === "profit") {
      // Use questionnaire multiple if available, otherwise use cap rate
      if (useQuestionnaireMultiple && calculatedMultiple) {
        // Direct multiple approach: Valuation = Adjusted EBIT × Multiple
        return adjustedEbit * calculatedMultiple;
      } else {
        // Capitalization rate approach: Valuation = (Adjusted EBIT / Cap Rate) × 100
        const rate = parseFloat(capitalizationRate) || 25;
        return (adjustedEbit / rate) * 100;
      }
    }
    return 0;
  }, [selectedMethod, assets, liabilities, adjustedEbit, capitalizationRate, useQuestionnaireMultiple, calculatedMultiple]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const toggleSection = (section: number) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
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

  const handleAddbackChange = (id: string, field: "reason" | "values", value: string | Record<string, string>) => {
    setAddbacks((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleAddAddback = () => {
    setAddbacks((prev) => [...prev, { id: String(prev.length + 1), reason: "", values: {} }]);
  };

  const handleDownloadPDF = async () => {
    // Check if all steps are complete first
    if (!isStep4Complete) {
      toast.error("Please complete all steps before downloading");
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error("Please log in to download the valuation document");
      router.push("/login?returnUrl=/calculator");
      return;
    }

    // Check if user has active subscription
    if (!hasActiveSubscription) {
      toast.error("An active subscription is required to download valuation reports");
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
      }

      // Prepare data for PDF generation with extended fields (Requirements: 6.1)
      const reportData: ValuationReportData = {
        companyName: companyName || "Company Name",
        country,
        industry,
        customMultiple,
        financialYears,
        financialData: calculatedMetrics,
        addbacks: addbacks.map((a) => ({
          id: a.id,
          reason: a.reason,
          values: Object.fromEntries(Object.entries(a.values).map(([year, value]) => [year, parseFloat(value) || 0])),
        })),
        totalAddbacks,
        averageEbit,
        adjustedEbit,
        valuationMethod: selectedMethod,
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
        // Questionnaire data for RAVDA Scorecard
        questionnaireScore: totalScore,
        questionnaireCategory: multipleCategory,
        calculatedMultiple: calculatedMultiple,
        questionnaireScores: useQuestionnaireMultiple ? questionnaireScores : undefined,
      };

      // Add method-specific data
      if (selectedMethod === "asset") {
        reportData.assets = {
          plantEquipment: parseFloat(assets.plantEquipment) || 0,
          inventory: parseFloat(assets.inventory) || 0,
          vehicles: parseFloat(assets.vehicles) || 0,
          goodwill: parseFloat(assets.goodwill) || 0,
          otherIntangible: parseFloat(assets.otherIntangible) || 0,
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
        reportData.capitalizationRate = parseFloat(capitalizationRate) || 25;
        reportData.profitValuation = finalValuation;
      }

      // Download PDF - server will also save to database and R2
      await downloadValuationPDF(reportData);

      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["valuations"] });

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

  // Step 1 is complete when all company info fields are filled
  const isStep1Complete = useMemo(() => {
    return !!(companyName && startedYear && employees && stage && country && industry);
  }, [companyName, startedYear, employees, stage, country, industry]);

  // Step 2 (Multiple Assessment) is optional - always considered complete if step 1 is done
  const isStep2Complete = useMemo(() => {
    return isStep1Complete;
  }, [isStep1Complete]);

  // Step 3 is complete when valuation method is selected (independent of step 2)
  const isStep3Complete = useMemo(() => {
    return isStep1Complete && !!selectedMethod;
  }, [isStep1Complete, selectedMethod]);

  // Step 4 is complete when financial data is entered based on selected method
  const isStep4Complete = useMemo(() => {
    if (!isStep3Complete) return false;

    if (selectedMethod === "profit") {
      // For profit method, check if sales data exists for all years
      const hasSalesData = financialYears.every((year) => {
        const sales = parseFloat((financialData?.sales?.[year] as string) || "0");
        return sales > 0;
      });
      return hasSalesData;
    } else if (selectedMethod === "asset") {
      // For asset method, need at least one asset value
      const hasAssets = Object.values(assets).some((val) => parseFloat(val) > 0);
      return hasAssets;
    }

    return false;
  }, [isStep3Complete, selectedMethod, financialData, financialYears, assets]);

  // Step 5 (Download) is complete when step 4 is done
  const isStep5Complete = isStep4Complete;

  // Can download only if all steps are complete
  const canAttemptDownload = isStep4Complete;

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
                Based on your selection, the default valuation multiple is: <span className="font-bold text-blue-600">{customMultiple || displayMultiple}x</span>
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
        </AccordionSection>

        {/* STEP 4: Financial Data + Selected Method Calculation */}
        <AccordionSection title="Financial Data (Please enter your financial data below)" stepNumber={4} isOpen={openSections[4]} onToggle={() => toggleSection(4)}>
          {selectedMethod === "profit" && (
            <>
              <YearSelector selectedYears={selectedYears} onYearsChange={setSelectedYears} />

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
                />
              </div>

              <div className="mt-6">
                <AddbacksTable addbacks={addbacks} financialYears={financialYears} onAddbackChange={handleAddbackChange} onAddAddback={handleAddAddback} totalValuesByYear={Object.fromEntries(financialYears.map((year) => [year, formatCurrency(totalAddbacksByYear[year] || 0)]))} />
              </div>

              {/* <div className="mt-6">
                <ProfitMethod averageEbit={averageEbit} totalAddbacks={totalAddbacks} capitalizationRate={capitalizationRate} onCapitalizationRateChange={setCapitalizationRate} />
              </div> */}
            </>
          )}

          {selectedMethod === "asset" && (
            <div className="mt-6">
              <AssetMethod assets={assets} liabilities={liabilities} onAssetChange={(key, value) => setAssets((prev) => ({ ...prev, [key]: value }))} onLiabilityChange={(key, value) => setLiabilities((prev) => ({ ...prev, [key]: value }))} />
            </div>
          )}
        </AccordionSection>

        {/* STEP 5: Download */}
        <AccordionSection title="Download Valuation Document (PDF)" stepNumber={5} isOpen={openSections[5]} onToggle={() => toggleSection(5)}>
          <div className="py-6 space-y-6">
            {/* Comprehensive Valuation Summary Card */}
            <ValuationSummaryCard companyName={companyName} country={country} industry={industry} averageSales={financialYears.reduce((sum, year) => sum + parseFloat((financialData?.sales?.[year] as string) || "0"), 0) / financialYears.length} averageCOGS={financialYears.reduce((sum, year) => sum + parseFloat((financialData?.cogs?.[year] as string) || "0"), 0) / financialYears.length} averageEbit={averageEbit} totalAddbacks={totalAddbacks} adjustedEbit={adjustedEbit} valuationMethod={selectedMethod} valuationMultiple={useQuestionnaireMultiple && calculatedMultiple ? calculatedMultiple : undefined} capitalizationRate={selectedMethod === "profit" ? parseFloat(capitalizationRate) : undefined} finalValuation={finalValuation} totalAssets={selectedMethod === "asset" ? Object.values(assets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) : undefined} totalLiabilities={selectedMethod === "asset" ? Object.values(liabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) : undefined} questionnaireScore={totalScore} questionnaireCategory={multipleCategory} />

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
              ) : !hasActiveSubscription ? (
                <>
                  <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
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
                      </div>
                    </div>
                  </div>
                  {subscriptionStatus && subscriptionStatus !== "NONE" && (
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
    </div>
  );
}
