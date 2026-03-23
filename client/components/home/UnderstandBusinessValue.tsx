"use client";

// import Image from "next/image";

export function UnderstandBusinessValue() {
  return (
    <section id="understand-value" className=" pb-10 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-4 items-center">
          {/* Left Content */}
          <div className="bg-cyan-100 rounded-lg p-8 md:p-6 col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Understand Your Business Value in <span className="text-blue-500">Minutes</span>
            </h2>
            <p className="text-black mb-3 leading-relaxed">Running a small or medium business comes with big decisions. How much is your business really worth? Whether you&apos;re thinking about selling, bringing in a partner, preparing for the future, or dealing with disputes or litigation, knowing your business&apos;s value is essential.</p>
            <p className="text-black leading-relaxed">Intaleks makes it simple. Our intuitive platform allows you to enter a few basic details and instantly receive a clear, reliable indication of your business&apos;s worth without complex formulas or guesswork.</p>
          </div>

          {/* Right Image */}
          {/* <div className="relative h-36 md:h-full rounded-lg overflow-hidden">
            <Image src="/UnderstandBusinessValue.png" alt="Business owners discussing valuation" fill className="object-cover" />
          </div> */}
        </div>
      </div>
    </section>
  );
}
