"use client";

import { useState } from "react";
import { Lock, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "./SectionHeader";

export interface OwnerSalaryYearData {
  paidSalary: string; // Salary paid to owner
  marketSalary: string; // Market replacement salary
}

export interface OwnersSalaryTableProps {
  financialYears: string[];
  ownerSalaryData: Record<string, OwnerSalaryYearData>;
  onChange: (year: string, field: "paidSalary" | "marketSalary", value: string) => void;
  superRate?: number; // Default 0.12 (12%)
  onSuperRateChange?: (rate: number) => void;
  disabled?: boolean;
  currencySymbol?: string;
  currencyCode?: string;
}

export function OwnersSalaryTable({
  financialYears,
  ownerSalaryData,
  onChange,
  superRate = 0.12,
  onSuperRateChange,
  disabled = false,
  currencySymbol = "$",
  currencyCode = "AUD",
}: OwnersSalaryTableProps) {
  const dollarCurrencies = ["AUD", "USD", "CAD", "NZD", "SGD", "HKD"];
  const codeSuffix = dollarCurrencies.includes(currencyCode) ? ` ${currencyCode}` : "";

  const fmt = (n: number) => `${currencySymbol}${Math.round(Math.abs(n)).toLocaleString('en-AU')}`;

  const superPercent = Math.round(superRate * 100);

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header Bar */}
      <div className="bg-blue-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <SectionHeader title="OWNER'S SALARY INFORMATION — ADDBACK" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-blue-700/60 px-2.5 py-1 rounded text-xs">
            <span className="font-medium text-blue-100">Super Rate:</span>
            {onSuperRateChange && !disabled ? (
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={superPercent}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      onSuperRateChange(val / 100);
                    }
                  }}
                  className="w-12 px-1 py-0.5 text-right font-semibold bg-white text-gray-900 rounded text-xs border-0 outline-none"
                />
                <span className="ml-1 text-white font-medium">%</span>
              </div>
            ) : (
              <span className="font-bold text-white">{superPercent}%</span>
            )}
          </div>
          {disabled && (
            <div className="flex items-center gap-1 text-blue-200 text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Read only</span>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase p-3 pl-4">Addback Reason</th>
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
          <tbody className="divide-y divide-gray-200">
            {/* Row 1: What salary did you pay yourself? */}
            <tr className="bg-white">
              <td className="p-3 pl-4 text-sm font-medium text-gray-800">
                What salary did you pay yourself?
              </td>
              {financialYears.map((year) => {
                const val = ownerSalaryData[year]?.paidSalary || "";
                return (
                  <td key={year} className="p-3 text-center">
                    <div className="relative inline-block w-full max-w-[140px]">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">{currencySymbol}</span>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={val}
                        onChange={(e) => onChange(year, "paidSalary", e.target.value)}
                        placeholder="0"
                        disabled={disabled}
                        className="pl-6 text-right bg-gray-50 border-gray-200 text-sm font-mono h-9"
                      />
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: + Superannuation */}
            <tr className="bg-gray-50/50 text-xs text-gray-500">
              <td className="p-2.5 pl-8 text-gray-600">
                + Superannuation {superPercent}%
              </td>
              {financialYears.map((year) => {
                const paid = parseFloat(ownerSalaryData[year]?.paidSalary || "0") || 0;
                const paidSuper = paid * superRate;
                return (
                  <td key={year} className="p-2.5 text-center font-mono text-gray-600 text-xs">
                    {fmt(paidSuper)}
                  </td>
                );
              })}
            </tr>

            {/* Row 3: What should you have paid yourself? (market salary) */}
            <tr className="bg-white">
              <td className="p-3 pl-4 text-sm font-medium text-gray-800">
                What should you have paid yourself? <span className="text-gray-400 font-normal text-xs">(market salary)</span>
              </td>
              {financialYears.map((year) => {
                const val = ownerSalaryData[year]?.marketSalary || "";
                return (
                  <td key={year} className="p-3 text-center">
                    <div className="relative inline-block w-full max-w-[140px]">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">{currencySymbol}</span>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={val}
                        onChange={(e) => onChange(year, "marketSalary", e.target.value)}
                        placeholder="0"
                        disabled={disabled}
                        className="pl-6 text-right bg-gray-50 border-gray-200 text-sm font-mono h-9"
                      />
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 4: + Superannuation */}
            <tr className="bg-gray-50/50 text-xs text-gray-500">
              <td className="p-2.5 pl-8 text-gray-600">
                + Superannuation {superPercent}%
              </td>
              {financialYears.map((year) => {
                const mkt = parseFloat(ownerSalaryData[year]?.marketSalary || "0") || 0;
                const mktSuper = mkt * superRate;
                return (
                  <td key={year} className="p-2.5 text-center font-mono text-gray-600 text-xs">
                    {fmt(mktSuper)}
                  </td>
                );
              })}
            </tr>

            {/* Row 5: Add back: actual salary & super paid */}
            <tr className="bg-emerald-50/30 border-t border-gray-200">
              <td className="p-3 pl-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                Add back: actual salary &amp; super paid
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                  + plus to profit
                </span>
              </td>
              {financialYears.map((year) => {
                const paid = parseFloat(ownerSalaryData[year]?.paidSalary || "0") || 0;
                const totalPaid = paid * (1 + superRate);
                return (
                  <td key={year} className="p-3 text-center font-mono text-xs font-bold text-emerald-700">
                    +{fmt(totalPaid)}
                  </td>
                );
              })}
            </tr>

            {/* Row 6: Less: market salary & super that should have been paid */}
            <tr className="bg-rose-50/30">
              <td className="p-3 pl-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
                Less: market salary &amp; super that should have been paid
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-700">
                  − minus to profit
                </span>
              </td>
              {financialYears.map((year) => {
                const mkt = parseFloat(ownerSalaryData[year]?.marketSalary || "0") || 0;
                const totalMkt = mkt * (1 + superRate);
                return (
                  <td key={year} className="p-3 text-center font-mono text-xs font-bold text-rose-700">
                    −{fmt(totalMkt)}
                  </td>
                );
              })}
            </tr>

            {/* Row 7: Net Addback / (Adjustment) to Profit */}
            <tr className="bg-gray-100 border-t-2 border-gray-800 font-bold text-sm">
              <td className="p-3 pl-4 uppercase tracking-wider text-xs text-gray-900">
                Net Addback / (Adjustment) to Profit
              </td>
              {financialYears.map((year) => {
                const paid = parseFloat(ownerSalaryData[year]?.paidSalary || "0") || 0;
                const mkt = parseFloat(ownerSalaryData[year]?.marketSalary || "0") || 0;
                const totalPaid = paid * (1 + superRate);
                const totalMkt = mkt * (1 + superRate);
                const diff = totalPaid - totalMkt;

                if (!paid && !mkt) {
                  return (
                    <td key={year} className="p-3 text-center text-gray-500 font-mono">
                      {currencySymbol}0{codeSuffix}
                    </td>
                  );
                }

                if (diff > 0.5) {
                  return (
                    <td key={year} className="p-3 text-center text-emerald-700 font-mono">
                      +{fmt(diff)}{codeSuffix}
                      <span className="block text-[10px] font-bold uppercase text-emerald-600 mt-0.5">
                        Addback — increase profit
                      </span>
                    </td>
                  );
                } else if (diff < -0.5) {
                  return (
                    <td key={year} className="p-3 text-center text-rose-700 font-mono">
                      −{fmt(diff)}{codeSuffix}
                      <span className="block text-[10px] font-bold uppercase text-rose-600 mt-0.5">
                        Reduce profit
                      </span>
                    </td>
                  );
                } else {
                  return (
                    <td key={year} className="p-3 text-center text-gray-600 font-mono">
                      {currencySymbol}0{codeSuffix}
                      <span className="block text-[10px] font-normal uppercase text-gray-400 mt-0.5">
                        At market
                      </span>
                    </td>
                  );
                }
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Explanatory Footnote */}
      <div className="p-3.5 px-4 text-xs text-gray-500 bg-gray-50 border-t border-gray-200 leading-relaxed">
        The actual salary and super paid to the owner is <strong>added back to profit</strong> (it is not a true arm's-length cost). The market salary and super that should have been paid is then <strong>deducted from profit</strong> (the commercial cost of replacing the owner in the role). The net of the two lines is the addback/(adjustment) used in the valuation.
      </div>
    </div>
  );
}
