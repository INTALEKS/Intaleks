"use client";

import { CheckCircle } from "lucide-react";

export function UnderstandBusinessValue() {
  const equityBenefits = [
    "Greater wealth",
    "Better exit opportunities",
    "More investor interest",
    "Increased financial security",
    "More options for the future",
  ];

  return (
    <section id="equity-focus" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <span className="text-blue-300 text-xs font-bold uppercase tracking-wider block mb-2">
            Focus on building equity
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-4">
            The most successful owners know their business value
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-8">
            Most owners focus on working in their business. Successful owners focus on increasing the value of it. A more valuable business creates:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {equityBenefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-white">{benefit}</span>
              </div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-blue-200 font-medium italic">
            Understanding your current value is the first step towards improving it.
          </p>
        </div>
      </div>
    </section>
  );
}
