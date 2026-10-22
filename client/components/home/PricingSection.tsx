"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiClient, type SubscriptionPlan } from "@/app/services/api";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useCreateCheckout } from "@/app/hooks/usePayments";

export function PricingSection() {
  const router = useRouter();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isPartnerMember, setIsPartnerMember] = useState(false);

  const { isAuthenticated, isAuthentiating, hasActiveSubscription, subscription } = useAuthState();
  const createCheckout = useCreateCheckout();

  useEffect(() => {
    ApiClient.getPublicPlans().then((response) => {
      if (response.success) setPlans(response.data);
    }).catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    ApiClient.getPartnerFirmDashboard()
      .then((response) => setIsPartnerMember(Boolean(response.data)))
      .catch(() => setIsPartnerMember(false));
  }, [isAuthenticated]);

  const retailPlan = plans.find((plan) => plan.name === "2 Months Access" || plan.name === "One-Off");

  const commonFeatures = [
    "Detailed PDF valuation report",
    "Australian & international industry benchmarks",
    "Multiple valuation methodologies",
    "Business assessment framework",
    "One complete business valuation",
    "Corrections to that valuation are included",
    "Another valuation requires another purchase",
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
            One business valuation for a one-off fee of $495 AUD. Make corrections to that valuation as needed. Each additional valuation requires a new purchase.
          </p>
        </div>

        {isPartnerMember ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-blue-200 bg-white p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900">Partner plans are managed separately</h3>
            <p className="mt-3 text-gray-600">Your firm can choose, renew, or upgrade its Partner plan from the Partner Program dashboard.</p>
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/settings?tab=referrals")}>View Partner plans</Button>
          </div>
        ) : <>
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">One-off valuation</p>
          <h3 className="mt-3 text-3xl font-extrabold text-gray-900">$495 AUD once</h3>
          <p className="mt-3 text-gray-600">Includes one complete business valuation and corrections to that valuation. A separate purchase is required for each additional valuation.</p>
          <ul className="my-6 space-y-3">
            {commonFeatures.map((feat) => <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{feat}</span></li>)}
          </ul>
          <Button onClick={() => handleSubscribe(retailPlan?.id)} disabled={processingPlanId === retailPlan?.id || !retailPlan?.id} className="w-full bg-gray-900 py-6 text-base font-bold text-white hover:bg-black">
            {processingPlanId === retailPlan?.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Value your business now"}
          </Button>
        </div>
        </>}
      </div>
    </section>
  );
}
