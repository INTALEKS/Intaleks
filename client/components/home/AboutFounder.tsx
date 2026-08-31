"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutFounder() {
  return (
    <section id="about" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="bg-gray-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-center relative z-10">
          {/* Founder Photo */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-xl mb-4">
              <Image src="/founder.png" alt="Aleks Todorovic" fill className="object-cover" />
            </div>
            <h3 className="text-xl font-bold text-white">Aleks Todorovic</h3>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mt-1">
              Founder, Intaleks &amp; Executive Business Valuers
            </p>
          </div>

          {/* Quote & Bio */}
          <div className="lg:col-span-2 space-y-6">
            <Quote className="w-10 h-10 text-blue-500 opacity-60" />
            <blockquote className="text-lg sm:text-2xl font-medium leading-relaxed italic text-gray-100">
              "I've spent 25+ years valuing businesses, and I've seen how hard it is for owners to get clear, honest guidance on what their business is worth. I built Intaleks so any business owner can get a professional-grade appraisal without the cost, complexity or delay."
            </blockquote>

            <p className="text-sm text-gray-300 leading-relaxed">
              Through Executive Business Valuers, Aleks has delivered business valuations across Australia for complex commercial, strategic, and legal matters. Intaleks brings that valuation framework directly to Australian business owners in a fast, accessible format.
            </p>

            <div className="pt-2">
              <Link href="/calculator">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 text-sm font-bold rounded-xl shadow-lg">
                  Get My Business Valuation Today
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
