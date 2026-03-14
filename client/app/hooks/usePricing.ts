import { useState, useEffect } from "react";
import { getUserPricing, clearPricingCache, type CurrencyInfo } from "@/lib/currency-utils";

interface PricingData {
  amount: number;
  currency: CurrencyInfo;
  formatted: string;
}

/**
 * Hook to fetch and cache user pricing based on their location
 * Pricing is cached for 24 hours in localStorage
 */
export function usePricing() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPricing() {
      try {
        setLoading(true);
        const data = await getUserPricing();
        setPricing(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch pricing"));
        // Set fallback pricing
        setPricing({
          amount: 495,
          currency: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
          formatted: "A$495",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPricing();
  }, []);

  /**
   * Manually refresh pricing (clears cache and fetches fresh data)
   */
  const refreshPricing = async () => {
    clearPricingCache();
    setLoading(true);
    try {
      const data = await getUserPricing();
      setPricing(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch pricing"));
    } finally {
      setLoading(false);
    }
  };

  return {
    pricing,
    loading,
    error,
    refreshPricing,
  };
}
