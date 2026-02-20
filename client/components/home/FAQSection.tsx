"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What does TheBizEvaluer do?",
    answer: "TheBizEvaluer provides professional business valuation services to help founders, investors, and companies understand the true worth of their businesses for fundraising, strategic decisions, and planning.",
  },
  {
    question: "How do you determine a company's value?",
    answer: "We use a combination of financial analysis, market benchmarks, growth potential, and industry-specific assumptions to produce accurate, defensible valuations aligned with investor expectations.",
  },
  {
    question: "What information do you need from us?",
    answer: "We typically require basic financial records, business details, and growth projections. Our team guides you through the process to keep it simple and efficient.",
  },
  {
    question: "Do you work with early-stage startups?",
    answer: "Yes, this valuation tool can help companies at all stages, from early-stage startups to established businesses. The valuation methods are adapted to suit the specific needs and data availability of each company.",
  },
  {
    question: "Is our business information kept confidential?",
    answer: "Absolutely. We take data security and confidentiality very seriously. All information shared with us is protected and used solely for the purpose of your valuation.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>

        <div className="bg-[#F7F7F7] rounded-xl p-4">
          {faqs.map((faq, index) => (
            <div key={index} className={`bg-(--hover-bg) rounded-md px-3 ${index !== faqs.length - 1 ? "mb-4" : ""}`}>
              <button className="w-full py-4 flex items-center justify-between text-left" onClick={() => toggleFAQ(index)} aria-expanded={openIndex === index}>
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openIndex === index ? <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-40 pb-4" : "max-h-0"}`}>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
