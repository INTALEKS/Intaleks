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
    <section className="text-center py-16 px-4 pb-10">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:px-28">{title}</h1>
      <p className="text-gray-600 text-[20px] max-w-xl mx-auto mb-8">{subtitle}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href={ctaHref}>
          <Button className="bg-black hover:bg-gray-800 px-6 py-5 text-base">
            {ctaText}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
        {secondaryCtaText && secondaryCtaHref && (
          <Link href={secondaryCtaHref} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 px-6 py-5 text-base">
              {secondaryCtaText}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
}
