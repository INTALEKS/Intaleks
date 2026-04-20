"use client";

import { Plus, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader } from "./SectionHeader";

interface Addback {
  id: string;
  reason: string;
  customReason?: string; // For "other" option
  values: Record<string, string>; // year -> value mapping
}

interface AddbacksTableProps {
  addbacks: Addback[];
  financialYears: string[];
  onAddbackChange: (id: string, field: "reason" | "customReason" | "values", value: string | Record<string, string>) => void;
  onAddAddback: () => void;
  totalValuesByYear: Record<string, string>;
  adjustedEbitByYear: Record<string, number>; // EBIT + Addbacks for each year
  disabled?: boolean;
  currencySymbol?: string;
  currencyCode?: string;
}

// Predefined addback reasons organized by category
const ADDBACK_REASONS = [
  // Owner-Related Adjustments
  { value: "owner-salary-adjustment", label: "Owner salary above/below market" },
  { value: "owner-superannuation", label: "Owner superannuation adjustment" },
  { value: "owner-bonuses", label: "Owner bonuses or drawings" },
  { value: "owner-insurance", label: "Owner personal insurance" },
  { value: "owner-subscriptions", label: "Owner personal subscriptions/memberships" },

  // Family & Related Party
  { value: "family-non-working", label: "Family members on payroll (non-working)" },
  { value: "family-wages-adjustment", label: "Family wages above/below market" },
  { value: "related-party-rent", label: "Above-market related-party rent" },
  { value: "related-party-management", label: "Related-party management fees" },
  { value: "related-party-charges", label: "Intercompany charges (non-market)" },
  { value: "related-party-loan", label: "Related-party loan interest" },

  // Personal Expenses
  { value: "personal-expenses", label: "Personal expenses through business" },
  { value: "personal-use-assets", label: "Personal use of company assets" },
  { value: "luxury-vehicles", label: "Luxury vehicle expenses" },
  { value: "excessive-travel", label: "Excessive travel or entertainment" },
  { value: "non-essential-events", label: "Non-essential conferences or events" },

  // One-Off Expenses
  { value: "one-off-legal", label: "One-off legal fees" },
  { value: "one-off-consulting", label: "One-off consulting fees" },
  { value: "abnormal-repairs", label: "Abnormal repairs and maintenance" },
  { value: "one-time-marketing", label: "One-time marketing campaigns" },
  { value: "relocation-costs", label: "Relocation costs" },
  { value: "restructuring-costs", label: "Restructuring costs" },
  { value: "covid-related", label: "COVID-related items" },
  { value: "one-off-bad-debts", label: "One-off bad debts" },
  { value: "redundancy-payments", label: "Redundancy payments" },

  // Financial Adjustments
  { value: "interest-expense", label: "Interest expense (financing)" },
  { value: "interest-income", label: "Interest income (non-operational)" },
  { value: "asset-sale-gain-loss", label: "Gain/loss on sale of assets" },
  { value: "unrealised-fx", label: "Unrealised FX gains/losses" },
  { value: "investment-income", label: "Investment income (non-core)" },

  // Discretionary Expenses
  { value: "donations-sponsorships", label: "Donations or sponsorships" },
  { value: "fines-penalties", label: "Fines or penalties" },
  { value: "charitable-contributions", label: "Charitable contributions" },

  // Accounting Adjustments
  { value: "depreciation", label: "Depreciation" },
  { value: "amortisation", label: "Amortisation" },
  { value: "abnormal-provisions", label: "Abnormal provisions" },
  { value: "inventory-writedowns", label: "Inventory write-downs (abnormal)" },
  { value: "impairments", label: "Impairments" },
  { value: "accounting-policy-changes", label: "Changes in accounting policy" },

  // Normalisation Adjustments
  { value: "rent-normalisation", label: "Related-party rent normalisation" },
  { value: "vacant-role-adjustment", label: "Vacant role salary adjustment" },
  { value: "underpaid-staff", label: "Underpaid key staff adjustment" },
  { value: "temporary-labour", label: "Temporary labour (non-recurring)" },
  { value: "owner-multiple-roles", label: "Owner performing multiple roles" },

  // Other
  { value: "other", label: "Other (specify below)" },
];

