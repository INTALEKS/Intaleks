"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Info } from "lucide-react";

interface QuestionnaireScores {
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
}

interface ValuationQuestionnaireProps {
  scores: QuestionnaireScores;
  onScoresChange: (scores: QuestionnaireScores) => void;
  onCalculate: () => void;
  isCalculating?: boolean;
  calculatedMultiple?: number;
  baseMultiple?: number;
  scoreFactor?: number;
  totalScore?: number;
  category?: string;
  overrideMultiple?: number;
  onOverrideChange?: (value: number | undefined) => void;
}

interface Question {
  key: keyof QuestionnaireScores;
  title: string;
  description: string;
  options: Array<{ value: number; label: string; description: string }>;
}

const questions: Question[] = [
  {
    key: "ownerDependence",
    title: "1. Owner Dependence",
    description: "How reliant is the business on you personally?",
    options: [
      { value: 1, label: "High Risk", description: "You drive most revenue, decisions, and relationships" },
      { value: 2, label: "Moderate-High", description: "Heavy involvement in key areas" },
      { value: 3, label: "Neutral", description: "Some reliance, but key functions are shared" },
      { value: 4, label: "Low-Moderate", description: "Limited involvement needed" },
      { value: 5, label: "Strong", description: "Business operates independently of you" },
    ],
  },
  {
    key: "recurringRevenue",
    title: "2. Recurring or Contracted Revenue",
    description: "What proportion of revenue is predictable?",
    options: [
      { value: 1, label: "Weak", description: "Mostly one-off, transactional" },
      { value: 2, label: "Low", description: "Some repeat business" },
      { value: 3, label: "Neutral", description: "Mix of recurring and one-off" },
      { value: 4, label: "Good", description: "Majority recurring" },
      { value: 5, label: "Strong", description: "High recurring, contracted, subscription-based" },
    ],
  },
  {
    key: "customerConcentration",
    title: "3. Customer Concentration",
    description: "How diversified is your customer base?",
    options: [
      { value: 1, label: "High Risk", description: "One client >40% of revenue" },
      { value: 2, label: "Moderate Risk", description: "Top client 30-40%" },
      { value: 3, label: "Neutral", description: "Top client 15-30%" },
      { value: 4, label: "Good", description: "Top client 10-15%" },
      { value: 5, label: "Strong", description: "No client >10%" },
    ],
  },
  {
    key: "managementDepth",
    title: "4. Management Depth",
    description: "Can the business run without you?",
    options: [
      { value: 1, label: "Weak", description: "No management layer" },
      { value: 2, label: "Limited", description: "One key manager" },
      { value: 3, label: "Neutral", description: "Partial coverage" },
      { value: 4, label: "Good", description: "Solid team in place" },
      { value: 5, label: "Strong", description: "Strong, stable leadership team" },
    ],
  },
  {
    key: "growthRate",
    title: "5. Growth Rate",
    description: "What is your 3-5 year revenue/EBITDA growth?",
    options: [
      { value: 1, label: "Declining", description: "Flat or declining" },
      { value: 2, label: "Slow", description: "0-5% growth" },
      { value: 3, label: "Neutral", description: "Moderate, steady growth (5-15%)" },
      { value: 4, label: "Good", description: "Strong growth (15-30%)" },
      { value: 5, label: "Excellent", description: "Strong, consistent growth (>30%)" },
    ],
  },
  {
    key: "competitiveAdvantage",
    title: "6. Competitive Advantage",
    description: "How defensible is your position?",
    options: [
      { value: 1, label: "Weak", description: "Easily replicated, low barriers" },
      { value: 2, label: "Limited", description: "Some advantages" },
      { value: 3, label: "Neutral", description: "Some differentiation" },
      { value: 4, label: "Good", description: "Clear advantages" },
      { value: 5, label: "Strong", description: "Strong IP, contracts, brand, or barriers" },
    ],
  },
  {
    key: "revenueDiversification",
    title: "7. Revenue Diversification",
    description: "How many revenue streams do you have?",
    options: [
      { value: 1, label: "Single", description: "Single product/service" },
      { value: 2, label: "Limited", description: "1-2 streams" },
      { value: 3, label: "Neutral", description: "2-3 streams" },
      { value: 4, label: "Good", description: "3-5 streams" },
      { value: 5, label: "Strong", description: "Multiple stable streams" },
    ],
  },
  {
    key: "systemsScalability",
    title: "8. Systems & Scalability",
    description: "How well-systemised is the business?",
    options: [
      { value: 1, label: "Weak", description: "Manual, founder-driven" },
      { value: 2, label: "Limited", description: "Basic processes" },
      { value: 3, label: "Neutral", description: "Some documented processes" },
      { value: 4, label: "Good", description: "Well documented" },
      { value: 5, label: "Strong", description: "Strong systems, automation, tech-enabled" },
    ],
  },
  {
    key: "marginStability",
    title: "9. Margin Stability",
    description: "How consistent are your margins?",
    options: [
      { value: 1, label: "Volatile", description: "Highly volatile" },
      { value: 2, label: "Unstable", description: "Significant fluctuation" },
      { value: 3, label: "Neutral", description: "Some fluctuation" },
      { value: 4, label: "Stable", description: "Generally consistent" },
      { value: 5, label: "Very Stable", description: "Stable, predictable margins" },
    ],
  },
  {
    key: "externalRisk",
    title: "10. External / Industry Risk",
    description: "How exposed are you to regulatory or industry shocks?",
    options: [
      { value: 1, label: "High Risk", description: "High exposure" },
      { value: 2, label: "Elevated", description: "Significant exposure" },
      { value: 3, label: "Neutral", description: "Moderate exposure" },
      { value: 4, label: "Low", description: "Limited exposure" },
      { value: 5, label: "Very Low", description: "Low exposure" },
    ],
  },
];

