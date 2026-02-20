"use client";

interface EarningCapacitySectionProps {
  className?: string;
}

export function EarningCapacitySection({ className }: EarningCapacitySectionProps) {
  return (
    <section className={`bg-sky-100 rounded-2xl p-8 md:p-12 relative overflow-hidden ${className || ""}`}>
      {/* Learn Badge */}
      <div className="absolute top-6 left-6">
        <span className="bg-cyan-400 text-white text-xs font-semibold px-3 py-1 rounded">LEARN</span>
      </div>

      {/* Header */}
      <div className="text-center mt-8 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Understanding the True Earning Capacity of Your Business</h2>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-center max-w-4xl mx-auto mb-10 leading-relaxed">Every business tells a story through its financials — but not every line item reflects the ongoing performance a future owner can rely on. Add-backs are adjustments applied to remove noise, normalize earnings, and reveal the business&apos;s genuine, maintainable profit. These adjustments ensure your valuation reflects commercial reality, not historical anomalies or owner-specific decisions.</p>

      {/* Two Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* What Are Add-Backs */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">What Are Add-Backs?</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">Add-backs are non-recurring, discretionary, or non-operational expenses that are removed from the profit and loss statement to present a clearer picture of sustainable earnings.</p>
          <p className="text-gray-700 text-sm leading-relaxed">They help buyers, sellers, and advisors understand what the business truly generates once unusual or personal costs are stripped out.</p>
        </div>

        {/* Why Add-Backs Matter */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Why Add-Backs Matter</h3>
          <ul className="text-gray-700 text-sm leading-relaxed space-y-1">
            <li>They increase transparency and build confidence in the valuation</li>
            <li>They highlight the business&apos;s real earning power</li>
            <li>They remove distortions caused by one-off or owner-specific decisions</li>
            <li>They support stronger negotiations by presenting a defensible, normalised profit figure</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
