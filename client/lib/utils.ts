import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with proper thousand separators and optional currency prefix
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted string with comma separators (e.g., $788,025 or 10,000)
 */
export function formatValue(
  value: number,
  options: {
    currency?: boolean;
    decimals?: number;
    locale?: string;
  } = {}
): string {
  const { currency = false, decimals = 0, locale = "en-US" } = options;

  // Format with thousand separators (always show full number with commas)
  const formattedValue = value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return currency ? `$${formattedValue}` : formattedValue;
}
