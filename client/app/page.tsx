"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar, HeroSection, TrustedCompanies, HowItWorks, WhyValuation, StatsSection, WhySmallBusinessesLoveUs, UnderstandBusinessValue, PricingSection, FAQSection, AboutFounder, CountriesWeService, BusinessValuationFeatures, Footer, ExecutiveBusinessValuers } from "@/components/home";
import { OrganizationJsonLd, WebApplicationJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useCreateCheckout } from "@/app/hooks/usePayments";
import { ApiClient } from "@/app/services/api";
import Image from "next/image";

// Handle scroll to section when navigating from another page
function ScrollToSectionHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const scrollTo = searchParams.get("scrollTo");
    if (scrollTo) {
      // Retry finding the element since sections may load async
      const scrollToSection = () => {
        const section = document.getElementById(scrollTo);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
          // Clear the URL parameter after scrolling
          const url = new URL(window.location.href);
          url.searchParams.delete("scrollTo");
          window.history.replaceState({}, "", url.toString());
          return true;
        }
        return false;
      };

      // Try immediately, then retry a few times
      if (!scrollToSection()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (scrollToSection() || attempts >= 10) {
            clearInterval(interval);
          }
        }, 200);
      }
    }
  }, [searchParams]);

  return null;
}

const howItWorksSteps = [
  {
    number: 1,
    title: "Company Details",
    description: "Enter your company name and choose your country and industry to get started.",
    icon: "/details.png",
  },
  {
    number: 2,
    title: "Business Questionnaire",
    description: "Answer 10 straightforward questions about your business and how it runs.",
    icon: "/questionaire.png",
  },
  {
    number: 3,
    title: "Method Selection",
    description: "Pick an appraisal method — Asset, Profit, or DCF. Not sure which? We'll guide you.",
    icon: "/block.png",
  },
  {
    number: 4,
    title: "Financial Data",
    description: "Securely add your key financial figures. We tell you exactly what's needed.",
    icon: "/financial-data.png",
  },
  {
    number: 5,
    title: "Instant Report",
    description: "Generate and download your full appraisal straight away.",
    icon: "/download-valuation.png",
  },
];

const stats = [
  {
    value: "$12M+",
    label: "Investment obtained",
    description: "Capital raised by businesses using our appraisals to support growth and strategy",
    bgColor: "gray" as const,
  },
  {
    value: "87%",
    label: "Investor Confidence Confirmed",
    description: "Of users say their report gave them the confidence to act",
    bgColor: "lightBlue" as const,
  },
  {
    value: "450+",
    label: "Firms accurately valued",
    description: "Businesses appraised using structured, data-driven methods",
    bgColor: "cyan" as const,
  },
];

/**
 * Component that handles subscribe query parameter for users returning from login
 * and redirects new users (authenticated but no subscription) to checkout
 * Wrapped in Suspense because it uses useSearchParams
 */
