"use client";

import { format, parse } from "date-fns";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

export const COLUMN_TYPES = ["Year 1", "Year 2", "Year 3", "Year 4"] as const;
export type ColumnType = (typeof COLUMN_TYPES)[number];

export interface FinancialColumn {
  type: ColumnType;
  daysInPeriod: number;
  periodDate: Date | undefined;
}

interface FinancialInfoSelectorProps {
  columns: FinancialColumn[];
  onColumnsChange: (columns: FinancialColumn[]) => void;
  disabled?: boolean;
}

const MAX_COLUMNS = 4;

// Helper function to check if a year is a leap year
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Helper function to get max days for a given year
function getMaxDaysForYear(date: Date | undefined): number {
  if (!date) return 366; // Allow up to 366 if no date is set
  return isLeapYear(date.getFullYear()) ? 366 : 365;
}

// Date input component with DD/MM/YYYY format
function DateInput({ value, onChange, disabled }: { value: Date | undefined; onChange: (date: Date | undefined) => void; disabled: boolean }) {
  const [inputValue, setInputValue] = useState(value ? format(value, "dd/MM/yyyy") : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only allow digits and slashes
    const cleaned = newValue.replace(/[^\d/]/g, "");

    // Limit length
    if (cleaned.length > 10) return;

    setInputValue(cleaned);

    // Try to parse when we have a complete date
    if (cleaned.length === 10) {
      try {
        const parsed = parse(cleaned, "dd/MM/yyyy", new Date());
        if (!isNaN(parsed.getTime())) {
          // Validate the date is reasonable
          const year = parsed.getFullYear();
          if (year >= 1900 && year <= 2100) {
            onChange(parsed);
          }
        }
      } catch {
        // Invalid date, don't update
      }
    }
  };

  const handleBlur = () => {
    // Reset to formatted value on blur if we have a valid date
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else if (inputValue.length < 10) {
      // Clear incomplete input
      setInputValue("");
    }
  };

  return <Input type="text" placeholder="DD/MM/YYYY" value={inputValue} onChange={handleChange} onBlur={handleBlur} disabled={disabled} maxLength={10} className="w-full h-10 text-sm bg-white border-gray-300 text-center font-mono tracking-wide" />;
}

export function FinancialInfoSelector({ columns, onColumnsChange, disabled = false }: FinancialInfoSelectorProps) {
  const selectedTypes = new Set(columns.map((c) => c.type));
  const atMax = columns.length >= MAX_COLUMNS;

  const handleToggle = (type: ColumnType) => {
    if (disabled) return;
    const isSelected = selectedTypes.has(type);
    if (!isSelected && atMax) return;
    if (isSelected) {
      onColumnsChange(columns.filter((c) => c.type !== type));
    } else {
      const newCol: FinancialColumn = { type, daysInPeriod: 365, periodDate: undefined };
      const next = [...columns, newCol].sort((a, b) => COLUMN_TYPES.indexOf(a.type) - COLUMN_TYPES.indexOf(b.type));
      onColumnsChange(next);
    }
  };

  const updateColumn = (type: ColumnType, patch: Partial<FinancialColumn>) => {
    onColumnsChange(
      columns.map((c) => {
        if (c.type !== type) return c;
        const updated = { ...c, ...patch };

        // If period date changed, adjust daysInPeriod if it exceeds the max for that year
        if (patch.periodDate !== undefined) {
          const maxDays = getMaxDaysForYear(patch.periodDate);
          if (updated.daysInPeriod > maxDays) {
            updated.daysInPeriod = maxDays;
          }
        }

        return updated;
      }),
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Notice bar */}
      <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-center">
        <span className="text-xs font-medium text-amber-700">Please tick a maximum of {MAX_COLUMNS} columns.</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed min-w-[640px]">
          <colgroup>
            <col style={{ width: "220px" }} />
            <col />
            <col />
            <col />
            <col />
          </colgroup>

          {/* Checkbox header row */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-700">Select most relevant years</span>
                  <span className="text-red-500 text-xs font-semibold">*</span>
                </div>
              </td>

              {COLUMN_TYPES.map((type) => {
                const isSelected = selectedTypes.has(type);
                const isDisabledToggle = disabled || (!isSelected && atMax);
                return (
                  <th key={type} className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox id={`col-${type}`} checked={isSelected} onCheckedChange={() => handleToggle(type)} disabled={isDisabledToggle} className={cn(isSelected && "border-blue-500 bg-blue-500")} />
                      <label htmlFor={`col-${type}`} className={cn("text-sm font-medium select-none whitespace-nowrap", isDisabledToggle ? "text-gray-400 cursor-not-allowed" : "text-gray-900 cursor-pointer")}>
                        {type}
                      </label>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {/* Days in reporting period row */}
            <tr className="border-b border-gray-100">
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-700">Days in reporting period</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-gray-400 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs max-w-[200px]">Number of days in the financial reporting period. Use 365 for a standard full year, or 366 for a leap year.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-red-500 text-xs font-semibold">*</span>
                </div>
              </td>
              {COLUMN_TYPES.map((type) => {
                const col = columns.find((c) => c.type === type);
                const maxDays = col ? getMaxDaysForYear(col.periodDate) : 366;
                return (
                  <td key={type} className="px-3 py-3">
                    {col ? (
                      <Input
                        type="number"
                        min={1}
                        max={maxDays}
                        value={col.daysInPeriod}
                        onChange={(e) => {
                          const raw = parseInt(e.target.value);
                          if (!isNaN(raw)) {
                            updateColumn(type, { daysInPeriod: Math.min(maxDays, Math.max(1, raw)) });
                          }
                        }}
                        disabled={disabled}
                        className="w-full h-10 text-sm bg-white border-gray-300"
                      />
                    ) : (
                      <div className="w-full h-10 bg-gray-100 rounded-md border border-gray-200" />
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Period Date row */}
            <tr>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-700">Period Date</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-gray-400 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs max-w-[200px]">The end date of the financial reporting period (e.g. 31/03/2026 for a March year-end).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-red-500 text-xs font-semibold">*</span>
                </div>
              </td>
              {COLUMN_TYPES.map((type) => {
                const col = columns.find((c) => c.type === type);
                return (
                  <td key={type} className="px-3 py-3">
                    {col ? <DateInput value={col.periodDate} onChange={(date) => updateColumn(type, { periodDate: date })} disabled={disabled} /> : <div className="w-full h-10 bg-gray-100 rounded-md border border-gray-200" />}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Converts FinancialColumn[] into the year label strings used throughout the calculator.
 * Label format: "Year 1 - 31/03/2026" when a date is set, otherwise just "Year 1".
 */
export function columnsToYearLabels(columns: FinancialColumn[]): string[] {
  return columns.map((col) => (col.periodDate ? `${col.type} - ${format(col.periodDate, "dd/MM/yyyy")}` : col.type));
}

/**
 * Returns a short display label for PDF headers (e.g. "Year 1\n31/03/2026").
 */
export function columnToShortLabel(col: FinancialColumn): string {
  return col.periodDate ? `${col.type}\n${format(col.periodDate, "dd/MM/yyyy")}` : col.type;
}
