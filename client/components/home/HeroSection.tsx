"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function HeroSection({ title, subtitle, ctaText, ctaHref, secondaryCtaText, secondaryCtaHref }: HeroSectionProps) {
  return (
    <section className="text-center pt-12 pb-10 px-4 max-w-5xl mx-auto">
      <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-blue-200">
        Business Valuation, Made Simple
      </div>
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight max-w-4xl mx-auto">
        {title}
      </h1>
      <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
        {subtitle}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
        <Link href={ctaHref}>
          <Button className="bg-gray-900 hover:bg-black text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
            {ctaText}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </Link>
        {secondaryCtaText && secondaryCtaHref && (
          <Link href={secondaryCtaHref} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-gray-300 text-gray-800 hover:bg-gray-50 px-6 py-6 text-base font-medium rounded-xl">
              {secondaryCtaText}
            </Button>
          </Link>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium">
        <span className="font-bold text-gray-900">$495 AUD once</span> for one business valuation. Corrections to that valuation are included; purchase again for another valuation.
      </p>
    </section>
  );
}
