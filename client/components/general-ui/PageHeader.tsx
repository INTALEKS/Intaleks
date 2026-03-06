"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useCreateCheckout } from "@/app/hooks/usePayments";
import { ApiClient, type SubscriptionPlan } from "@/app/services/api";
import { isAdminOrHigher } from "@/lib/role-utils";

interface PageHeaderProps {
  /** Main title with optional highlighted word */
  title: React.ReactNode;
  /** Subtitle/description text */
  subtitle: string;
  /** Primary CTA button text */
  ctaText: string;
  /** Primary CTA link (for subscribed users) */
  ctaHref?: string;
  /** Primary CTA click handler (alternative to href) */
  onCtaClick?: () => void;
  /** Alternative CTA text for non-subscribed users */
  altCtaText?: string;
  /** Alternative CTA link for non-subscribed users */
  altCtaHref?: string;
}

export function PageHeader({ title, subtitle, ctaText, ctaHref, onCtaClick, altCtaText, altCtaHref = "/#pricing" }: PageHeaderProps) {
  const { isAuthenticated, hasActiveSubscription, isAuthentiating, user } = useAuthState();
  const createCheckout = useCreateCheckout();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Admins (including SUPER_ADMIN) or subscribed users can access content
  const canAccess = isAdminOrHigher(user?.role) || hasActiveSubscription;

  // Fetch plans when component mounts
  useEffect(() => {
    async function fetchPlans() {
      setIsLoadingPlans(true);
      try {
        const response = await ApiClient.getPublicPlans();
        if (response.success) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  // Determine which CTA to show
  const showSubscribeCta = !isAuthentiating && (!isAuthenticated || !canAccess);
  const buttonText = showSubscribeCta && altCtaText ? altCtaText : ctaText;

  // Handle button click for authenticated users without subscription
  const handleSubscribeClick = () => {
    // Find the first paid plan (non-free plan)
    const paidPlan = plans.find((plan) => plan.price > 0);

    if (paidPlan) {
      createCheckout.mutate({
        planId: paidPlan.id,
        successUrl: `${window.location.origin}${window.location.pathname}?success=true`,
        cancelUrl: `${window.location.origin}${window.location.pathname}`,
      });
    }
  };

  // Determine button behavior
  const isAuthenticatedNoSubscription = isAuthenticated && !canAccess;
  const shouldTriggerCheckout = showSubscribeCta && isAuthenticatedNoSubscription;
  const isProcessing = createCheckout.isPending || isLoadingPlans;

  // If user is not authenticated, send them to signup. If authenticated but no subscription, send to pricing
  const buttonHref = showSubscribeCta ? (!isAuthenticated ? "/signup" : altCtaHref) : ctaHref;

  return (
    <section className="text-center py-16 px-4 bg-linear-to-b from-blue-50/80 via-blue-50/30 to-white">
      <h1 className="text-5xl font-medium md:text-5xl text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 max-w-2xl mx-auto mb-8">{subtitle}</p>
      {shouldTriggerCheckout ? (
        <Button className="bg-black hover:bg-gray-800 px-8 py-6 text-base" onClick={handleSubscribeClick} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            buttonText
          )}
        </Button>
      ) : showSubscribeCta && !isAuthenticated ? (
        <Link href="/signup">
          <Button className="bg-black hover:bg-gray-800 px-8 py-6 text-base">{buttonText}</Button>
        </Link>
      ) : ctaHref ? (
        <Link href={ctaHref}>
          <Button className="bg-black hover:bg-gray-800 px-8 py-6 text-base">{buttonText}</Button>
        </Link>
      ) : (
        <Button className="bg-black hover:bg-gray-800 px-8 py-6 text-base" onClick={onCtaClick}>
          {buttonText}
        </Button>
      )}
    </section>
  );
}
