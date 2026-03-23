"use client";

import { Lock, Info } from "lucide-react";

interface AssetMethodProps {
  assets: Record<string, string | number>;
  liabilities: Record<string, string | number>;
  onAssetChange: (key: string, value: string) => void;
  onLiabilityChange: (key: string, value: string) => void;
  disabled?: boolean;
  country?: string;
  currencySymbol?: string;
}

const assetItems = [
  { key: "plantEquipment", label: "Plant and Equipments (FMV)", placeholder: "150000" },
  { key: "inventory", label: "Inventory (FMV)", placeholder: "75000" },
  { key: "vehicles", label: "Vehicles (FMV)", placeholder: "50000" },
  { key: "goodwill", label: "Goodwill (FMV)", placeholder: "200000" },
  { key: "otherIntangible", label: "Other Intangible Assets (FMV)", placeholder: "25000" },
];

const liabilityItems = [
  { key: "loans", label: "Loans", placeholder: "100000" },
  { key: "annualLeave", label: "Annual Leave Provision", placeholder: "15000" },
  { key: "longServiceLeave", label: "Long Service Leave Provision", placeholder: "10000" },
  { key: "otherLiabilities", label: "Other Liabilities", placeholder: "5000" },
];

export function AssetMethod({ assets, liabilities, onAssetChange, onLiabilityChange, disabled = false, country = "", currencySymbol = "$" }: AssetMethodProps) {
  const isChina = country.toLowerCase() === "china";

  // Include landUseRights in total only for China
  const totalAssets = Object.entries(assets).reduce<number>((sum, [key, val]) => {
    if (key === "landUseRights" && !isChina) return sum;
    return sum + (parseFloat(String(val)) || 0);
  }, 0);
  const totalLiabilities = Object.values(liabilities).reduce<number>((sum, val) => sum + (parseFloat(String(val)) || 0), 0);
  const netValue = totalAssets - totalLiabilities;

  const fmt = (value: number) => `${currencySymbol}${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-t-md flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-semibold">ASSET BASED VALUATION METHOD</h3>
        {disabled && (
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Login required</span>
          </div>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4">
        {/* Assets Section */}
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">ASSETS (FAIR MARKET VALUE)</h4>
          <div className="space-y-2 sm:space-y-3">
            {assetItems.map((item) => (
              <div key={item.key} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <label className="text-xs sm:text-sm text-gray-700">{item.label}</label>
                <input type="number" value={assets[item.key] || ""} onChange={(e) => onAssetChange(item.key, e.target.value)} placeholder={item.placeholder} className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" disabled={disabled} />
              </div>
            ))}

            {/* China-only: Land-Use Rights */}
            {isChina && (
              <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-3 sm:p-4 space-y-2">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-yellow-800">Land-Use Rights (FMV) — China only</p>
                  <p className="text-xs text-yellow-700 mt-0.5">Land is state-owned in China. Enter the independently appraised value of your land-use rights.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm text-yellow-800 font-medium">Land-Use Rights (FMV)</span>
                  <input type="number" value={assets["landUseRights"] || ""} onChange={(e) => onAssetChange("landUseRights", e.target.value)} placeholder="0" className="border border-yellow-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white" disabled={disabled} />
                </div>
              </div>
            )}

            {/* Total Assets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-3 border-t">
              <span className="text-xs sm:text-sm font-semibold text-gray-800">Total Assets</span>
              <div className="text-xs sm:text-sm font-bold text-gray-900 sm:text-right sm:pr-3">{fmt(totalAssets)}</div>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">LIABILITIES</h4>
          <div className="space-y-2 sm:space-y-3">
            {liabilityItems.map((item) => (
              <div key={item.key} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <label className="text-xs sm:text-sm text-gray-700">{item.label}</label>
                <input type="number" value={liabilities[item.key] || ""} onChange={(e) => onLiabilityChange(item.key, e.target.value)} placeholder={item.placeholder} className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" disabled={disabled} />
              </div>
            ))}

            {/* Total Liabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-3 border-t">
              <span className="text-xs sm:text-sm font-semibold text-gray-800">Total Liabilities</span>
              <div className="text-xs sm:text-sm font-bold text-gray-900 sm:text-right sm:pr-3">{fmt(totalLiabilities)}</div>
            </div>
          </div>
        </div>

        {/* Net Business Valuation */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">Net Business Valuation (Asset Method)</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{fmt(netValue)}</p>
        </div>

        {/* China info note */}
        {isChina && (
          <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>The Land-Use Rights field appears only when China is selected as the country. It feeds directly into Total Assets and the final Net Business Valuation. All other countries see the standard Asset Method form without this field.</span>
          </div>
        )}
      </div>
    </div>
  );
}