export function ValuationQuestionnaire({ scores, onScoresChange, onCalculate, isCalculating = false, calculatedMultiple, baseMultiple, scoreFactor, totalScore, category, overrideMultiple, onOverrideChange }: ValuationQuestionnaireProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  const handleScoreChange = (key: keyof QuestionnaireScores, value: number) => {
    onScoresChange({ ...scores, [key]: value });
  };

  const isComplete = Object.values(scores).every((score) => score > 0);
  const currentTotal = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Business Strength Assessment</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Answer these 10 questions to calculate a customized valuation multiple based on your business&apos;s specific characteristics. Each question is scored from 1 (high risk) to 5 (strong).</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 text-xs sm:text-sm">Current Score:</span>
            <span className="text-base sm:text-lg font-bold text-blue-600">{currentTotal}/50</span>
          </div>
          {category && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 text-xs sm:text-sm">Category:</span>
              <span className={cn("px-2 py-1 rounded text-xs font-semibold", category === "Premium" && "bg-green-100 text-green-800", category === "Standard" && "bg-blue-100 text-blue-800", category === "High-risk" && "bg-red-100 text-red-800")}>{category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3 sm:space-y-4">
        {questions.map((question, index) => (
          <div key={question.key} className="border rounded-lg overflow-hidden">
            <button onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)} className="w-full px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold", scores[question.key] > 0 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600")}>{scores[question.key] || index + 1}</div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{question.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{question.description}</p>
                </div>
              </div>
              <svg className={cn("w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform shrink-0", expandedQuestion === index && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedQuestion === index && (
              <div className="p-3 sm:p-6 space-y-2 sm:space-y-3 bg-white">
                {question.options.map((option) => (
                  <button key={option.value} onClick={() => handleScoreChange(question.key, option.value)} className={cn("w-full p-3 sm:p-4 rounded-lg border-2 text-left transition-all", scores[question.key] === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5", scores[question.key] === option.value ? "border-blue-500 bg-blue-500" : "border-gray-300")}>
                        {scores[question.key] === option.value && (
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">{option.label}</span>
                          <span className="text-xs text-gray-500">(Score: {option.value})</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Calculate Button */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
        <Button onClick={onCalculate} disabled={!isComplete || isCalculating} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 w-full sm:w-auto">
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            "Calculate My Multiple"
          )}
        </Button>

        {!isComplete && <p className="text-xs sm:text-sm text-amber-600 text-center px-4">Please answer all 10 questions to calculate your multiple</p>}

        {calculatedMultiple !== undefined && totalScore !== undefined && (
          <div className="w-full max-w-2xl space-y-3 sm:space-y-4">
            <div
              className="rounded-lg p-4 sm:p-6"
              style={{
                backgroundColor:
                  totalScore >= 40
                    ? "#F0FDF4" // green-50
                    : totalScore >= 30
                      ? "#FEF9C3" // yellow-50
                      : totalScore >= 20
                        ? "#FFF7ED" // orange-50
                        : "#FEF2F2", // red-50
                borderWidth: "1px",
                borderColor:
                  totalScore >= 40
                    ? "#BBF7D0" // green-200
                    : totalScore >= 30
                      ? "#FDE047" // yellow-300
                      : totalScore >= 20
                        ? "#FDBA74" // orange-300
                        : "#FECACA", // red-200
              }}
            >
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Your Calculated Multiple</p>
                <p
                  className="text-3xl sm:text-4xl font-bold mb-2"
                  style={{
                    color:
                      totalScore >= 40
                        ? "#22C55E" // green-600
                        : totalScore >= 30
                          ? "#EAB308" // yellow-500
                          : totalScore >= 20
                            ? "#F97316" // orange-500
                            : "#EF4444", // red-500
                  }}
                >
                  {calculatedMultiple.toFixed(2)}x
                </p>
                <p className="text-xs text-gray-500">Based on your total score of {totalScore}/50</p>
              </div>

              {baseMultiple !== undefined && scoreFactor !== undefined && (
                <div
                  className="pt-3 sm:pt-4 mt-3 sm:mt-4"
                  style={{
                    borderTopWidth: "1px",
                    borderColor:
                      totalScore >= 40
                        ? "#BBF7D0" // green-200
                        : totalScore >= 30
                          ? "#FDE047" // yellow-300
                          : totalScore >= 20
                            ? "#FDBA74" // orange-300
                            : "#FECACA", // red-200
                  }}
                >
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">Calculation Breakdown:</p>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                    <span className="font-semibold">{baseMultiple.toFixed(2)}x</span>
                    <span>×</span>
                    <span className="font-semibold">{scoreFactor.toFixed(1)}</span>
                    <span>=</span>
                    <span
                      className="font-semibold"
                      style={{
                        color:
                          totalScore >= 40
                            ? "#22C55E" // green-600
                            : totalScore >= 30
                              ? "#EAB308" // yellow-500
                              : totalScore >= 20
                                ? "#F97316" // orange-500
                                : "#EF4444", // red-500
                      }}
                    >
                      {calculatedMultiple.toFixed(2)}x
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">(Base Multiple × Score Factor = Final Multiple)</p>
                </div>
              )}
            </div>

            {onOverrideChange && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Override Multiple (Optional)</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">If you have specific market data or prefer to use a different multiple, you can override the calculated value.</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1">
                    <label htmlFor="override-multiple" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Custom Multiple
                    </label>
                    <input id="override-multiple" type="number" step="0.1" min="0" max="100" value={overrideMultiple ?? ""} onChange={(e) => onOverrideChange(e.target.value ? parseFloat(e.target.value) : undefined)} placeholder={`Default: ${calculatedMultiple.toFixed(2)}`} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
                  </div>
                  {overrideMultiple !== undefined && (
                    <Button type="button" variant="outline" onClick={() => onOverrideChange(undefined)} className="sm:mt-7">
                      Reset
                    </Button>
                  )}
                </div>
                {overrideMultiple !== undefined && (
                  <p className="text-xs sm:text-sm text-blue-600 mt-2">
                    Using custom multiple: <strong>{overrideMultiple.toFixed(2)}x</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Score Guide */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          Multiple Calculation Formula
        </h4>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <p className="text-gray-700">
            Your final multiple is calculated as: <strong>Base Multiple × Score Factor</strong>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#22C55E" }}></div>
              <span className="text-xs sm:text-sm">
                <strong>40-50 points:</strong> 100% (1.0x)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#EAB308" }}></div>
              <span className="text-xs sm:text-sm">
                <strong>30-39 points:</strong> 80% (0.8x)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#F97316" }}></div>
              <span className="text-xs sm:text-sm">
                <strong>20-29 points:</strong> 50% (0.5x)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#EF4444" }}></div>
              <span className="text-xs sm:text-sm">
                <strong>&lt;20 points:</strong> 30% (0.3x)
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Example: If your industry base multiple is 5.0x and you score 35 points, your multiple = 5.0 × 0.8 = 4.0x</p>
        </div>
      </div>
    </div>
  );
}
