"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiClient, type SubscriptionPlan } from "@/app/services/api";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useCreateCheckout } from "@/app/hooks/usePayments";
import { usePricing } from "@/app/hooks/usePricing";

/**
 * PricingSection Component
 * Displays subscription plans with dynamic currency conversion based on user location
 */
export function PricingSection() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const { isAuthenticated, isAuthentiating, hasActiveSubscription, subscription } = useAuthState();
  const createCheckout = useCreateCheckout();

  // Use pricing hook with 24-hour cache
  const { pricing, loading: priceLoading } = usePricing();

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await ApiClient.getPublicPlans();
        if (response.success) {
          setPlans(response.data);
        } else {
          setError("Failed to load pricing plans");
        }
      } catch {
        setError("Failed to load pricing plans");
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const formatPrice = (price: number): string => {
    if (pricing && !priceLoading) {
      const formattedAmount = pricing.amount.toLocaleString("en-US");
      return `${pricing.currency.symbol}${formattedAmount}`;
    }
    const amount = price / 100;
    return `A$${Math.floor(amount)}`;
  };

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(`/?subscribe=${planId}`);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // Proceed directly to checkout
    setProcessingPlanId(planId);

    createCheckout.mutate(
      {
        planId: planId,
        successUrl: `${window.location.origin}/?success=true`,
        cancelUrl: `${window.location.origin}/?canceled=true`,
      },
      {
        onSettled: () => {
          setProcessingPlanId(null);
        },
      },
    );
  };

  const isCurrentPlan = (planId: string): boolean => {
    return hasActiveSubscription && subscription?.id === planId;
  };

  const renderButton = (plan: SubscriptionPlan, isPopular: boolean) => {
    const baseStyle = "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200";
    const primaryStyle = `${baseStyle} bg-gray-900 text-white hover:bg-gray-800 shadow-lg`;
    const secondaryStyle = `${baseStyle} bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50`;

    const isProcessing = processingPlanId === plan.id;
    const isOtherProcessing = processingPlanId !== null && processingPlanId !== plan.id;

    if (isAuthentiating) {
      return (
        <Button className={primaryStyle} disabled>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading...
        </Button>
      );
    }

    if (isCurrentPlan(plan.id)) {
      return (
        <Button className={`${baseStyle} bg-gray-400 text-white cursor-not-allowed`} disabled>
          Current Plan
        </Button>
      );
    }

    if (hasActiveSubscription) {
      return (
        <Button className={primaryStyle} onClick={() => handleSubscribe(plan.id)} disabled={isProcessing || isOtherProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Change Plan"
          )}
        </Button>
      );
    }

    return (
      <Button className={primaryStyle} onClick={() => handleSubscribe(plan.id)} disabled={isProcessing || isOtherProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
    );
  };

  if (loading || priceLoading) {
    return (
      <section className="py-20 px-4 bg-linear-to-b from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Pricing</h2>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </section>
    );
  }

  if (error || plans.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="py-20 px-4 bg-linear-to-b from-blue-50 to-cyan-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Pricing</h2>
        <p className="text-gray-600 text-center mb-4 max-w-2xl mx-auto">Choose the plan that fits your business valuation needs</p>

        {/* Currency indicator */}
        {pricing && pricing.currency.code !== "AUD" && (
          <div className="flex items-center justify-center gap-2 mb-8 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>
              Prices shown in {pricing.currency.name} ({pricing.currency.code})
            </span>
            <span className="text-gray-400">• Converted from A$495 AUD</span>
          </div>
        )}

        <div className="max-w-2xl mx-auto grid grid-cols-1 gap-8">
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            const price = formatPrice(plan.price);

            return (
              <div key={plan.id} className={`relative bg-white rounded-3xl p-8 flex flex-col ${isPopular ? "ring-2 ring-blue-500 shadow-2xl" : "border border-gray-200 shadow-lg"} transition-all duration-300 hover:shadow-xl`}>
                {/* Plan badge */}
                <div className="mb-6">
                  <span className="inline-block bg-yellow-400 text-gray-900 text-sm font-bold px-4 py-2 rounded-lg uppercase tracking-wide">{plan.billingPeriod === "ONE_TIME" ? "ONE-OFF" : plan.name}</span>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">{price}</span>
                    <span className="text-gray-500 ml-2 text-lg">{plan.billingPeriod === "ONE_TIME" ? "/one-time" : plan.billingPeriod === "YEARLY" ? "/year" : "/month"}</span>
                  </div>
                  {pricing && pricing.currency.code !== "AUD" && <p className="text-sm text-gray-500">≈ A$495 AUD</p>}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-900 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="mt-auto">{renderButton(plan, isPopular)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
