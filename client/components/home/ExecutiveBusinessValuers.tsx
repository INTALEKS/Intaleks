"use client";

import { Button } from "@/components/ui/button";

export function ExecutiveBusinessValuers() {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="w-full md:w-[90%] p-6 md:p-8 rounded-md mx-auto bg-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Title */}
          <div className="flex flex-col justify-center items-center lg:text-left">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 448 512">
                <path fill="currentColor" d="M160 64c0-8.8 7.2-16 16-16s16 7.2 16 16v136c0 10.3 6.6 19.5 16.4 22.8s20.6-.1 26.8-8.3c3-3.9 7.6-6.4 12.8-6.4c8.8 0 16 7.2 16 16c0 10.3 6.6 19.5 16.4 22.8s20.6-.1 26.8-8.3c3-3.9 7.6-6.4 12.8-6.4c7.8 0 14.3 5.6 15.7 13c1.6 8.2 7.3 15.1 15.1 18s16.7 1.6 23.3-3.6c2.7-2.1 6.1-3.4 9.9-3.4c8.8 0 16 7.2 16 16v120c0 39.8-32.2 72-72 72H211.3c-37.4 0-72.4-18.7-93.2-49.9L50.7 312.9c-4.9-7.4-2.9-17.3 4.4-22.2s17.3-2.9 22.2 4.4l38.7 58.1c5.9 8.8 16.8 12.7 26.9 9.7s17-12.4 17-23V64zm16-64c-35.3 0-64 28.7-64 64v197.7c-20.8-23.7-56.5-28.9-83.5-11c-29.4 19.7-37.4 59.4-17.7 88.8l67.5 101.3C108 485.3 157.9 512 211.4 512h116.7c66.3 0 120-53.7 120-120V272c0-35.3-28.7-64-64-64c-4.5 0-8.8.5-13 1.3c-11.7-15.4-30.2-25.3-51-25.3c-6.9 0-13.5 1.1-19.7 3.1c-11.7-16.4-30.8-27.1-52.4-27.1c-2.7 0-5.4.2-8 .5V64c0-35.3-28.7-64-64-64m48 304c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16zm48-16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96c0-8.8-7.2-16-16-16m80 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16z" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#9B4B5E] leading-tight text-center">
              Why Choose
              <br />
              Executive Business
              <br />
              Valuers
            </h2>
          </div>

          {/* Right Side - Features List */}
          <div className="space-y-3">
            {/* Feature 1 - APES 225 */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="flex-shrink-0 w-12 bg-[#9B4B5E] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                  <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 bg-[#2D3E50] p-4">
                <p className="text-white text-sm">
                  Reports built to comply with <span className="font-semibold">APES 225</span> and accepted by Australian Family Courts
                </p>
              </div>
            </div>

            {/* Feature 2 - Independent expert witness */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="flex-shrink-0 w-12 bg-[#9B4B5E] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 11L10 12L12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 bg-[#2D3E50] p-4">
                <p className="text-white text-sm">
                  Fully <span className="font-semibold">independent expert witness</span>, with no conflicts of interest
                </p>
              </div>
            </div>

            {/* Feature 3 - Cross-examination */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="flex-shrink-0 w-12 bg-[#9B4B5E] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="16" r="1" fill="white" />
                </svg>
              </div>
              <div className="flex-1 bg-[#2D3E50] p-4">
                <p className="text-white text-sm">
                  Prepared to <span className="font-semibold">withstand cross-examination</span> — we document assumptions, add-backs, and risk drivers clearly
                </p>
              </div>
            </div>

            {/* Feature 4 - Plain-English */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="flex-shrink-0 w-12 bg-[#9B4B5E] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.663 17h4.673M12 3v1M12 21v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1M21 12h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707M16.243 12a4.243 4.243 0 11-8.486 0 4.243 4.243 0 018.486 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 bg-[#2D3E50] p-4">
                <p className="text-white text-sm">
                  <span className="font-semibold">Plain-English explanations</span>, both to lawyers and clients; you always understand the &quot;why&quot; behind the numbers
                </p>
              </div>
            </div>

            {/* Feature 5 - Nationwide reach */}
            <div className="flex overflow-hidden rounded-lg">
              <div className="flex-shrink-0 w-12 bg-[#9B4B5E] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2C14.501 4.738 16 8.182 16 12C16 15.818 14.501 19.262 12 22C9.499 19.262 8 15.818 8 12C8 8.182 9.499 4.738 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 bg-[#2D3E50] p-4">
                <p className="text-white text-sm">
                  <span className="font-semibold">Nationwide reach</span> — we service all states and territories with consistent quality and turnaround
                </p>
              </div>
            </div>

            {/* Request a Quote Button */}
            <div className="flex justify-center lg:justify-start pt-4">
              <a href="https://executivebusinessvaluers.com.au/#quote" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#9B4B5E] hover:bg-[#7D3D4D] text-white px-8 py-3 rounded-md text-sm font-medium transition-colors">Request a Quote</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
