"use client";

interface ProfitMethodProps {
  averageEbit: number;
  totalAddbacks: number;
  capitalizationRate: string;
  onCapitalizationRateChange: (value: string) => void;
}

export function ProfitMethod({ averageEbit, totalAddbacks, capitalizationRate, onCapitalizationRateChange }: ProfitMethodProps) {
  const rate = parseFloat(capitalizationRate) || 25;
  const equivalentMultiple = rate > 0 ? (100 / rate).toFixed(2) : "0.00";
  const adjustedEbit = averageEbit + totalAddbacks;
  const netValuation = rate > 0 ? (adjustedEbit / rate) * 100 : 0;

  const formatCurrency = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-blue-500 text-white px-4 py-2 rounded-t-md">
        <h3 className="text-sm font-semibold">PROFIT BASED VALUATION (Capitalization of Earnings)</h3>
      </div>

      <div className="space-y-6 px-4">
        {/* Core Valuation Data */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">CORE VALUATION DATA(Last 3 Years)</h4>
          <p className="text-xs text-gray-500 mb-3">*Calculated from Financial Data</p>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average EBIT</span>
              <span className="text-sm font-medium">{formatCurrency(averageEbit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Addbacks</span>
              <span className="text-sm font-medium">{formatCurrency(totalAddbacks)}</span>
            </div>
          </div>
        </div>

        {/* Capitalization Rate Input */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Multiple Applied (as a %)</label>
          <div className="flex items-center gap-2">
            <input type="number" value={capitalizationRate} onChange={(e) => onCapitalizationRateChange(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="25" />
            <span className="text-gray-600">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">*Equivalent Multiple: {equivalentMultiple}x</p>
        </div>

        {/* Adjusted Earnings Calculation */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Adjusted Earnings Calculation</h4>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average EBIT</span>
              <span className="text-sm font-medium">{formatCurrency(averageEbit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Addbacks</span>
              <span className="text-sm font-medium">{formatCurrency(totalAddbacks)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">Adjusted EBIT</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(adjustedEbit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Business Valuation */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Net Business Valuation (Profit Method)</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(netValuation)}</p>
        </div>
      </div>
    </div>
  );
}
