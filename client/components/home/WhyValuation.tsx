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
    description: "Understanding your business value acts as a health check. It helps you see what's working and highlights risks like relying too much on one customer before they become costly problems. You can fix issues early instead of being surprised later.",
  },
  {
    icon: <NegotiationsIcon />,
    title: "Stand stronger in negotiations",
    description: "If you ever sell your business, buy out a partner, talk to the bank, or bring in an investor, you need facts not guesses. A proper valuation gives you confidence and credibility.",
  },
  {
    icon: <SettlementsIcon />,
    title: "Essential for divorce and property settlements",
    description: "In a separation, your business is often one of the biggest assets. A professional valuation prevents arguments, protects you from unrealistic claims, and gives courts clear evidence, ensuring the business and your staff aren't put at risk.",
  },
  {
    icon: <OpportunitiesIcon />,
    title: "Be ready for opportunities",
    description: "Sometimes opportunities appear out of nowhere, someone wants to buy your business, merge, or invest. When you already know your value, you can act quickly and confidently without scrambling for data.",
  },
  {
    icon: <ClarityIcon />,
    title: "Ask questions and get clarity",
    description: "Your business value is the ultimate scoreboard. It shows whether you're actually building something more valuable over time, not just working harder.",
  },
  {
    icon: <FutureIcon />,
    title: "Plan your future",
    description: "Whether you want to pass the business to family, sell to staff, or retire in a few years, you need to know your starting point. A valuation gives you the clarity to plan your exit strategy properly.",
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
          <p className="text-gray-600 max-w-4xl mx-auto">Most business owners don&apos;t think about valuation until they&apos;re forced to. But knowing the value of your business early and keeping it updated protects you, strengthens your decisions, and gives you options.</p>
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
