"use client";

import { Button } from "@/components/ui/button";
// import Image from "next/image";

export function ExecutiveBusinessValuers() {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="w-full md:w-[90%] p-6 md:p-8 rounded-md mx-auto bg-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Title */}
          <div className="flex flex-col justify-center items-center lg:text-left">
            {/* <Image src="/Executive-Business-Valuers.png" alt="Executive Business Valuers" width={200} height={200} className="w-full h-auto" /> */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Need a Formal, Certified Business Valuation, contact Executive Business Valuers</h2>
          </div>

          {/* Right Side - Features List */}
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-8">Why Choose Executive Business Valuers</h2>
            {/* Feature 1 - APES 225 */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="shrink-0 w-12 bg-(--primary-border-typing) flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                  <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 bg-(--sky-light-blue) px-2 py-2.5">
                <p className="text-black text-sm">
                  Reports built to comply with <span className="font-semibold">APES 225</span> and accepted by Australian Family Courts
                </p>
              </div>
            </div>

            {/* Feature 2 - Independent expert witness */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="shrink-0 w-12 bg-(--primary-border-typing) flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 11L10 12L12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 bg-(--sky-light-blue) px-2 py-2.5">
                <p className="text-black text-sm">
                  Fully <span className="font-semibold">independent expert witness</span>, with no conflicts of interest
                </p>
              </div>
            </div>

            {/* Feature 3 - Cross-examination */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="shrink-0 w-12 bg-(--primary-border-typing) flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="16" r="1" fill="white" />
                </svg>
              </div>
              <div className="flex-1 bg-(--sky-light-blue) px-2 py-2.5">
                <p className="text-black text-sm">
                  Prepared to <span className="font-semibold">withstand cross-examination</span> — we document assumptions, add-backs, and risk drivers clearly
                </p>
              </div>
            </div>

            {/* Feature 4 - Plain-English */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="shrink-0 w-12 bg-(--primary-border-typing) flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.663 17h4.673M12 3v1M12 21v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1M21 12h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707M16.243 12a4.243 4.243 0 11-8.486 0 4.243 4.243 0 018.486 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 bg-(--sky-light-blue) px-2 py-2.5">
                <p className="text-black text-sm">
                  <span className="font-semibold">Plain-English explanations</span>, both to lawyers and clients; you always understand the &quot;why&quot; behind the numbers
                </p>
              </div>
            </div>

            {/* Feature 5 - Nationwide reach */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="shrink-0 w-12 bg-(--primary-border-typing) flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2C14.501 4.738 16 8.182 16 12C16 15.818 14.501 19.262 12 22C9.499 19.262 8 15.818 8 12C8 8.182 9.499 4.738 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 bg-(--sky-light-blue) px-2 py-2.5">
                <p className="text-black text-sm">
                  <span className="font-semibold">Nationwide reach</span> — we service all states and territories with consistent quality and turnaround
                </p>
              </div>
            </div>

            {/* Request a Quote Button */}
            <div className="flex justify-center lg:justify-start pt-4">
              <a href="https://executivebusinessvaluers.com.au/#quote" target="_blank" rel="noopener noreferrer">
                <Button className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-3 rounded-md text-sm font-medium transition-colors">Request a Quote</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