function SubscribeHandler({ onSkippedCheckout }: { onSkippedCheckout: (show: boolean) => void }) {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isAuthentiating, subscriptionStatus, hasActiveSubscription } = useAuthState();
  const createCheckout = useCreateCheckout();

  // Set sessionStorage if canceled=true
  useEffect(() => {
    const canceledParam = searchParams.get("canceled");
    if (canceledParam === "true") {
      sessionStorage.setItem("skippedCheckout", "true");
      onSkippedCheckout(true);
    }
  }, [searchParams, onSkippedCheckout]);

  // Handle subscribe query parameter for users returning from login (Requirement: 8.3)
  useEffect(() => {
    const subscribeParam = searchParams.get("subscribe");

    // Only trigger checkout if user is authenticated and has a subscribe param
    if (subscribeParam && isAuthenticated && !isAuthentiating && !createCheckout.isPending) {
      // Clear the URL parameter to prevent re-triggering
      const url = new URL(window.location.href);
      url.searchParams.delete("subscribe");
      window.history.replaceState({}, "", url.toString());

      // Initiate checkout for the plan
      createCheckout.mutate({
        planId: subscribeParam,
        successUrl: `${window.location.origin}/?success=true`,
        cancelUrl: `${window.location.origin}/?canceled=true`,
      });
    }
  }, [searchParams, isAuthenticated, isAuthentiating, createCheckout]);

  // Redirect new users (authenticated but no subscription) to checkout
  useEffect(() => {
    const successParam = searchParams.get("success");
    const canceledParam = searchParams.get("canceled");
    const subscribeParam = searchParams.get("subscribe");

    // Check sessionStorage
    const isSkipped = typeof window !== "undefined" && sessionStorage.getItem("skippedCheckout") === "true";

    // Bypass check:
    // - User is still authenticating
    // - User has active subscription
    // - User just came back from checkout (success or canceled)
    // - User has subscribe param (handled above)
    // - Checkout is already in progress
    // - User is an Admin, Super Admin, or has an Affiliate Profile
    // - User already skipped checkout in the current session
    const isAffiliate = user && (user.affiliateProfile || user.role === "ADMIN" || user.role === "SUPER_ADMIN");

    if (isAuthentiating || hasActiveSubscription || successParam || canceledParam || subscribeParam || createCheckout.isPending || isSkipped || isAffiliate) {
      // If user is not an affiliate, but skipped or canceled, ensure we show the banner
      if (!isAffiliate && (isSkipped || canceledParam)) {
        onSkippedCheckout(true);
      }
      return;
    }

    // Redirect new users (authenticated with no subscription) to checkout
    if (isAuthenticated && subscriptionStatus === "NONE") {
      // Fetch plans and trigger checkout for the first paid plan
      ApiClient.getPublicPlans()
        .then((response) => {
          const paidPlan = response.data.find((plan) => plan.price > 0);
          if (paidPlan) {
            createCheckout.mutate({
              planId: paidPlan.id,
              successUrl: `${window.location.origin}/?success=true`,
              cancelUrl: `${window.location.origin}/?canceled=true`,
            });
          }
        })
        .catch((error) => {
          console.error("Failed to fetch plans:", error);
        });
    }
  }, [isAuthenticated, isAuthentiating, subscriptionStatus, hasActiveSubscription, searchParams, createCheckout, user, onSkippedCheckout]);

  return null;
}

export default function Home() {
  const [showCheckoutBanner, setShowCheckoutBanner] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("skippedCheckout") === "true";
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-white">
      {showCheckoutBanner && (
        <div className="bg-blue-600 text-white py-3 px-4 text-center font-medium text-sm flex flex-wrap items-center justify-center gap-x-2 gap-y-1 relative z-50 animate-in fade-in slide-in-from-top duration-300">
          <span>✨ Complete your subscription to unlock the Business Valuation Calculators.</span>
          <button
            onClick={() => {
              ApiClient.getPublicPlans()
                .then((response) => {
                  const paidPlan = response.data.find((plan) => plan.price > 0);
                  if (paidPlan) {
                    window.location.href = `/?subscribe=${paidPlan.id}`;
                  }
                })
                .catch((error) => {
                  console.error("Failed to fetch plans:", error);
                });
            }}
            className="underline hover:text-blue-100 font-bold transition duration-200"
          >
            Proceed to Secure Checkout &rarr;
          </button>
        </div>
      )}
      <OrganizationJsonLd />
      <WebApplicationJsonLd />
      <FAQJsonLd />

      {/* Handle subscribe query parameter - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <SubscribeHandler onSkippedCheckout={setShowCheckoutBanner} />
      </Suspense>

      {/* Handle scroll to section - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <ScrollToSectionHandler />
      </Suspense>

      <Navbar />

      <div className="bg-linear-to-b from-white/60 to-(--sky-light-blue)">
        <HeroSection
          title={
            <>
              Find Out What <span className="text-blue-500 italic">Your Business</span> Is Worth <br /> in Minutes
            </>
          }
          subtitle="No spreadsheets. No jargon. No accountant needed. Answer a few simple questions and get a clear, reliable appraisal you can actually understand."
          ctaText="See What My Business Is Worth"
          ctaHref="/calculator"
          secondaryCtaText="View Valuation Sample"
          secondaryCtaHref="/valuation-sample.pdf"
        />

        <section className="pb-16 md:py-0 px-4">
          <div className="max-w-3xl mx-auto relative w-full h-[200px] md:h-[500px]">
            <Image src="/intaleks.gif" alt="Intaleks" fill className="object-contain" unoptimized priority />
          </div>
        </section>
      </div>

      <BusinessValuationFeatures />

      <HowItWorks steps={howItWorksSteps} />

      <WhyValuation />

      <StatsSection
        title={
          <>
            We know you love <span className="italic text-blue-600">STATS</span>
          </>
        }
        stats={stats}
      />

      {/* <FoundersSay /> */}

      <WhySmallBusinessesLoveUs />

      <UnderstandBusinessValue />

      <PricingSection />

      <FAQSection />

      <AboutFounder />

      {/* <Newsletter /> */}
      <ExecutiveBusinessValuers />

      <Footer />
    </div>
  );
}
