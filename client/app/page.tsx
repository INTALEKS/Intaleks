"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar, HeroSection, TrustedCompanies, HowItWorks, WhyValuation, StatsSection, FoundersSay, WhySmallBusinessesLoveUs, UnderstandBusinessValue, PricingSection, FAQSection, AboutFounder, Newsletter, Footer } from "@/components/home";
import { OrganizationJsonLd, WebApplicationJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useCreateCheckout } from "@/app/hooks/usePayments";
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
    description: "Enter your company name, select your country and industry to get started.",
    icon: "/questionnaire.png",
  },
  {
    number: 2,
    title: "Business Questionnaire",
    description: "Answer 10 key questions about your business quality and operations.",
    icon: "/questionnaire.png",
  },
  {
    number: 3,
    title: "Method Selection",
    description: "Choose from multiple valuation methods (Asset method, Profit method, DCF method)",
    icon: "/financial-data.png",
  },
  {
    number: 4,
    title: "Financial Data",
    description: "Securely input your key financial metrics, depending on your valuation method",
    icon: "/financial-data.png",
  },
  {
    number: 5,
    title: "Instant Report",
    description: "Generate and download your comprehensive valuation document immediately.",
    icon: "/download-valuation.png",
  },
];

const stats = [
  {
    value: "$100M",
    label: "Investment obtained",
    description: "Capital successfully raised to support business growth and strategic execution",
    bgColor: "gray" as const,
  },
  {
    value: "87%",
    label: "Investor Confidence Confirmed",
    description: "Companies professionally assessed using structured, data-driven valuation models aligned with market realities.",
    bgColor: "lightBlue" as const,
  },
  {
    value: "7000",
    label: "Firms accurately valued",
    description: "Strong investor trust established through transparent valuations, credible assumptions, and consistently positive investor feedback",
    bgColor: "cyan" as const,
  },
];

/**
 * Component that handles subscribe query parameter for users returning from login
 * Wrapped in Suspense because it uses useSearchParams
 */
function SubscribeHandler() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isAuthentiating } = useAuthState();
  const createCheckout = useCreateCheckout();

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

  return null;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <OrganizationJsonLd />
      <WebApplicationJsonLd />
      <FAQJsonLd />

      {/* Handle subscribe query parameter - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <SubscribeHandler />
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
              Business <span className="text-blue-500 italic">valuation</span> in a few clicks 🎯
            </>
          }
          subtitle="Find out how much your business is worth, make informed decisions"
          ctaText="Access Calculator"
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

      <TrustedCompanies />

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

      <FoundersSay />

      <WhySmallBusinessesLoveUs />

      <UnderstandBusinessValue />

      <PricingSection />

      <FAQSection />

      <AboutFounder />

      <Newsletter />

      <Footer />
    </div>
  );
}
