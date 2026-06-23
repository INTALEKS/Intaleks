"use client";

interface ValuePoint {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Icon components matching the design
const DecisionsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="20" fill="#E8F4FD" />
    <path d="M16 24L22 30L32 18" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NegotiationsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="14" width="32" height="20" rx="4" fill="#E0E7FF" />
    <circle cx="18" cy="24" r="3" fill="#6366F1" />
    <circle cx="24" cy="24" r="3" fill="#6366F1" />
    <circle cx="30" cy="24" r="3" fill="#6366F1" />
  </svg>
);

const SettlementsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="8" width="28" height="32" rx="2" fill="#FEE2E2" />
    <path d="M16 16H32M16 22H28M16 28H24" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 28L34 32L38 24" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const OpportunitiesIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8L28 20H40L30 28L34 40L24 32L14 40L18 28L8 20H20L24 8Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
  </svg>
);

const ClarityIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="16" fill="#FEE2E2" />
    <text x="24" y="30" textAnchor="middle" fontSize="20" fill="#DC2626" fontWeight="bold">
      ?
    </text>
  </svg>
);

const FutureIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="12" width="28" height="24" rx="2" fill="#DBEAFE" />
    <path d="M16 30L22 22L28 26L36 16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="36" cy="16" r="3" fill="#EF4444" />
  </svg>
);

const valuePoints: ValuePoint[] = [
  {
    icon: <DecisionsIcon />,
    title: "Make clearer, proactive decisions",
    description: "Your business value works like a health check. It shows what's working and flags risks — like leaning too heavily on one customer — before they become expensive problems. Fix issues early instead of being caught out later.",
  },
  {
    icon: <NegotiationsIcon />,
    title: "Stand stronger in negotiations",
    description: "Selling, buying out a partner, talking to the bank, or bringing in an investor — you need facts, not guesses. A proper appraisal gives you confidence and credibility.",
  },
  {
    icon: <SettlementsIcon />,
    title: "Be ready for separation or property settlements",
    description: "In a separation, your business is often one of the biggest assets. Knowing its value early helps you prepare, set realistic expectations, and understand where you stand before things get formal. (For court, you'll need a certified valuation — see Executive Business Valuers below.)",
  },
  {
    icon: <OpportunitiesIcon />,
    title: "Be ready for opportunities",
    description: "Sometimes a chance appears out of nowhere — a buyer, a merger, an investor. When you already know your value, you can move quickly and confidently instead of scrambling for data.",
  },
  {
    icon: <ClarityIcon />,
    title: "Keep score on what you're building",
    description: "Your value is the ultimate scoreboard. It shows whether you're building something genuinely more valuable over time — not just working harder.",
  },
  {
    icon: <FutureIcon />,
    title: "Plan your future",
    description: "Passing the business to family, selling to staff, or retiring in a few years? You need to know your starting point. An appraisal gives you the clarity to plan your exit properly.",
  },
];

export function WhyValuation() {
  return (
    <section className="py-20 px-4">
      <div className="w-full md:w-[90%] p-8 rounded-md mx-auto bg-gray-50">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why You Need to Know What
            <br />
            Your <span className="text-blue-500">Business</span> Is Worth
          </h2>
          <p className="text-gray-600 max-w-4xl mx-auto">Most owners don&apos;t think about what their business is worth until they&apos;re forced to. But knowing your value early — and keeping it current — protects you, sharpens your decisions, and keeps your options open.</p>
        </div>

        {/* Value Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valuePoints.map((point, index) => (
            <div key={index} className="flex flex-col">
              {/* Icon */}
              <div className="w-12 h-12 mb-4">{point.icon}</div>

              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900 mb-2">{point.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
