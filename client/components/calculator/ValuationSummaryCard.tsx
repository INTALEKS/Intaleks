"use client";

import { formatCurrency } from "@/lib/calculator-utils";

interface ValuationSummaryCardProps {
  // Company Info
  companyName: string;
  country: string;
  industry: string;

  // Financial Data
  averageSales: number;
  averageCOGS: number;
  averageEbit: number;
  averageAddbacks: number;
  adjustedEbit: number;

  // Valuation
  valuationMethod: "asset" | "profit";
  valuationMultiple?: number;
  finalValuation: number;

  // Asset Method (optional)
  totalAssets?: number;
  totalLiabilities?: number;

  // Questionnaire (optional)
  questionnaireScore?: number;
  questionnaireCategory?: string;

  // Auth state
  isAuthenticated?: boolean;
  hasActiveSubscription?: boolean;

  // Report visibility
  showReport?: boolean;
  onShowReport?: () => void;
}

export function ValuationSummaryCard({ companyName, country, industry, averageSales, averageCOGS, averageEbit, averageAddbacks, adjustedEbit, valuationMethod, valuationMultiple, finalValuation, totalAssets, totalLiabilities, questionnaireScore, questionnaireCategory, isAuthenticated, hasActiveSubscription, showReport, onShowReport }: ValuationSummaryCardProps) {
  // Helper function to get color based on score
  const getCategoryColor = (score?: number) => {
    if (!score) return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };

    if (score >= 40) {
      return { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" };
    } else if (score >= 30) {
      return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" };
    } else if (score >= 20) {
      return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" };
    } else {
      return { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" };
    }
  };

  const categoryColors = getCategoryColor(questionnaireScore);

  return (
    <div className="bg-linear-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-3 sm:p-6 shadow-lg relative">
      {/* Watermark for users without active subscription */}
      {(!isAuthenticated || !hasActiveSubscription) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-5">
          <div className="transform -rotate-45 text-6xl sm:text-9xl font-bold text-gray-900 whitespace-nowrap">{!isAuthenticated ? "PREVIEW ONLY" : "SUBSCRIPTION REQUIRED"}</div>
        </div>
      )}

      {/* Content with higher z-index */}
      <div className="relative z-10">
        {/* Preview Badge for users without active subscription */}
        {/* {(!isAuthenticated || !hasActiveSubscription) && (
          <div className="mb-4 bg-amber-100 border-2 border-amber-300 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-amber-900">{!isAuthenticated ? "🔒 PREVIEW MODE - Estimates shown are for demonstration purposes only" : "🔒 SUBSCRIPTION REQUIRED - Subscribe to enter financial data and generate valuations"}</p>
            <p className="text-xs text-amber-800 mt-1">{!isAuthenticated ? "Log in and subscribe to generate official valuation documents" : "Activate your subscription to access the full calculator"}</p>
          </div>
        )} */}

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Valuation Summary Report</h3>
              <p className="text-sm sm:text-base text-gray-600">{companyName || "Your Business"}</p>
              <p className="text-xs sm:text-sm text-gray-500 capitalize">
                {industry} • {country}
              </p>
            </div>
            <button onClick={onShowReport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-md hover:shadow-lg">
              {showReport ? "Update Report" : "Show Report"}
            </button>
          </div>
        </div>

        {/* Show metrics only if report is visible */}
        {showReport && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Financial Metrics */}
              {valuationMethod === "profit" && (
                <>
                  <MetricCard label="Average Sales" value={formatCurrency(averageSales)} icon="💰" color="blue" />
                  <MetricCard label="Average COGS" value={formatCurrency(averageCOGS)} icon="📊" color="gray" />
                  <MetricCard label="Average EBIT" value={formatCurrency(averageEbit)} icon="📈" color="green" />
                  <MetricCard label="Average Addbacks" value={formatCurrency(averageAddbacks)} icon="➕" color="purple" />
                  <MetricCard label="Average Adjusted EBIT" value={formatCurrency(adjustedEbit)} icon="✨" color="indigo" />
                  <MetricCard label="Valuation Multiple" value={valuationMultiple ? `${valuationMultiple.toFixed(2)}x` : "N/A"} icon="🎯" color="orange" />
                </>
              )}

              {/* Asset Method Metrics */}
              {valuationMethod === "asset" && (
                <>
                  <MetricCard label="Total Assets" value={formatCurrency(totalAssets || 0)} icon="🏢" color="blue" />
                  <MetricCard label="Total Liabilities" value={formatCurrency(totalLiabilities || 0)} icon="📋" color="red" />
                  <MetricCard label="Net Asset Value" value={formatCurrency((totalAssets || 0) - (totalLiabilities || 0))} icon="💎" color="green" />
                </>
              )}
            </div>

            {/* Questionnaire Score (if available) */}
            {questionnaireScore !== undefined && questionnaireCategory && (
              <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Business Strength Assessment</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{questionnaireScore}/50</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Rating</p>
                    <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${categoryColors.bg} ${categoryColors.text}`}>{questionnaireCategory}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Final Valuation - Highlighted */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg p-4 sm:p-6 text-white relative overflow-hidden">
              {/* Watermark inside valuation box for unauthenticated users */}
              {!isAuthenticated && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <div className="transform -rotate-12 text-3xl sm:text-5xl font-bold text-white whitespace-nowrap">ESTIMATE ONLY</div>
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-1">{!isAuthenticated || !hasActiveSubscription ? "Preview Estimate" : "Estimated Business Valuation"}</p>
                    <p className="text-2xl sm:text-4xl font-bold break-all">{formatCurrency(finalValuation)}</p>
                    {(!isAuthenticated || !hasActiveSubscription) && <p className="text-blue-200 text-xs mt-2 italic">* Client-side calculation for preview only</p>}
                  </div>
                  <div className="text-4xl sm:text-6xl opacity-20">🏆</div>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-500">
                  <p className="text-blue-100 text-xs">
                    Method: <span className="font-semibold capitalize">{valuationMethod} Method</span>
                    {valuationMethod === "profit" && valuationMultiple && <> • Multiple: {valuationMultiple.toFixed(2)}x</>}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Guidance Note */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 mb-2">
            <strong>⚠️ Important Disclaimer:</strong> This valuation estimate is a <strong>general informational guide only</strong>. It is based on automated modelling and user-provided inputs.
          </p>
          <p className="text-xs text-amber-800 mb-2">
            <strong>This valuation is NOT:</strong> A certified business valuation, a legal valuation for court/taxation/regulatory purposes, financial/accounting/investment/legal advice, or a substitute for professional valuation services.
          </p>
          <p className="text-xs text-amber-800 mb-2">
            <strong>For legal proceedings, taxation matters, lending requirements, compliance purposes, or formal business transactions,</strong> you must obtain a qualified, independent, and certified professional valuation. Intaleks accepts no liability for any loss, decision, or action taken in reliance on this estimate.
          </p>
          {(!isAuthenticated || !hasActiveSubscription) && (
            <p className="text-xs text-amber-900 font-semibold mt-3 pt-3 border-t border-amber-300">
              ⚠️ <strong>PREVIEW MODE:</strong> Calculations shown are performed client-side for demonstration only. Official valuations require {!isAuthenticated ? "authentication" : "an active subscription"} and are recalculated server-side with full validation before PDF generation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  color: "blue" | "gray" | "green" | "purple" | "indigo" | "orange" | "red";
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-3 sm:p-4`}>
      <div className="flex items-start justify-between mb-1 sm:mb-2">
        <p className="text-xs font-medium opacity-75">{label}</p>
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
      <p className="text-lg sm:text-xl font-bold break-all">{value}</p>
    </div>
  );
}
