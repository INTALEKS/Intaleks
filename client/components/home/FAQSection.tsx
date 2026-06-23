"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What does Intaleks do?",
    answer: "Intaleks helps business owners find out what their business is worth — quickly, clearly, and affordably. It's built for people without a finance background who need a reliable appraisal for selling, buying, raising money, or planning ahead.",
  },
  {
    question: "How do you work out my business's value?",
    answer: "We use proven appraisal methods — Asset, Profit, and DCF — combined with industry benchmarks and local market data. You answer a few simple questions and enter your key figures; Intaleks does the calculations for you.",
  },
  {
    question: "What information do I need to provide?",
    answer: "Just a few basics: your company details and a handful of financial figures. We tell you exactly what's needed at each step, in plain English.",
  },
  {
    question: "Do you work with early-stage startups?",
    answer: "Yes. Intaleks suits businesses at every stage, from early startups to established companies. The methods adapt to the data you have available.",
  },
  {
    question: "Is my business information kept confidential?",
    answer: "Absolutely. We take data security and confidentiality seriously. Everything you share is protected and used only to produce your appraisal.",
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
        {/* Certified valuation referral banner */}
        {/* <div className="mb-10 text-center">
          <p className="text-base md:text-lg text-gray-700">
            Need a formal certified valuation, visit{" "}
            <a href="https://www.executivebusinessvaluers.com.au/#intaleks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
              www.executivebusinessvaluers.com.au
            </a>
            .
          </p>
          <a href="https://www.executivebusinessvaluers.com.au/#intaleks" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Request a Quote
          </a>
        </div> */}

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
