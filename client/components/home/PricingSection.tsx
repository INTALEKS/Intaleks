"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiClient, type SubscriptionPlan } from "@/app/services/api";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useCreateCheckout } from "@/app/hooks/usePayments";

export function PricingSection() {
  const router = useRouter();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const { isAuthenticated, isAuthentiating, hasActiveSubscription, subscription } = useAuthState();
  const createCheckout = useCreateCheckout();

  useEffect(() => {
    ApiClient.getPublicPlans().then((response) => {
      if (response.success) setPlans(response.data);
    }).catch(() => setPlans([]));
  }, []);

  // Static pricing definitions for the 3 access tiers
  const pricingTiers = [
    {
      id: plans.find((plan) => plan.name === "2 Months Access" || plan.name === "One-Off")?.id,
      duration: "2 months",
      price: "$495",
      period: "AUD · one payment",
      subtitle: "Included as standard",
      isPopular: false,
      badgeText: "Standard Plan",
    },
    {
      id: plans.find((plan) => plan.name === "6 Months Access")?.id,
      duration: "6 months",
      price: "$695",
      period: "AUD · one payment",
      subtitle: "Track a full half-year of trading",
      isPopular: true,
      badgeText: "Most Popular",
    },
    {
      id: plans.find((plan) => plan.name === "12 Months Access")?.id,
      duration: "12 months",
      price: "$995",
      period: "AUD · one payment",
      subtitle: "Value at the start and end of the financial year",
      isPopular: false,
      badgeText: "Full Year Access",
    },
  ];

  const commonFeatures = [
    "Detailed PDF valuation report",
    "Australian & international industry benchmarks",
    "Multiple valuation methodologies",
    "Business assessment framework",
    "Adjust your figures and rerun as often as you like",
    "No hidden costs, no engagement fees",
  ];

  const handleSubscribe = (planId?: string) => {
    if (!planId) return;
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(`/?subscribe=${planId}`);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

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

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-blue-50/50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-2">
            Simple, affordable, professional
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            One price. Everything you need.
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Choose the access period that fits your business goals. Upgrade or extend your access at any time.
          </p>
        </div>

        {/* 3-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricingTiers.map((tier) => {
            const isProcessing = processingPlanId === tier.id;
            return (
              <div
                key={tier.id}
                className={`relative bg-white rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  tier.isPopular
                    ? "border-2 border-blue-600 shadow-2xl scale-102 bg-gradient-to-b from-blue-50/30 to-white"
                    : "border border-gray-200 shadow-lg hover:shadow-xl"
                }`}
              >
                {/* Popular Badge */}
                {tier.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    {tier.badgeText}
                  </div>
                )}

                <div>
                  {/* Duration Title */}
                  <div className="mb-4 pt-2">
                    <h3 className="text-2xl font-bold text-gray-900">{tier.duration}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">{tier.subtitle}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">{tier.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold mt-1">{tier.period}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {commonFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={isProcessing || !tier.id}
                    className={`w-full py-6 rounded-xl font-bold text-base transition-all duration-200 ${
                      tier.isPopular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        : "bg-gray-900 hover:bg-black text-white"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Start My Valuation"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade / Extension Info Note */}
        <div className="mt-12 text-center bg-blue-50/80 border border-blue-200 rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto">
          <p className="text-sm text-blue-900 font-medium">
            💡 <strong>Tracking your value over time?</strong> Extended access can be added at checkout or any time before your current 2 months expire.
          </p>
        </div>
      </div>
    </section>
  );
}
