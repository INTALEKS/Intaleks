"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiClient, type SubscriptionPlan } from "@/app/services/api";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useCreateCheckout } from "@/app/hooks/usePayments";

/**
 * PricingSection Component
 * Displays subscription plans fetched from API with auth-aware checkout flow
 */
export function PricingSection() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const { isAuthenticated, isAuthentiating, hasActiveSubscription, subscription } = useAuthState();
  const createCheckout = useCreateCheckout();

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
    if (price === 0) return "$0";
    const amount = price / 100;
    return `$${Math.floor(amount)}`;
  };

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(`/?subscribe=${planId}`);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    setProcessingPlanId(planId);
    createCheckout.mutate(
      {
        planId,
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
    const baseStyle = isPopular ? "w-full py-3 bg-black text-white hover:bg-gray-800 rounded-lg font-medium" : "w-full py-3 bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg font-medium";
    const isProcessing = processingPlanId === plan.id;
    const isOtherProcessing = processingPlanId !== null && processingPlanId !== plan.id;

    if (isAuthentiating) {
      return (
        <Button className={baseStyle} disabled>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </Button>
      );
    }

    if (isCurrentPlan(plan.id)) {
      return (
        <Button className="w-full py-3 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed" disabled>
          Current Plan
        </Button>
      );
    }

    if (hasActiveSubscription) {
      return (
        <Button className={baseStyle} onClick={() => handleSubscribe(plan.id)} disabled={isProcessing || isOtherProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Change Plan"
          )}
        </Button>
      );
    }

    // Free plan - show "Get Started"
    if (plan.price === 0) {
      return (
        <Button className={baseStyle} onClick={() => router.push("/signup")} disabled={isOtherProcessing}>
          Get Started
        </Button>
      );
    }

    return (
      <Button className={baseStyle} onClick={() => handleSubscribe(plan.id)} disabled={isProcessing || isOtherProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
    );
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50">
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
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Pricing</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Choose the plan that fits your business valuation needs</p>

        <div className="max-w-2xl mx-auto grid grid-cols-1 gap-8">
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            const price = formatPrice(plan.price);
            const isFree = plan.price === 0;

            return (
              <div key={plan.id} className={`relative bg-white rounded-2xl p-8 flex flex-col ${isPopular ? "ring-2 ring-(--primary-border-typing) shadow-xl md:scale-105 z-10" : "border border-gray-200 shadow-sm"} transition-all duration-300 hover:shadow-lg`}>
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-(--primary-border-typing) text-white text-xs font-semibold px-4 py-1.5 rounded-full">Most Popular</span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {isCurrentPlan(plan.id) && <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Your Plan</span>}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline">
                    <span className={`font-bold text-gray-900 ${isFree ? "text-4xl" : "text-5xl"}`}>{price}</span>
                    {isFree ? <span className="text-gray-500 ml-1">/lifetime</span> : plan.billingPeriod === "ONE_TIME" ? <span className="text-gray-500 ml-1">/one-time</span> : plan.billingPeriod === "YEARLY" ? <span className="text-gray-500 ml-1">/year</span> : <span className="text-gray-500 ml-1">/month</span>}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
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
