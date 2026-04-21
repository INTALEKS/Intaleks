"use client";

import { Lock } from "lucide-react";

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
  { key: "cashAndBank", label: "Cash & Bank" },
  { key: "accountsReceivable", label: "Accounts Receivable" },
  { key: "inventory", label: "Inventory" },
  { key: "plantEquipment", label: "Plant & Equipment" },
  { key: "vehicles", label: "Vehicles" },
  { key: "realEstate", label: "Real Estate" },
  { key: "intellectualProperty", label: "Intellectual Property" },
  { key: "otherAssets", label: "Other Assets" },
];

const liabilityItems = [
  { key: "accountsPayable", label: "Accounts Payable" },
  { key: "loansAndDebt", label: "Loans & Debt" },
  { key: "otherLiabilities", label: "Other Liabilities" },
];

export function AssetMethod({ assets, liabilities, onAssetChange, onLiabilityChange, disabled = false, country = "", currencySymbol = "$" }: AssetMethodProps) {
  const isChina = country.toLowerCase() === "china";

  // Calculate totals for Book Value (BV) and Fair Market Value (FMV)
  const totalAssetsBV = assetItems.reduce((sum, item) => sum + (parseFloat(String(assets[`${item.key}_bv`])) || 0), 0) + (isChina ? parseFloat(String(assets["landUseRights_bv"])) || 0 : 0);

  const totalAssetsFMV = assetItems.reduce((sum, item) => sum + (parseFloat(String(assets[`${item.key}_fmv`])) || 0), 0) + (isChina ? parseFloat(String(assets["landUseRights_fmv"])) || 0 : 0);

  const totalLiabilitiesBV = liabilityItems.reduce((sum, item) => sum + (parseFloat(String(liabilities[`${item.key}_bv`])) || 0), 0);

  const totalLiabilitiesFMV = liabilityItems.reduce((sum, item) => sum + (parseFloat(String(liabilities[`${item.key}_fmv`])) || 0), 0);

  const netValueBV = totalAssetsBV - totalLiabilitiesBV;
  const netValueFMV = totalAssetsFMV - totalLiabilitiesFMV;

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
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">ASSETS</h4>

          {/* Column Headers */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2">
            <div className="text-xs sm:text-sm font-semibold text-gray-700"></div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700 text-center">Book Value</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700 text-center">Fair Market Value</div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {assetItems.map((item) => (
              <div key={item.key} className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
                <label className="text-xs sm:text-sm text-gray-700">{item.label}</label>
                <input type="number" value={assets[`${item.key}_bv`] || ""} onChange={(e) => onAssetChange(`${item.key}_bv`, e.target.value)} placeholder="0" className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" disabled={disabled} />
                <input type="number" value={assets[`${item.key}_fmv`] || ""} onChange={(e) => onAssetChange(`${item.key}_fmv`, e.target.value)} placeholder="0" className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" disabled={disabled} />
              </div>
            ))}

            {/* China-only: Land-Use Rights */}
            {isChina && (
              <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-semibold text-yellow-800 mb-2">Land-Use Rights — China only</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
                  <label className="text-xs sm:text-sm text-yellow-800">Land-Use Rights</label>
                  <input type="number" value={assets["landUseRights_bv"] || ""} onChange={(e) => onAssetChange("landUseRights_bv", e.target.value)} placeholder="0" className="border border-yellow-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white" disabled={disabled} />
                  <input type="number" value={assets["landUseRights_fmv"] || ""} onChange={(e) => onAssetChange("landUseRights_fmv", e.target.value)} placeholder="0" className="border border-yellow-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white" disabled={disabled} />
                </div>
              </div>
            )}

            {/* Total Assets */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-3 border-t items-center">
              <span className="text-xs sm:text-sm font-semibold text-gray-800">Total Assets</span>
              <div className="text-xs sm:text-sm font-bold text-gray-900 text-center">{fmt(totalAssetsBV)}</div>
              <div className="text-xs sm:text-sm font-bold text-gray-900 text-center">{fmt(totalAssetsFMV)}</div>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">LIABILITIES</h4>

          {/* Column Headers */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2">
            <div className="text-xs sm:text-sm font-semibold text-gray-700"></div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700 text-center">Book Value</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700 text-center">Fair Market Value</div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {liabilityItems.map((item) => (
              <div key={item.key} className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
                <label className="text-xs sm:text-sm text-gray-700">{item.label}</label>
                <input type="number" value={liabilities[`${item.key}_bv`] || ""} onChange={(e) => onLiabilityChange(`${item.key}_bv`, e.target.value)} placeholder="0" className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" disabled={disabled} />
                <input type="number" value={liabilities[`${item.key}_fmv`] || ""} onChange={(e) => onLiabilityChange(`${item.key}_fmv`, e.target.value)} placeholder="0" className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" disabled={disabled} />
              </div>
            ))}

            {/* Total Liabilities */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-3 border-t items-center">
              <span className="text-xs sm:text-sm font-semibold text-gray-800">Total Liabilities</span>
              <div className="text-xs sm:text-sm font-bold text-gray-900 text-center">{fmt(totalLiabilitiesBV)}</div>
              <div className="text-xs sm:text-sm font-bold text-gray-900 text-center">{fmt(totalLiabilitiesFMV)}</div>
            </div>
          </div>
        </div>

        {/* Net Business Valuation */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-3 text-center">Net Business Valuation (Asset Method)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Book Value</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{fmt(netValueBV)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Fair Market Value</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{fmt(netValueFMV)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
