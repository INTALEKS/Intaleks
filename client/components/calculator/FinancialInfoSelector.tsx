"use client";

import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const COLUMN_TYPES = ["2Yr Prev", "1Yr Prev", "Last FY", "Forecast Yr"] as const;
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

const MAX_COLUMNS = 3;

export function FinancialInfoSelector({ columns, onColumnsChange, disabled = false }: FinancialInfoSelectorProps) {
  const selectedTypes = new Set(columns.map((c) => c.type));

  const handleToggle = (type: ColumnType, checked: boolean) => {
    if (checked) {
      if (columns.length >= MAX_COLUMNS) return;
      const newCol: FinancialColumn = { type, daysInPeriod: 365, periodDate: undefined };
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
              {/* <th className="px-4 py-3" /> */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-700">Select most relevant years</span>
                  <span className="text-red-500 text-xs font-semibold">*</span>
                </div>
              </td>

              {COLUMN_TYPES.map((type) => {
                const isSelected = selectedTypes.has(type);
                const isDisabledToggle = disabled || (!isSelected && columns.length >= MAX_COLUMNS);
                return (
                  <th key={type} className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox id={`col-${type}`} checked={isSelected} onCheckedChange={(checked) => handleToggle(type, !!checked)} disabled={isDisabledToggle} className={cn(isSelected && "border-blue-500 bg-blue-500")} />
                      <label htmlFor={`col-${type}`} className={cn("text-sm font-medium select-none whitespace-nowrap", isSelected ? "text-gray-900 cursor-pointer" : "text-gray-400", isDisabledToggle ? "cursor-not-allowed" : "cursor-pointer")}>
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
                        <p className="text-xs max-w-[200px]">Number of days in the financial reporting period. Use 365 for a standard full year.</p>
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
                    {col ? (
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        value={col.daysInPeriod}
                        onChange={(e) => {
                          const raw = parseInt(e.target.value);
                          if (!isNaN(raw)) {
                            updateColumn(type, { daysInPeriod: Math.min(365, Math.max(1, raw)) });
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
                    {col ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" disabled={disabled} className={cn("w-full h-10 justify-start text-left font-normal text-sm bg-white border-gray-300 hover:bg-gray-50 px-3", !col.periodDate && "text-gray-400")}>
                            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                            <span className="truncate">{col.periodDate ? format(col.periodDate, "dd/MM/yyyy") : "Pick date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={col.periodDate} onSelect={(date) => updateColumn(type, { periodDate: date })} initialFocus />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="w-full h-10 bg-gray-100 rounded-md border border-gray-200" />
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
