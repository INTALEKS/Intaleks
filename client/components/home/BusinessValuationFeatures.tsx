import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    description: "Know your number before you negotiate. Walk into any sale with a defensible, data-backed appraisal, so you never leave money on the table.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L14.5 9H21L15.5 13L17.5 19L12 15.5L6.5 19L8.5 13L3 9H9.5L12 3Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    title: "Buying",
    description: " Avoid overpaying. Get an independent view of what a business is really worth before you commit.",
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
    description: "Investors expect credible numbers. A clear appraisal builds trust, strengthens your pitch, and gives investors the confidence to commit.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#EDE9FE" />
        <path d="M8 12h8M12 8v8" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Planning Your Next Move",
    description: "Planning an exit, bringing in a partner, or passing the business on? Knowing your value is the starting point for every big decision.",
  },
];

export function BusinessValuationFeatures() {
  return (
    <>
      {/* Know Your Business Valuation — Instantly */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Know What Your <span className="text-blue-500 italic">Business Is Worth</span> — Instantly
          </h2>
          <p className="text-gray-600 mb-6">With just five key numbers, you&apos;ll understand what your business is worth. No finance degree required.</p>
        </div>

        {/* Simple Business Valuation card */}
        <div className="max-w-4xl mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-8 gap-8 text-left">
          {/* Left */}
          <div className="flex gap-x-4">
            <div className="w-14 h-14 min-w-14 flex justify-center items-center bg-(--light-blue)/50 rounded-full">
              {/* prettier-ignore */}
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path d="M0 0h512v512H0z" fill="none" /><path fill="currentColor" d="M124 136H36a20.023 20.023 0 0 0-20 20v320a20.023 20.023 0 0 0 20 20h88a20.023 20.023 0 0 0 20-20V156a20.023 20.023 0 0 0-20-20m-12 328H48V168h64Zm188-224h-88a20.023 20.023 0 0 0-20 20v216a20.023 20.023 0 0 0 20 20h88a20.023 20.023 0 0 0 20-20V260a20.023 20.023 0 0 0-20-20m-12 224h-64V272h64ZM476 16h-88a20.023 20.023 0 0 0-20 20v440a20.023 20.023 0 0 0 20 20h88a20.023 20.023 0 0 0 20-20V36a20.023 20.023 0 0 0-20-20m-12 448h-64V48h64Z" /></svg>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Simple business appraisal that works</h3>
              <p className="text-sm text-gray-600 mb-6">Intaleks is built for business owners, not analysts. Get fast, reliable insights with no spreadsheets, no complicated formulas, and no confusing financial jargon.</p>
            </div>
          </div>

          <div className="flex-1">
            <ul className="grid grid-cols-3 gap-3">
              {[
                { bold: "You enter the numbers —", rest: " Intaleks does the rest" },
                { bold: "Clear results", rest: " you can understand straight away" },
                { bold: "Make confident decisions", rest: " about your business" },
              ].map((item, i) => (
                <li key={i} className="flex flex-col items-center gap-5 text-sm border border-gray-200/70 rounded-sm p-10">
                  <span className="mt-0.5 shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    {/* prettier-ignore */}
                    <svg width="16" height="14" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="text-center">
                    <strong>{item.bold}</strong> <br />
                    {item.rest}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-center gap-x-3 mt-4">
              {/* <Link href="/calculator" className="underline flex items-center gap-x-0.5">
                See What My Business Is Worth
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link> */}

              <Link href="/calculator">
                <Button className="bg-black hover:bg-gray-800 px-6 py-5 text-base">
                  See What My Business Is Worth
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <span>· Just $495</span>
            </div>
          </div>
        </div>
      </section>

      {/* Never undersell or overpay */}
      <section className="py-20 px-4  bg-linear-to-b from-blue-50 to-cyan-50">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Never Undersell or Overpay Again</h2>
            <p className="text-gray-600 max-w-xl mx-auto">When you know your number, every decision gets easier — whether you&apos;re buying, selling, or planning ahead.</p>
          </div>

          {/* Illustration placeholder */}
          {/* <div className="flex justify-center mb-10">
            <Image src="/handshake.svg" alt="..." width={320} height={220} />
          </div> */}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">{card.icon}</div>
                <p className="font-semibold text-gray-900">{card.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
            <Link href="/calculator">
              <Button className="bg-black hover:bg-gray-800 px-6 py-5 text-base">
                See What My Business Is Worth
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/valuation-sample.pdf" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 px-6 py-5 text-base">
                View Valuation Sample
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
