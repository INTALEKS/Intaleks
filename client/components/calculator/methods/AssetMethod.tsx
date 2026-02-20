"use client";

interface AssetMethodProps {
  assets: Record<string, string | number>;
  liabilities: Record<string, string | number>;
  onAssetChange: (key: string, value: string) => void;
  onLiabilityChange: (key: string, value: string) => void;
}

const assetItems = [
  { key: "plantEquipment", label: "Plant and Equipments(FMV)", placeholder: "150000" },
  { key: "inventory", label: "Inventory(FMV)", placeholder: "75000" },
  { key: "vehicles", label: "Vehicles(FMV)", placeholder: "50000" },
  { key: "goodwill", label: "Goodwill(FMV)", placeholder: "200000" },
  { key: "otherIntangible", label: "Other intangible Assets(FMV)", placeholder: "25000" },
];

const liabilityItems = [
  { key: "loans", label: "Loans", placeholder: "100000" },
  { key: "annualLeave", label: "Annual Leave Provision", placeholder: "15000" },
  { key: "longServiceLeave", label: "Long Service Leave Provision", placeholder: "10000" },
  { key: "otherLiabilities", label: "Other Liabilities", placeholder: "5000" },
];

export function AssetMethod({ assets, liabilities, onAssetChange, onLiabilityChange }: AssetMethodProps) {
  const totalAssets = Object.values(assets).reduce<number>((sum, val) => sum + (parseFloat(String(val)) || 0), 0);
  const totalLiabilities = Object.values(liabilities).reduce<number>((sum, val) => sum + (parseFloat(String(val)) || 0), 0);
  const netValue = totalAssets - totalLiabilities;

  const formatCurrency = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-blue-500 text-white px-4 py-2 rounded-t-md">
        <h3 className="text-sm font-semibold">ASSET BASED VALUATION METHOD</h3>
      </div>

      <div className="space-y-6 px-4">
        {/* Assets Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">ASSETS (FAIR MARKET VALUE)</h4>
          <div className="space-y-3">
            {assetItems.map((item) => (
              <div key={item.key} className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm text-gray-700">{item.label}</label>
                <input type="number" value={assets[item.key] || ""} onChange={(e) => onAssetChange(item.key, e.target.value)} placeholder={item.placeholder} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
            ))}

            {/* Total Assets */}
            <div className="grid grid-cols-2 gap-4 items-center pt-3 border-t">
              <span className="text-sm font-semibold text-gray-800">Total Assets</span>
              <div className="text-sm font-bold text-gray-900 text-right pr-3">{formatCurrency(totalAssets)}</div>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">LIABILITIES</h4>
          <div className="space-y-3">
            {liabilityItems.map((item) => (
              <div key={item.key} className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm text-gray-700">{item.label}</label>
                <input type="number" value={liabilities[item.key] || ""} onChange={(e) => onLiabilityChange(item.key, e.target.value)} placeholder={item.placeholder} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
            ))}

            {/* Total Liabilities */}
            <div className="grid grid-cols-2 gap-4 items-center pt-3 border-t">
              <span className="text-sm font-semibold text-gray-800">Total Liabilities</span>
              <div className="text-sm font-bold text-gray-900 text-right pr-3">{formatCurrency(totalLiabilities)}</div>
            </div>
          </div>
        </div>

        {/* Net Business Valuation */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Net Business Valuation (Asset Method)</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(netValue)}</p>
        </div>
      </div>
    </div>
  );
}
