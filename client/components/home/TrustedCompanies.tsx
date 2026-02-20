"use client";

import Image from "next/image";

interface Company {
  name: string;
  logo: string;
}

const companies: Company[] = [
  { name: "Company 1", logo: "/logo_01.png" },
  { name: "Company 2", logo: "/logo_02.png" },
  { name: "Company 3", logo: "/logo_03.png" },
  { name: "Company 4", logo: "/logo_04.png" },
  { name: "Company 5", logo: "/logo_05.png" },
  { name: "Company 6", logo: "/logo_06.png" },
  { name: "Company 7", logo: "/logo_07.png" },
  { name: "Company 8", logo: "/logo_08.png" },
  { name: "Company 9", logo: "/logo_09.png" },
  { name: "Company 10", logo: "/logo_10.png" },
  { name: "Company 11", logo: "/logo_11.png" },
  { name: "Company 12", logo: "/logo_12.png" },
  { name: "Company 13", logo: "/logo_13.png" },
  { name: "Company 14", logo: "/logo_14.png" },
  { name: "Company 15", logo: "/logo_15.png" },
  { name: "Company 16", logo: "/logo_16.png" },
];

export function TrustedCompanies() {
  return (
    <section className="py-12 text-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Trusted by businesses all over the world</h2>
      </div>

      {/* Infinite scroll container */}
      <div className="relative w-full">
        {/* Gradient masks for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex animate-marquee hover:paused">
          {/* First set of logos */}
          {companies.map((company, i) => (
            <div key={`first-${i}`} className="shrink-0 mx-2 px-3 py-3 rounded-lg flex items-center justify-center min-w-[120px] h-16">
              <Image src={company.logo} alt={company.name} width={100} height={50} className="object-contain" />
            </div>
          ))}

          {/* Duplicate set for seamless loop */}
          {companies.map((company, i) => (
            <div key={`second-${i}`} className="shrink-0 mx-2 px-3 py-3 rounded-lg flex items-center justify-center min-w-[120px] h-16">
              <Image src={company.logo} alt={company.name} width={100} height={50} className="object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
