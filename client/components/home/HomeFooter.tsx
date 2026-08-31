"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { label: "Get a Valuation", href: "/calculator" },
  { label: "About", href: "/about" },
  { label: "Sample Report", href: "/valuation-sample.pdf" },
  { label: "Contact", href: "/contact" },
  { label: "Certified Valuations", href: "https://executivebusinessvaluers.com.au/#quote" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function HomeFooter() {
  return (
    <footer className="bg-[#0d1117] text-[#98A3B3] py-12 px-6 text-sm">
      <div className="max-w-[1120px] mx-auto flex flex-wrap justify-between items-start gap-8">
        {/* Left: logo + tagline + address */}
        <div>
          <Link href="/" aria-label="Intaleks home" className="inline-block mb-3">
            <Image
              src="/intaleks.png"
              alt="Intaleks"
              width={140}
              height={30}
              className="brightness-0 invert"
            />
          </Link>
          <p className="text-[#3B82F6] font-semibold mt-1 text-sm">
            Know Your Business Value.
          </p>
          <p className="mt-2.5 text-[#98A3B3] leading-relaxed">
            Level 35, 100 Barangaroo Ave, Sydney NSW 2000
            <br />
            (02) 8088 0798
          </p>
        </div>

        {/* Right: nav links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-3 items-start pt-1">
          {footerLinks.map((link) => {
            const isExternal = link.href.startsWith("http");
            return isExternal ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C4CEDC] hover:text-[#3B82F6] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#C4CEDC] hover:text-[#3B82F6] transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom copyright */}
      <div className="max-w-[1120px] mx-auto mt-10 pt-6 border-t border-white/10 text-xs text-[#98A3B3]">
        © 2026 Intaleks. All rights reserved.
      </div>
    </footer>
  );
}
