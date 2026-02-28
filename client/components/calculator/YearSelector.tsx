"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface YearSelectorProps {
  selectedYears: number[];
  onYearsChange: (years: number[]) => void;
  disabled?: boolean;
}

export function YearSelector({ selectedYears, onYearsChange, disabled = false }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();

  // Generate available years (last 20 years, excluding current year)
  const availableYears = Array.from({ length: 20 }, (_, i) => currentYear - 1 - i);

  const handleAddYear = () => {
    if (selectedYears.length >= 5) return; // Max 5 years

    // Find the first available year not already selected
    const nextYear = availableYears.find((year) => !selectedYears.includes(year));
    if (nextYear) {
      onYearsChange([...selectedYears, nextYear].sort((a, b) => a - b));
    }
  };

  const handleRemoveYear = (yearToRemove: number) => {
    if (selectedYears.length <= 1) return; // Must have at least 1 year
    onYearsChange(selectedYears.filter((year) => year !== yearToRemove));
  };

  const handleYearChange = (oldYear: number, newYear: number) => {
    const updatedYears = selectedYears.map((year) => (year === oldYear ? newYear : year));
    onYearsChange(updatedYears.sort((a, b) => a - b));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Financial Years</label>
        <Button type="button" variant="outline" size="sm" onClick={handleAddYear} disabled={selectedYears.length >= 5 || disabled} className="text-xs">
          <Plus className="w-3 h-3 mr-1" />
          Add Year
        </Button>
      </div>

      <div className="space-y-2">
        {selectedYears.map((year, index) => (
          <div key={year} className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-16">Year {index + 1}:</span>
            <Select value={year.toString()} onValueChange={(value) => handleYearChange(year, parseInt(value))} disabled={disabled}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears
                  .filter((y) => !selectedYears.includes(y) || y === year)
                  .map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveYear(year)} disabled={selectedYears.length <= 1 || disabled} className="text-gray-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">Select 1–5 financial years for your valuation. Average Adjusted EBIT always uses the years you have selected.</p>
    </div>
  );
}
