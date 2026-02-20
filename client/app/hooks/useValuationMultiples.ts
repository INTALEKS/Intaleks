"use client";

import { useQuery } from "@tanstack/react-query";
import { valuationMultiplesAPI } from "@/lib/valuation-multiples-api";

/**
 * Hook for fetching and using valuation multiples
 */
export const useValuationMultiples = () => {
  const query = useQuery({
    queryKey: ["valuation-multiples"],
    queryFn: () => valuationMultiplesAPI.getIndustryMultiples(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  /**
   * Get base multiple (40-50 range) for specific country and industry
   * Returns null if not found in database
   */
  const getMultiple = (country: string, industry: string): number | null => {
    const scoreRanges = query.data?.[country]?.[industry];
    if (!scoreRanges) return null;
    // Return the base multiple (40-50 range)
    return scoreRanges["40-50"] ?? null;
  };

  /**
   * Get base multiple with fallback to default value
   */
  const getMultipleWithFallback = (country: string, industry: string, fallback: number = 4.0): number => {
    const scoreRanges = query.data?.[country]?.[industry];
    if (!scoreRanges) return fallback;
    // Return the base multiple (40-50 range)
    return scoreRanges["40-50"] ?? fallback;
  };

  /**
   * Check if a specific country/industry combination exists in database
   */
  const hasMultiple = (country: string, industry: string): boolean => {
    return query.data?.[country]?.[industry] !== undefined;
  };

  return {
    // Query state
    multiples: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Helper functions
    getMultiple,
    getMultipleWithFallback,
    hasMultiple,

    // Query utilities
    refetch: query.refetch,
  };
};
