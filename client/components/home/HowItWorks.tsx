"use client";

import Image from "next/image";

interface Step {
  number: number;
  title: string;
  description: string;
  icon?: string;
}

interface HowItWorksProps {
  steps: Step[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-gray-50/70 border-y border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-2">
            How it works
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Professional business valuation in five simple steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div key={step.number} className="bg-white border border-gray-200 shadow-xs hover:shadow-md rounded-2xl p-5 flex flex-col justify-between min-h-[220px] transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl font-extrabold text-gray-900 font-mono">
                  {String(step.number).padStart(2, "0")}
                </span>
                {step.icon && (
                  <div className="w-12 h-12 shrink-0 relative">
                    <Image src={step.icon} alt={step.title} width={48} height={48} className="object-contain" />
                  </div>
                )}
              </div>
              <div className="mt-auto">
                <h3 className="font-bold text-gray-900 text-sm mb-1.5 leading-snug">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits bar */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs sm:text-sm font-semibold text-gray-700 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="flex items-center gap-1.5 text-emerald-700">✓ No complicated spreadsheets</span>
          <span className="flex items-center gap-1.5 text-emerald-700">✓ No waiting weeks</span>
          <span className="flex items-center gap-1.5 text-emerald-700">✓ No expensive consulting engagements</span>
        </div>
      </div>
    </section>
  );
}
