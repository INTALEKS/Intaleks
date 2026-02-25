"use client";

import { formatCurrency } from "@/lib/calculator-utils";
import { Lock } from "lucide-react";

interface ValuationSummaryCardProps {
  // Company Info
  companyName: string;
  country: string;
  industry: string;

  // Financial Data
  averageSales: number;
  averageCOGS: number;
  averageEbit: number;
  totalAddbacks: number;
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
}

export function ValuationSummaryCard({ companyName, country, industry, averageSales, averageCOGS, averageEbit, totalAddbacks, adjustedEbit, valuationMethod, valuationMultiple, finalValuation, totalAssets, totalLiabilities, questionnaireScore, questionnaireCategory, isAuthenticated = false }: ValuationSummaryCardProps) {
  return (
    <div className="bg-linear-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-3 sm:p-6 shadow-lg">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Valuation Summary Report</h3>
        <p className="text-sm sm:text-base text-gray-600">{companyName || "Your Business"}</p>
        <p className="text-xs sm:text-sm text-gray-500 capitalize">
          {industry} • {country}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Financial Metrics */}
        {valuationMethod === "profit" && (
          <>
            <MetricCard label="Average Sales" value={formatCurrency(averageSales)} icon="💰" color="blue" />
            <MetricCard label="Average COGS" value={formatCurrency(averageCOGS)} icon="📊" color="gray" />
            <MetricCard label="Average EBIT" value={formatCurrency(averageEbit)} icon="📈" color="green" />
            <MetricCard label="Total Addbacks" value={formatCurrency(totalAddbacks)} icon="➕" color="purple" />
            <MetricCard label="Adjusted EBIT" value={formatCurrency(adjustedEbit)} icon="✨" color="indigo" />
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
              <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${questionnaireCategory === "Premium" ? "bg-green-100 text-green-800" : questionnaireCategory === "Standard" ? "bg-blue-100 text-blue-800" : questionnaireCategory === "Discounted" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{questionnaireCategory}</span>
            </div>
          </div>
        </div>
      )}

      {/* Final Valuation - Highlighted */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg p-4 sm:p-6 text-white relative overflow-hidden">
        {!isAuthenticated && (
          <div className="absolute inset-0 backdrop-blur-md bg-blue-900/30 flex items-center justify-center z-10">
            <div className="text-center p-4">
              <Lock className="w-12 h-12 mx-auto mb-3 text-white" />
              <p className="text-white font-semibold text-lg mb-2">Login Required</p>
              <p className="text-blue-100 text-sm">Sign in to view your business valuation</p>
            </div>
          </div>
        )}
        <div className={!isAuthenticated ? "blur-sm" : ""}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm mb-1">Estimated Business Valuation</p>
              <p className="text-2xl sm:text-4xl font-bold break-all">{formatCurrency(finalValuation)}</p>
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

      {/* Guidance Note */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800 mb-2">
          <strong>⚠️ Important Disclaimer:</strong> This valuation estimate is a <strong>general informational guide only</strong>. It is based on automated modelling and user-provided inputs.
        </p>
        <p className="text-xs text-amber-800 mb-2">
          <strong>This valuation is NOT:</strong> A certified business valuation, a legal valuation for court/taxation/regulatory purposes, financial/accounting/investment/legal advice, or a substitute for professional valuation services.
        </p>
        <p className="text-xs text-amber-800">
          <strong>For legal proceedings, taxation matters, lending requirements, compliance purposes, or formal business transactions,</strong> you must obtain a qualified, independent, and certified professional valuation. Intaleks accepts no liability for any loss, decision, or action taken in reliance on this estimate.
        </p>
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
