"use client";

import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const COLUMN_TYPES = ["2Yr Prev", "1Yr Prev", "Last FY", "Forecast Yr"] as const;
export type ColumnType = (typeof COLUMN_TYPES)[number];

export const DAYS_OPTIONS = [365, 364, 366, 183, 273] as const;

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

const MAX_COLUMNS = 3;

export function FinancialInfoSelector({ columns, onColumnsChange, disabled = false }: FinancialInfoSelectorProps) {
  const selectedTypes = new Set(columns.map((c) => c.type));

  const handleToggle = (type: ColumnType, checked: boolean) => {
    if (checked) {
      if (columns.length >= MAX_COLUMNS) return;
      const newCol: FinancialColumn = { type, daysInPeriod: 365, periodDate: undefined };
      // Keep order matching COLUMN_TYPES
      const next = [...columns, newCol].sort((a, b) => COLUMN_TYPES.indexOf(a.type) - COLUMN_TYPES.indexOf(b.type));
      onColumnsChange(next);
    } else {
      onColumnsChange(columns.filter((c) => c.type !== type));
    }
  };

  const updateColumn = (type: ColumnType, patch: Partial<FinancialColumn>) => {
    onColumnsChange(columns.map((c) => (c.type === type ? { ...c, ...patch } : c)));
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 text-center">Financial Information</h3>
      </div>

      {/* Max columns notice */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-center">
        <span className="text-xs text-amber-700">Please tick a maximum of {MAX_COLUMNS} columns.</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-[200px]" />
              {COLUMN_TYPES.map((type) => {
                const isSelected = selectedTypes.has(type);
                const isDisabledToggle = disabled || (!isSelected && columns.length >= MAX_COLUMNS);
                return (
                  <th key={type} className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox id={`col-${type}`} checked={isSelected} onCheckedChange={(checked) => handleToggle(type, !!checked)} disabled={isDisabledToggle} className={cn(isSelected && "border-blue-500 bg-blue-500")} />
                      <label htmlFor={`col-${type}`} className={cn("text-xs font-medium cursor-pointer select-none", isSelected ? "text-gray-900" : "text-gray-400", isDisabledToggle && "cursor-not-allowed")}>
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
                  <span className="text-sm text-gray-700">Days in reporting period</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">Number of days in the financial reporting period. Use 365 for a standard full year.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-red-500 text-xs">*</span>
                </div>
              </td>
              {COLUMN_TYPES.map((type) => {
                const col = columns.find((c) => c.type === type);
                return (
                  <td key={type} className="px-3 py-3">
                    {col ? (
                      <Select value={col.daysInPeriod.toString()} onValueChange={(v) => updateColumn(type, { daysInPeriod: Number(v) })} disabled={disabled}>
                        <SelectTrigger className="h-9 text-sm bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OPTIONS.map((d) => (
                            <SelectItem key={d} value={d.toString()}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-9 bg-gray-100 rounded-md" />
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Period Date row */}
            <tr>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Period Date</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">The end date of the financial reporting period (e.g. 31/03/2026 for a March year-end).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-red-500 text-xs">*</span>
                </div>
              </td>
              {COLUMN_TYPES.map((type) => {
                const col = columns.find((c) => c.type === type);
                return (
                  <td key={type} className="px-3 py-3">
                    {col ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" disabled={disabled} className={cn("w-full h-9 justify-start text-left font-normal text-sm bg-white", !col.periodDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                            {col.periodDate ? format(col.periodDate, "dd/MM/yyyy") : <span>Pick date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={col.periodDate} onSelect={(date) => updateColumn(type, { periodDate: date })} initialFocus />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="h-9 bg-gray-100 rounded-md" />
                    )}
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
 * Label format: "Last FY - 31/03/2026" when a date is set, otherwise just "Last FY".
 */
export function columnsToYearLabels(columns: FinancialColumn[]): string[] {
  return columns.map((col) => (col.periodDate ? `${col.type} - ${format(col.periodDate, "dd/MM/yyyy")}` : col.type));
}

/**
 * Returns a short display label for PDF headers (e.g. "Last FY\n31/03/2026").
 */
export function columnToShortLabel(col: FinancialColumn): string {
  return col.periodDate ? `${col.type}\n${format(col.periodDate, "dd/MM/yyyy")}` : col.type;
}
