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
  onRemoveAddback: (id: string) => void;
  totalValuesByYear: Record<string, string>;
  adjustedEbitByYear: Record<string, number>; // EBIT + Addbacks for each year
  disabled?: boolean;
  currencySymbol?: string;
  currencyCode?: string;
}

// Predefined addback reasons organized by category
const ADDBACK_REASONS = [
  { value: "donations", label: "Donations" },
  { value: "entertainment", label: "Entertainment expenses" },
  { value: "sponsorship", label: "Sponsorship expenses" },
  { value: "legal-fees", label: "Legal fees (one-time or non-recurring)" },
  { value: "owner-personal-expenses", label: "Owner's personal expenses" },
  { value: "one-time-consulting", label: "One-time consulting fees" },
  { value: "relocation-costs", label: "Relocation costs" },
  { value: "restructuring-costs", label: "Restructuring costs" },
  { value: "fines-penalties", label: "Fines and penalties (where appropriate)" },
  { value: "other", label: "Other (specify below)" },
];

export function AddbacksTable({ addbacks, financialYears, onAddbackChange, onAddAddback, onRemoveAddback, totalValuesByYear, adjustedEbitByYear, disabled = false, currencySymbol = "$", currencyCode = "AUD" }: AddbacksTableProps) {
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
                    <Select
                      value={addback.reason}
                      onValueChange={(value) => {
                        if (value === "__remove__") {
                          onRemoveAddback(addback.id);
                        } else {
                          onAddbackChange(addback.id, "reason", value);
                        }
                      }}
                      disabled={disabled}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 w-full">
                        <SelectValue placeholder="Select addback reason" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="__remove__">
                          <span className="text-gray-400">— Remove row —</span>
                        </SelectItem>
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
                <Select
                  value={addback.reason}
                  onValueChange={(value) => {
                    if (value === "__remove__") {
                      onRemoveAddback(addback.id);
                    } else {
                      onAddbackChange(addback.id, "reason", value);
                    }
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 w-full">
                    <SelectValue placeholder="Select addback reason" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="__remove__">
                      <span className="text-gray-400">— Remove row —</span>
                    </SelectItem>
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
