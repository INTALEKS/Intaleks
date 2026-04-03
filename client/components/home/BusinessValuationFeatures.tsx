import Image from "next/image";

const cards = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="12" height="16" rx="2" fill="#DBEAFE" />
        <path d="M6 9h6M6 12h5M6 15h3" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 14l2 2 4-4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Selling",
    description: "Know your number before you negotiate. Walk into any sale with a defensible, data-backed valuation so you never leave money on the table.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L14.5 9H21L15.5 13L17.5 19L12 15.5L6.5 19L8.5 13L3 9H9.5L12 3Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    title: "Buying",
    description: "Avoid overpaying for a business. Get an independent view of what a target is actually worth before you commit to a deal.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="9" width="18" height="12" rx="2" fill="#DBEAFE" />
        <path d="M8 9V7a4 4 0 018 0v2" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="15" r="2" fill="#3B82F6" />
      </svg>
    ),
    title: "Raising Capital",
    description: "Investors expect credible numbers. A clear valuation builds trust, supports your pitch, and gives investors the confidence to commit.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#EDE9FE" />
        <path d="M8 12h8M12 8v8" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Planning Your Next Move",
    description: "Whether you're planning an exit, bringing in a partner, or passing the business on — knowing your value is the starting point for every major decision.",
  },
];

export function BusinessValuationFeatures() {
  return (
    <>
      {/* Know Your Business Valuation — Instantly */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Know Your <span className="text-blue-500 italic">Business valuation</span> — Instantly
          </h2>
          <p className="text-gray-600 mb-6">With just five key numbers, instantly understand what your business is worth.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-gray-700">
              <span className="text-blue-500 font-bold">✓</span> No spreadsheets
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="text-gray-400 font-bold">✓</span> No complex formulas
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="text-gray-400 font-bold">✓</span> No financial jargon
            </span>
          </div>
        </div>

        {/* Simple Business Valuation card */}
        <div className="max-w-4xl mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col md:flex-row gap-8 text-left">
          {/* Left */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Simple Business Valuation
              <br />
              That Works
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Intaleks is built for business owners, not analysts.
              <br />
              Get fast, reliable insights without unnecessary complexity.
            </p>
            <ul className="space-y-3">
              {[
                { bold: "You enter the numbers —", rest: " Intaleks does the work" },
                { bold: "Clear valuation insights", rest: " you can understand immediately" },
                { bold: "Make confident", rest: " business decisions" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <strong>{item.bold}</strong>
                    {item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — illustration */}
          <div className="flex-1 flex items-center justify-center min-h-[240px]">
            <Image src="/business_report.svg" alt="Business valuation report" width={400} height={300} className="w-full max-w-sm" />
          </div>
        </div>
      </section>

      {/* Never undersell or overpay */}
      <section className="py-20 px-4  bg-linear-to-b from-blue-50 to-cyan-50">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Never undersell or overpay again</h2>
            <p className="text-gray-600 text-sm max-w-xl mx-auto">When your valuation is clear, every decision becomes easier — whether you&apos;re buying, selling, or planning ahead.</p>
          </div>

          {/* Illustration placeholder */}
          <div className="flex justify-center mb-10">
            <Image src="/handshake.svg" alt="..." width={320} height={220} />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">{card.icon}</div>
                <p className="font-semibold text-gray-900 text-sm">{card.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href="/calculator" className="px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 text-sm font-semibold rounded-lg transition-colors shadow-sm">
              Access Calculator
            </a>
            <a href="/valuation-sample.pdf" className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg border border-blue-400 transition-colors flex items-center gap-1">
              View Valuation Sample <span>›</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
