"use client";

import Link from "next/link";
import { ChevronRight, Wrench, Building2, UtensilsCrossed, Briefcase, Truck, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

const industryCards = [
  {
    icon: <Wrench className="w-6 h-6 text-blue-600" />,
    title: "Trades & Construction",
    subtitle: "Plumbing, electrical, building, HVAC, landscaping, roofing",
    cta: "What's my trade business worth →",
  },
  {
    icon: <Building2 className="w-6 h-6 text-blue-600" />,
    title: "Real Estate Agencies",
    subtitle: "Rent roll, sales performance, team and brand strength",
    cta: "What's my agency worth →",
  },
  {
    icon: <UtensilsCrossed className="w-6 h-6 text-blue-600" />,
    title: "Hospitality & Retail",
    subtitle: "Cafés, restaurants, bars, salons and shopfront businesses",
    cta: "What's my venue worth →",
  },
  {
    icon: <Briefcase className="w-6 h-6 text-blue-600" />,
    title: "Professional Services",
    subtitle: "Agencies, consultancies, allied health and advisory firms",
    cta: "What's my practice worth →",
  },
  {
    icon: <Truck className="w-6 h-6 text-blue-600" />,
    title: "Transport & Logistics",
    subtitle: "Freight, couriers, earthmoving and equipment-heavy operators",
    cta: "What's my operation worth →",
  },
  {
    icon: <Gavel className="w-6 h-6 text-blue-600" />,
    title: "Family Lawyers",
    subtitle: "Scope the asset pool early — then escalate to a certified report",
    cta: "For legal matters →",
  },
];

export function BusinessValuationFeatures() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto space-y-16">
      {/* Industry Tailored Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-2">
            Built for your industry
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Intaleks helps businesses like yours know their value
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">
            A rent roll doesn't earn like a workshop. A client book doesn't sell like a fleet of vans. We apply the benchmarks and methods that fit your industry — so the valuation reflects how your business actually makes money.
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industryCards.map((card, i) => (
            <div key={i} className="bg-gray-50 hover:bg-blue-50/50 p-6 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-xs">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">{card.subtitle}</p>
              </div>
              <Link href="/calculator" className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                {card.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center bg-gray-100 p-4 rounded-xl text-xs text-gray-600">
          Don't see yours? Intaleks covers businesses across every sector — enter your industry and we'll apply the right benchmarks.
        </div>
      </div>
    </section>
  );
}