export function AddbacksTable({ addbacks, financialYears, onAddbackChange, onAddAddback, totalValuesByYear, adjustedEbitByYear, disabled = false, currencySymbol = "$", currencyCode = "AUD" }: AddbacksTableProps) {
  const dollarCurrencies = ["AUD", "USD", "CAD", "NZD", "SGD", "HKD"];
  const codeSuffix = dollarCurrencies.includes(currencyCode) ? ` ${currencyCode}` : "";
  const fmt = (val: string | number) => `${currencySymbol}${val || "0"}${codeSuffix}`;
  const handleYearValueChange = (addbackId: string, year: string, value: string) => {
    const addback = addbacks.find((a) => a.id === addbackId);
    if (!addback) return;

    const newValues = { ...addback.values, [year]: value };
    onAddbackChange(addbackId, "values", newValues);
  };

  return (
    <div className="mb-6">
      <div className="bg-blue-500 flex items-center justify-between">
        <SectionHeader title="ADDBACKS/ADJUSTMENTS" />
        {disabled && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Login required</span>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-t-0 rounded-b-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase p-3">Addback Reason</th>
              {financialYears.map((year) => {
                const [colType, colDate] = year.split(" - ");
                return (
                  <th key={year} className="text-center text-xs font-semibold text-gray-600 uppercase p-3 w-[150px]">
                    <span className="block">{colType}</span>
                    {colDate && <span className="block font-normal normal-case text-gray-400">{colDate}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {addbacks.map((addback) => (
              <tr key={addback.id} className="border-t">
                <td className="p-3 align-bottom">
                  <div className="space-y-2">
                    <Select value={addback.reason} onValueChange={(value) => onAddbackChange(addback.id, "reason", value)} disabled={disabled}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 w-full">
                        <SelectValue placeholder="Select addback reason" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {ADDBACK_REASONS.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {addback.reason === "other" && <Input type="text" value={addback.customReason || ""} onChange={(e) => onAddbackChange(addback.id, "customReason", e.target.value)} placeholder="Enter custom reason" className="bg-white border-gray-300" disabled={disabled} />}
                  </div>
                </td>
                {financialYears.map((year) => (
                  <td key={year} className="p-3 align-bottom">
                    <Input type="number" value={addback.values[year] || ""} onChange={(e) => handleYearValueChange(addback.id, year, e.target.value)} placeholder="0" className="bg-gray-50 border-gray-200 text-center" disabled={disabled} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t bg-gray-100">
              <td className="p-3 text-sm font-semibold text-gray-700 uppercase">Total Addbacks</td>
              {financialYears.map((year) => (
                <td key={year} className="p-3 text-sm font-semibold text-gray-900 text-center">
                  {fmt(totalValuesByYear[year] || "0")}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="p-3 flex justify-end border-t">
          <Button variant="outline" size="sm" onClick={onAddAddback} disabled={disabled}>
            <Plus className="w-4 h-4 mr-1" />
            ADD ADDBACK
          </Button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden border border-t-0 rounded-b-md overflow-hidden">
        <div className="divide-y">
          {addbacks.map((addback) => (
            <div key={addback.id} className="p-4 space-y-3 bg-white">
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase mb-1 block">Reason</label>
                <Select value={addback.reason} onValueChange={(value) => onAddbackChange(addback.id, "reason", value)} disabled={disabled}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 w-full">
                    <SelectValue placeholder="Select addback reason" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {ADDBACK_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addback.reason === "other" && <Input type="text" value={addback.customReason || ""} onChange={(e) => onAddbackChange(addback.id, "customReason", e.target.value)} placeholder="Enter custom reason" className="bg-white border-gray-300 mt-2" disabled={disabled} />}
              </div>
              {financialYears.map((year) => (
                <div key={year}>
                  <label className="text-xs font-medium text-gray-600 uppercase mb-1 block">{year}</label>
                  <Input type="number" value={addback.values[year] || ""} onChange={(e) => handleYearValueChange(addback.id, year, e.target.value)} placeholder="0" className="bg-gray-50 border-gray-200" disabled={disabled} />
                </div>
              ))}
            </div>
          ))}
          <div className="p-4 bg-gray-100">
            <div className="text-sm font-semibold text-gray-700 uppercase mb-2">Total Addbacks</div>
            <div className="grid grid-cols-3 gap-2">
              {financialYears.map((year) => (
                <div key={year} className="text-center">
                  <div className="text-xs text-gray-600 mb-1">{year}</div>
                  <div className="text-sm font-semibold text-gray-900">{totalValuesByYear[year] || `${currencySymbol}0`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 flex justify-end border-t bg-white">
          <Button variant="outline" size="sm" onClick={onAddAddback} disabled={disabled}>
            <Plus className="w-4 h-4 mr-1" />
            ADD ADDBACK
          </Button>
        </div>
      </div>
    </div>
  );
}
