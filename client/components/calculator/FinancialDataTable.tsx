"use client";

import { Input } from "@/components/ui/input";
import { SectionHeader } from "./SectionHeader";
import { Lock } from "lucide-react";

interface FinancialMetric {
  key: string;
  label: string;
  placeholder?: string;
  isInput?: boolean; // true = user input, false = calculated field
}

interface FinancialDataTableProps {
  title: string;
  metrics: FinancialMetric[];
  years: string[];
  values: Record<string, Record<string, string | number>>;
  onChange: (metric: string, year: string, value: string) => void;
  calculatedRow?: {
    label: string;
    values: Record<string, string | number>;
  };
  disabled?: boolean;
  currencySymbol?: string;
}

export function FinancialDataTable({ title, metrics, years, values, onChange, calculatedRow, disabled = false, currencySymbol = "A$" }: FinancialDataTableProps) {
  return (
    <div className="mb-6">
      <div className="bg-blue-500 flex items-center justify-between">
        <SectionHeader title={title} />
        {disabled && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Login required</span>
          </div>
        )}
      </div>
      <div className="border border-t-0 rounded-b-md overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase p-3 w-[180px]">Metric</th>
              {years.map((year) => {
                const [colType, colDate] = year.split(" - ");
                return (
                  <th key={year} className="text-left text-xs font-semibold text-gray-600 uppercase p-3">
                    <span className="block">{colType}</span>
                    {colDate && <span className="block font-normal normal-case text-gray-400">{colDate}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.key} className="border-t">
                <td className="p-3 text-sm text-gray-600">{metric.label}</td>
                {years.map((year) => (
                  <td key={year} className="p-3">
                    {metric.isInput === false ? (
                      // Calculated field - read-only display
                      <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm font-semibold text-blue-700">
                        {currencySymbol}
                        {values[metric.key]?.[year] || "0"}
                      </div>
                    ) : (
                      // Input field
                      <Input type="number" value={values[metric.key]?.[year] || ""} onChange={(e) => onChange(metric.key, year, e.target.value)} placeholder={metric.placeholder || "Enter value"} className="bg-gray-50 border-gray-200" disabled={disabled} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {calculatedRow && (
              <tr className="border-t bg-gray-500 text-white">
                <td className="p-3 text-sm font-semibold uppercase">{calculatedRow.label}</td>
                {years.map((year) => (
                  <td key={year} className="p-3 text-sm font-bold">
                    {currencySymbol}
                    {calculatedRow.values[year] || "0"}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
