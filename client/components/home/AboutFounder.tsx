"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutFounder() {
  return (
    <section id="about" className="py-6 px-4">
      <div className="w-full md:w-[90%] p-6 md:p-8 bg-(--sky-light-blue) rounded-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/intaleks.png" alt="Intaleks" width={120} height={30} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-12">
          {/* Left Column - Title and Image */}
          <div className="w-full md:w-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              What you should
              <br />
              know about us
            </h2>

            {/* Founder Image */}
            <div className="relative">
              <div className="w-full h-80 relative overflow-hidden rounded-lg bg-white" style={{ boxShadow: "inset 0 60px 60px -10px #c0dfff" }}>
                <Image src="/founder.png" alt="Aleks Todorovic" fill className="object-cover" />
              </div>
              <div className="mt-4">
                <p className="font-semibold text-gray-900">Aleks Todorovic</p>
                <p className="text-gray-600 text-sm font-medium">Founder</p>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="flex flex-col justify-center space-y-6 col-span-2">
            <p className="text-gray-700 leading-relaxed">I&apos;m Aleks Todorovic, an accountant and business valuation specialist with more than 25 years of experience across corporate finance, commercial advisory, and professional valuation work. Through my firm, Executive Business Valuers, I&apos;ve supported business owners, legal professionals, and advisors with valuations for complex commercial, strategic, and legal matters.</p>

            <p className="text-gray-700 leading-relaxed">Throughout my career, I&apos;ve seen how difficult it is for small business owners to access clear, reliable valuation guidance. Traditional valuations can be costly, time‑consuming, and filled with technical language that makes the process inaccessible to many.</p>

            <p className="text-gray-700 leading-relaxed">I created Intaleks to change that.</p>

            <p className="text-gray-700 leading-relaxed">Intaleks is a high‑quality valuation tool designed to make professional‑grade valuation insights accessible to business owners everywhere. The platform distils proven valuation methodology into a guided, easy‑to‑use experience that requires no financial background. By answering straightforward questions, users receive a clear, commercially grounded valuation they can rely on.</p>

            <p className="text-gray-700 leading-relaxed">My aim is to give every business owner the ability to understand the value of their business — without the barriers of cost, complexity, or delay. Whether preparing for a sale, considering a purchase, planning ahead, or seeking clarity, Intaleks provides a trusted starting point for informed decision‑making.</p>

            <div className="pt-4">
              <Link href="/calculator">
                <Button className="bg-black hover:bg-gray-800 px-6 py-5 text-base">
                  Access Calculator
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
