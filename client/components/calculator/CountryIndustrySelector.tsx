"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Filter, Loader2 } from "lucide-react";

import { useValuationMultiples } from "@/app/hooks/useValuationMultiples";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountryIndustrySelectorProps {
  country: string;
  industry: string;
  customMultiple: string;
  onCountryChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCustomMultipleChange: (value: string) => void;
}

const countries = [
  { value: "australia", label: "🇦🇺 Australia" },
  { value: "united states", label: "🇺🇸 United States" },
  { value: "united kingdom", label: "🇬🇧 United Kingdom" },
  { value: "canada", label: "🇨🇦 Canada" },
];

// Industry list (mapped to match database values)
const industries = [
  { value: "construction", label: "Construction" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality", label: "Hospitality" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "professional", label: "Professional Services" },
  { value: "retail", label: "Retail" },
  { value: "service", label: "Service" },
  { value: "technology", label: "Technology" },
  { value: "wholesale", label: "Wholesale" },
  { value: "other", label: "Other" },
];

export function CountryIndustrySelector({ country, industry, customMultiple, onCountryChange, onIndustryChange, onCustomMultipleChange }: CountryIndustrySelectorProps) {
  const { getMultiple, hasMultiple, isLoading = false } = useValuationMultiples();

  // Get the multiple for current country/industry from database
  const dbMultiple = getMultiple(country, industry);
  const defaultMultiple = dbMultiple || 4.0;

  // Update custom multiple when country/industry changes
  useEffect(() => {
    // Always sync to the new base multiple when country/industry changes
    onCustomMultipleChange(String(defaultMultiple));
  }, [country, industry, defaultMultiple, onCustomMultipleChange]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center my-2">
        <Filter size={15} />

        <div className="flex gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Country</label>
            <Select value={country} onValueChange={onCountryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Industry</label>
            <Select value={industry} onValueChange={onIndustryChange} disabled={isLoading}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((i) => {
                  // Get base multiple from database for this country/industry
                  const baseMultiple = getMultiple(country, i.value) || 4.0;
                  return (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label} (Base: {baseMultiple}x)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Valuation Multiple {isLoading && <Loader2 className="inline w-3 h-3 animate-spin ml-2" />}</label>
            <div className="flex items-center gap-2">
              <input type="number" value={customMultiple} onChange={(e) => onCustomMultipleChange(e.target.value)} placeholder={String(defaultMultiple)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.1" min="0" disabled={isLoading} />
              <span className="text-sm text-gray-600">x</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {hasMultiple(country, industry) ? (
                <>
                  Base multiple for <strong className="capitalize">{industry}</strong> in <strong className="capitalize">{country}</strong>: <strong>{defaultMultiple}x</strong>
                  <br />
                  <span className="text-gray-500">Note: Final multiple will be adjusted based on your questionnaire score (×1.0, ×0.8, or ×0.5)</span>
                </>
              ) : (
                <>
                  Default base for <strong className="capitalize">{industry}</strong>: <strong>{defaultMultiple}x</strong>. Adjust if needed.
                  <br />
                  <span className="text-gray-500">Note: Final multiple will be adjusted based on your questionnaire score</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Please choose the right country and industry and this directly affects the{" "}
        <Link href="/#valuation-multiple" className="underline cursor-pointer font-medium text-black">
          valuation multiple
        </Link>{" "}
        and the final valuation document.
      </p>
    </div>
  );
}
