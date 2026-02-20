"use client";

import { Input } from "@/components/ui/input";
import { SectionHeader } from "./SectionHeader";

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
}

export function FinancialDataTable({ title, metrics, years, values, onChange, calculatedRow }: FinancialDataTableProps) {
  return (
    <div className="mb-6">
      <SectionHeader title={title} />
      <div className="border border-t-0 rounded-b-md overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase p-3 w-[180px]">Metric</th>
              {years.map((year) => (
                <th key={year} className="text-left text-xs font-semibold text-gray-600 uppercase p-3">
                  {year}
                </th>
              ))}
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
                      <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm font-semibold text-blue-700">${values[metric.key]?.[year] || "0"}</div>
                    ) : (
                      // Input field
                      <Input type="number" value={values[metric.key]?.[year] || ""} onChange={(e) => onChange(metric.key, year, e.target.value)} placeholder={metric.placeholder || "Enter value"} className="bg-gray-50 border-gray-200" />
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
                    ${calculatedRow.values[year] || "0"}
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
