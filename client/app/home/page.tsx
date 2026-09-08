"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/home/Navbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import { SampleReportPreview } from "@/components/home/SampleReportPreview";
import { ApiClient, type SubscriptionPlan } from "@/app/services/api";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useCreateCheckout } from "@/app/hooks/usePayments";

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[1.6px] text-[#3B82F6] mb-3">
      {children}
    </p>
  );
}

function SectionH2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`text-[clamp(28px,3.6vw,40px)] font-bold leading-[1.12] tracking-[-0.02em] ${className}`}
    >
      {children}
    </h2>
  );
}

function Lede({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[#5A6472] mt-3.5 max-w-[62ch] leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

function BtnDark({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-block font-semibold text-base text-white bg-[#0d1117] hover:bg-[#1c2530] rounded-[10px] px-7 py-3.5 transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-[#3B82F6] focus-visible:outline-offset-2 ${className}`}
    >
      {children}
    </Link>
  );
}

function BtnOutline({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-block font-semibold text-base text-[#3B82F6] bg-white border border-[#3B82F6] rounded-[10px] px-7 py-3.5 transition-all hover:bg-[#EAF1FE] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-[#3B82F6] focus-visible:outline-offset-2 ${className}`}
    >
      {children}
    </Link>
  );
}

function TickItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-[11px] mb-2.5 text-[15.5px] font-medium leading-snug">
      <span
        className="flex-none w-5 h-5 mt-0.5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center"
        aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" width="20" height="20" fill="none">
          <path d="M5.5 10.4l3 3 6-6.4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {children}
    </li>
  );
}

/* ─────────────────────────────────────────────
   1. HERO
───────────────────────────────────────────── */

const heroIndustryImages = [
  {
    src: "/industry-trades-construction.jpg",
    alt: "Tradesperson working beside a construction vehicle",
  },
  {
    src: "/industry-real-estate-agencies.webp",
    alt: "Real estate agency storefront",
  },
  {
    src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=70",
    alt: "Restaurant interior for hospitality and retail businesses",
  },
  {
    src: "/industry-professional-services.webp",
    alt: "Professional advisers working together",
  },
  {
    src: "/industry-transport-logistics.jpg",
    alt: "Transport and logistics operation",
  },
  {
    src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=700&q=70",
    alt: "Legal documents for family law matters",
  },
];

function IndustryCollage({
  className = "",
  backdrop = false,
}: {
  className?: string;
  backdrop?: boolean;
}) {
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const collageRef = useRef<HTMLDivElement>(null);

  const orderedImages = heroIndustryImages.map(
    (_, index) => heroIndustryImages[(featuredImageIndex + index) % heroIndustryImages.length]
  );

  useEffect(() => {
    let previousScrollY = window.scrollY;
    let accumulatedScroll = 0;

    const rotateCollage = () => {
      const currentScrollY = window.scrollY;
      const scrollChange = currentScrollY - previousScrollY;
      previousScrollY = currentScrollY;

      const collageBounds = collageRef.current?.getBoundingClientRect();
      const collageIsVisible =
        collageBounds && collageBounds.top < window.innerHeight && collageBounds.bottom > 0;

      if (!collageIsVisible || Math.abs(scrollChange) < 1) return;

      accumulatedScroll += scrollChange;
      if (Math.abs(accumulatedScroll) < 80) return;

      const direction = accumulatedScroll > 0 ? 1 : -1;
      setFeaturedImageIndex((currentIndex) =>
        (currentIndex + direction + heroIndustryImages.length) % heroIndustryImages.length
      );
      accumulatedScroll = 0;
    };

    window.addEventListener("scroll", rotateCollage, { passive: true });
    return () => window.removeEventListener("scroll", rotateCollage);
  }, []);

  return (
    <div
      ref={collageRef}
      className={`hero-industry-collage ${
        backdrop
          ? "absolute inset-0 h-full w-full overflow-hidden bg-[#102947]"
          : "relative aspect-[4/5] max-h-[540px] w-full overflow-hidden rounded-[16px] bg-[#DCEAFE] p-2 shadow-[0_24px_60px_rgba(37,99,235,0.18)]"
      } ${className}`}
      aria-label="A selection of the industries Intaleks supports"
    >
      {orderedImages.map((image, index) => (
        <div
          key={`${featuredImageIndex}-${image.alt}`}
          className={`hero-industry-tile hero-industry-tile-${index + 1} overflow-hidden rounded-[10px] bg-[#C7DDFB] bg-cover bg-center`}
          role="img"
          aria-label={image.alt}
          style={{ backgroundImage: `url('${image.src}')` }}
        />
      ))}

      <style jsx>{`
        .hero-industry-collage {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-template-rows: repeat(12, minmax(0, 1fr));
          gap: 8px;
        }

        .hero-industry-tile {
          animation: hero-industry-swap-in 520ms ease-out both, hero-industry-drift 12s ease-in-out 520ms infinite alternate;
          will-change: transform;
        }

        .hero-industry-tile-1 {
          grid-area: 1 / 1 / 7 / 8;
          animation: hero-industry-swap-in 520ms ease-out both, hero-industry-focus 15s ease-in-out 520ms infinite;
        }

        .hero-industry-tile-2 { grid-area: 1 / 8 / 5 / 13; animation-delay: -3s; }
        .hero-industry-tile-3 { grid-area: 5 / 8 / 9 / 13; animation-delay: -7s; }
        .hero-industry-tile-4 { grid-area: 7 / 1 / 10 / 6; animation-delay: -5s; }
        .hero-industry-tile-5 { grid-area: 9 / 6 / 13 / 13; animation-delay: -10s; }
        .hero-industry-tile-6 { grid-area: 10 / 1 / 13 / 6; animation-delay: -1s; }

        @keyframes hero-industry-swap-in {
          from { opacity: 0.72; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1.015); }
        }

        @keyframes hero-industry-drift {
          from { transform: scale(1.015) translate3d(0, 0, 0); }
          to { transform: scale(1.06) translate3d(0, -5px, 0); }
        }

        @keyframes hero-industry-focus {
          0%, 100% { transform: scale(1.02); }
          50% { transform: scale(1.075) translate3d(2px, -4px, 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-industry-tile { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Hero() {
  return (
    <>
      <section className="w-full overflow-hidden bg-[#102947]" id="top" aria-labelledby="home-hero-heading">
        <div className="grid min-h-[620px] w-full grid-cols-1 lg:grid-cols-[44%_56%]">
          <div className="relative left-1/2 h-[clamp(320px,92vw,430px)] w-screen -translate-x-1/2 overflow-hidden sm:h-[430px] lg:left-auto lg:h-auto lg:min-h-[620px] lg:w-auto lg:translate-x-0">
            <Image
              src="/intaleks-business-valuator.jpg"
              alt="A salon owner representing Australian small business owners"
              fill
              priority
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover object-left"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102947]/30 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#102947]/15" aria-hidden="true" />
          </div>

          <div className="relative isolate flex min-h-[500px] items-center overflow-hidden px-6 py-14 sm:px-10 sm:py-16 lg:min-h-[620px] lg:px-[clamp(3rem,6vw,7rem)]">
            <IndustryCollage backdrop className="-z-20 opacity-65" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,31,55,0.96)_0%,rgba(16,41,71,0.88)_52%,rgba(16,41,71,0.78)_100%)]" aria-hidden="true" />

            <div className="w-full max-w-[760px] text-white">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#9CC4FF] sm:text-sm">
                Professional business valuation
              </p>
              <h1
                id="home-hero-heading"
                className="max-w-[15ch] text-[clamp(40px,6vw,76px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-white"
              >
                You know what your house is worth. What about your <span className="font-serif font-normal italic">business?</span>
              </h1>
              <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-[#D8E5F5] sm:text-lg">
                Get clear, professional-grade guidance on what your business is worth—in minutes, not weeks.
              </p>
              <div className="mt-8 sm:mt-9">
                <Link
                  href="/calculator"
                  className="inline-flex min-h-14 w-full max-w-[360px] items-center justify-center rounded-[10px] bg-[#2F78E6] px-7 py-4 text-center text-base font-bold text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-[#1D66D2] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 sm:w-auto sm:max-w-none sm:px-10 sm:text-lg"
                >
                  Start My Business Valuation
                </Link>
                <p className="mt-4 text-sm font-medium leading-relaxed text-[#D8E5F5] sm:text-base">
                  From $495 AUD <span aria-hidden="true">·</span> one payment <span aria-hidden="true">·</span> includes 2 months access
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E3E8F0] bg-white px-6 py-12 sm:py-14">
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <Eyebrow>Know where you stand</Eyebrow>
            <SectionH2>You&apos;ve spent years building it. You deserve to know what it&apos;s worth.</SectionH2>
            <Lede>
              The early starts, the payroll you covered before your own, the calls nobody else could
              make. All of it went somewhere. One day it becomes a number on a page.
            </Lede>
          </div>
          <div className="rounded-[16px] border border-[#DCE6F5] bg-[#F7FAFF] p-7 sm:p-8">
            <h2 className="text-[22px] font-bold tracking-[-0.02em]">Welcome to Intaleks.</h2>
            <ul className="mt-5 list-none space-y-3 p-0 text-[17px] leading-snug text-[#353C47]">
              <TickItem>More than 10,000 valuations completed</TickItem>
              <TickItem>Professional business valuation</TickItem>
              <TickItem>Benchmarked against your industry</TickItem>
              <TickItem>No spreadsheets or financial models</TickItem>
              <TickItem>Detailed PDF report you can hand to an adviser</TickItem>
              <TickItem>Completed in minutes</TickItem>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────
   2. ASSET / TRACKING
───────────────────────────────────────────── */

function AssetSection() {
  const items = [
    { label: "What your home is worth", known: true },
    { label: "Your superannuation balance", known: true },
    { label: "Your investment portfolio", known: true },
    { label: "Your mortgage position", known: true },
    { label: "What your business is worth", known: false },
  ];

  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <Eyebrow>Your business isn't just a job</Eyebrow>
            <SectionH2>It's one of your most valuable assets</SectionH2>
            <Lede>
              Your business represents years of hard work, sacrifice, risk and investment. It isn't just
              something you work in — it's an asset you're building. And like any asset, understanding its
              value helps you make smarter financial decisions and create more opportunities for the future.
            </Lede>
            <Lede>
              Whether you're growing, buying, selling, raising capital or planning retirement, it all starts
              with understanding your value.
            </Lede>
          </div>

          {/* Tracking card */}
          <div className="rounded-[12px] border border-[#E3E8F0] bg-[#F7F9FC] px-7 py-7">
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[1.4px] text-[#5A6472]">
              What you check every year
            </h3>
            <ul className="m-0 list-none p-0">
              {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                  <li
                    key={item.label}
                    className={`flex items-center justify-between gap-3 py-3 text-[15px] font-medium ${
                      isLast
                        ? "-mx-7 -mb-7 mt-3.5 rounded-b-[12px] bg-[#0d1117] px-7 pb-7 pt-5 text-white"
                        : "border-b border-[#E3E8F0]"
                    }`}
                  >
                    <span className="min-w-0">{item.label}</span>
                    {item.known ? (
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-[#EAF1FE] px-3 py-0.5 text-[13px] font-semibold text-[#3B82F6]">
                        You know
                      </span>
                    ) : (
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-[#2563EB] px-4 py-1 text-[13px] font-semibold text-white">
                        No idea
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex justify-center sm:mt-12">
          <SampleReportPreview className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border border-[#2F78E6] bg-white px-7 py-3 text-center text-base font-semibold text-[#2563EB] transition-colors hover:bg-[#EEF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] sm:w-auto" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. TOO LATE — dark band
───────────────────────────────────────────── */

function TooLateSection() {
  const moments = [
    {
      title: "Buying or selling",
      body: "A price is on the table. Is it fair and reasonable? You've got no way to tell.",
    },
    {
      title: "A partner is leaving",
      body: "Someone has to buy the other out. What's a fair share worth?",
    },
    {
      title: "A relationship ends",
      body: "The business has to be split. Neither side can agree on a figure.",
    },
    {
      title: "Thinking about retiring",
      body: "Is there enough in it to walk away? You've never actually checked.",
    },
  ];

  return (
    <section
      className="relative py-[68px] px-6 text-white"
      style={{
        backgroundColor: "#0d1117",
        backgroundImage:
          "linear-gradient(135deg,rgba(13,17,23,.86),rgba(37,99,235,.72)),url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=70')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-[1120px] mx-auto">
        <Eyebrow>
          <span className="text-[#BFD6FD]">The hard truth</span>
        </Eyebrow>
        <SectionH2 className="text-white max-w-[20ch]">
          One day you'll need this number. It won't be a good day to start looking.
        </SectionH2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6 mb-5">
          {moments.map((m) => (
            <div
              key={m.title}
              className="bg-[#F7F9FC] text-[#0d1117] rounded-[10px] p-5"
            >
              <b className="block text-[15px] uppercase tracking-[1.2px] text-[#3476C6] font-bold mb-2">{m.title}</b>
              <span className="block text-[15px] text-[#53657F] leading-relaxed">{m.body}</span>
            </div>
          ))}
        </div>

        <p className="text-white max-w-[60ch] leading-relaxed font-semibold">
          The owners who do well already know their number. Everyone else finds out under pressure.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. INDUSTRIES
───────────────────────────────────────────── */

const industries = [
  {
    title: "Trades & Construction",
    desc: "Plumbing, electrical, building, HVAC, landscaping, roofing",
    photo: "/industry-trades-construction.jpg",
    photoAlt: "Tradesperson working beside a construction vehicle",
    light: false,
  },
  {
    title: "Real Estate Agencies",
    desc: "Rent roll, sales performance, team and brand strength",
    photo: "/industry-real-estate-agencies.webp",
    photoAlt: "Real estate agency storefront",
    light: false,
  },
  {
    title: "Hospitality & Retail",
    desc: "Cafés, restaurants, bars, salons and shopfront businesses",
    photo:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=70",
    photoAlt: "Restaurant interior",
    light: false,
  },
  {
    title: "Professional Services",
    desc: "Agencies, consultancies, allied health and advisory firms",
    photo: "/industry-professional-services.webp",
    photoAlt: "Professional advisers working together",
    light: false,
  },
  {
    title: "Transport & Logistics",
    desc: "Freight, couriers, earthmoving and equipment-heavy operators",
    photo: "/industry-transport-logistics.jpg",
    photoAlt: "Transport and logistics operation",
    light: false,
  },
  {
    title: "Family Lawyers",
    desc: "Scope the asset pool early — then escalate to a certified, court-ready report",
    photo:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=700&q=70",
    photoAlt: "Legal documents on a desk",
    light: true,
  },
];

function IndustriesSection() {
  return (
    <section className="py-16 px-6" id="industries">
      <div className="max-w-[1120px] mx-auto">
        <SectionH2>Industries we cover</SectionH2>
        <Lede className="mb-8">
          Whatever you&apos;ve built, it has a value. Find yours below.
        </Lede>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {industries.map((ind) => (
            <article
              key={ind.title}
              className="overflow-hidden rounded-[12px] border border-[#E3E8F0] bg-white text-inherit"
            >
              <div
                className="aspect-[16/9] bg-[#EAF1FE] bg-cover bg-center"
                style={{ backgroundImage: `url('${ind.photo}')` }}
                role="img"
                aria-label={ind.photoAlt}
              />
              <div className={`px-6 py-5 ${ind.light ? "bg-[#F7F9FC]" : "bg-white"}`}>
                <h3 className="text-[18px] font-bold mb-1.5">{ind.title}</h3>
                <p className="text-[14.5px] text-[#5A6472]">{ind.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <p className="text-[15px] text-[#5A6472]">
            Don&apos;t see yours? Intaleks covers businesses across every sector — enter your industry and
            we&apos;ll apply the right benchmarks.
          </p>
          <BtnDark href="/calculator">Start your business valuation</BtnDark>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. WHY (3-card tiles)
───────────────────────────────────────────── */

const whyCards = [
  {
    title: "Plain English, start to finish",
    body: "Simple questions in, a number you understand out.",
  },
  {
    title: "Built for Australian businesses",
    body: "Sized against businesses like yours, here at home.",
  },
  {
    title: "Decide when to sell, borrow or grow",
    body: "Know where you stand before the big conversations.",
  },
];

function WhySection() {
  return (
    <section className="border-y border-[#E3E8F0] bg-[#F6F8FC] px-6 py-[76px] sm:py-[96px]">
      <div className="mx-auto max-w-[1120px] rounded-[20px] border border-[#E1E8F4] bg-[#F5F7FB] p-6 shadow-[0_24px_60px_rgba(20,42,75,0.07)] sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:gap-14">
          <div>
            <span className="inline-flex rounded-full bg-[#4267E9] px-4 py-1.5 text-[12px] font-bold text-white shadow-sm">
              Australia&apos;s number 1 valuation tool
            </span>
            <h2 className="mt-5 max-w-[12ch] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.03] tracking-[-0.04em] text-[#14254A]">
              Know what your business is worth
            </h2>
            <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-[#5A6472]">
              Answer a few simple questions. Get a number that puts you in control.
            </p>
            <div className="mt-8 border-y border-[#DCE4F0]">
              {whyCards.map((card, index) => (
                <div key={card.title} className="flex gap-4 py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF1FE] text-[12px] font-bold text-[#2563EB]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#243655]">{card.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#5A6472]">{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] bg-[#142D5A] p-6 text-white shadow-[0_18px_36px_rgba(20,45,90,0.22)] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A9C2F0]">Your business is worth about</p>
            <div className="mt-1 text-[clamp(36px,5vw,58px)] font-extrabold tracking-[-0.045em]">$1,240,000</div>
            <div className="mt-4 h-1.5 rounded-full bg-[#2C4776]">
              <div className="h-full w-[70%] rounded-full bg-[#37D39E]" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-[#B4C6E3]">
              <span>$980,000</span><span>$1,510,000</span>
            </div>
            <div className="mt-7 border-t border-white/15 pt-5">
              <div className="mb-2 flex items-center justify-between text-[12px] font-semibold"><span>Watch your value grow</span><span className="text-[#37D39E]">+51% since 2022</span></div>
              <svg viewBox="0 0 420 120" className="h-auto w-full" role="img" aria-label="Illustrative business value growth chart">
                <defs>
                  <linearGradient id="valueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#37D39E" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#37D39E" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M4 108 L4 84 L72 77 L140 66 L208 54 L276 42 L344 23 L416 12 L416 108 Z" fill="url(#valueFill)" />
                <path d="M4 84 L72 77 L140 66 L208 54 L276 42 L344 23 L416 12" fill="none" stroke="#37D39E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="416" cy="12" r="5" fill="#37D39E" />
              </svg>
              <div className="mt-1 flex justify-between text-[10px] text-[#B4C6E3]"><span>$820,000 · 2022</span><span>$1,240,000 · today</span></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[10px] bg-white/10 p-3"><p className="text-[9px] uppercase tracking-[0.13em] text-[#A9C2F0]">The usual way</p><p className="mt-1 text-[18px] font-bold">6 weeks</p></div>
              <div className="rounded-[10px] bg-white/10 p-3"><p className="text-[9px] uppercase tracking-[0.13em] text-[#A9C2F0]">With Intaleks</p><p className="mt-1 text-[18px] font-bold">30 minutes</p></div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 overflow-hidden rounded-[14px] border border-[#DDE5F0] bg-white md:grid-cols-2">
          <div className="border-b border-[#DDE5F0] p-6 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4267E9]">One-off valuation</p>
            <p className="mt-1 text-[22px] font-extrabold tracking-[-0.025em]">From $495 once</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5A6472]">Get your valuation and keep access for 2 months.</p>
          </div>
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4267E9]">12 months</p>
            <p className="mt-1 text-[22px] font-extrabold tracking-[-0.025em]">$79 per month</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5A6472]">12-month access, paid once upfront ($948 total). No automatic renewal.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. HOW IT WORKS (steps)
───────────────────────────────────────────── */

const steps = [
  { n: "01", title: "Enter your business details", body: "Tell us about your industry, location and business structure." },
  { n: "02", title: "Complete a business assessment", body: "Answer straightforward questions about your operations, strengths and risks." },
  { n: "03", title: "Add financial information", body: "Enter the key financial figures that drive valuation outcomes." },
  { n: "04", title: "Generate your valuation", body: "Intaleks applies recognised valuation methodologies and relevant market benchmarks." },
  { n: "05", title: "Download your report", body: "Receive a detailed report you can use to support important business decisions." },
];

function StepsSection() {
  return (
    <section className="py-16 px-6" id="how">
      <div className="max-w-[1120px] mx-auto">
        <Eyebrow>How it works</Eyebrow>
        <SectionH2>Professional business valuation in five simple steps</SectionH2>
        <div className="mt-7 border-t border-[#E3E8F0]">
          {steps.map((s) => (
            <div
              key={s.n}
              className="grid grid-cols-[70px_1fr] md:grid-cols-[70px_260px_1fr] gap-5 items-baseline py-5 border-b border-[#E3E8F0]"
            >
              <span className="text-[15px] font-extrabold text-[#3B82F6]">{s.n}</span>
              <h3 className="text-[18px] font-bold">{s.title}</h3>
              <p className="text-[15.5px] text-[#5A6472] col-start-2 md:col-start-3">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          {["No complicated spreadsheets", "No waiting weeks", "No expensive consulting engagements"].map(
            (pill) => (
              <span
                key={pill}
                className="bg-[#EAF1FE] text-[#2563EB] rounded-full px-[18px] py-2 text-[14.5px] font-semibold"
              >
                {pill}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. EQUITY / FOCUS
───────────────────────────────────────────── */

const equityPoints = [
  {
    title: "Wealth you can actually access",
    body: "Value locked in the business is only wealth once you can release it.",
  },
  {
    title: "A stronger position when you leave",
    body: "Buyers pay more for businesses that do not depend on the owner.",
  },
  {
    title: "Better funding and backing",
    body: "Lenders and investors respond to a business with a documented value.",
  },
  {
    title: "Security for the people behind you",
    body: "Family, staff, and whatever comes next all sit on top of this number.",
  },
  {
    title: "The freedom to choose your timing",
    body: "Owners who know their number sell when they want to, not when they have to.",
  },
];

function EquitySection() {
  return (
    <section className="bg-[#F7F9FC] border-t border-[#E3E8F0] py-16 px-6">
      <div className="max-w-[720px] mx-auto">
          <Eyebrow>Focus on building equity</Eyebrow>
          <SectionH2>Successful owners know what their business is worth, and grow it.</SectionH2>
          <Lede>
            They treat value the same way they treat sales or cash. Something to be measured, watched,
            and improved. Most owners never see the number at all. Every point you add turns into
            something real:
          </Lede>
          <ul className="list-none p-0 mt-7">
            {equityPoints.map((pt) => (
              <li
                key={pt.title}
                className="flex items-start gap-3 border-b border-[#E3E8F0] py-3"
              >
                <span className="mt-1 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2 border-[#4E80F5] text-[11px] font-bold text-[#3B82F6]">
                  ✓
                </span>
                <span>
                  <strong className="block text-[15px] leading-snug text-[#20242B]">{pt.title}</strong>
                  <span className="block text-[14px] leading-snug text-[#626975]">{pt.body}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px] font-semibold text-[#3F4550]">You cannot improve a number you have never measured.</p>
      </div>
    </section>
  );
}

function MeetFounderSection() {
  return (
    <section className="border-t border-[#E3E8F0] bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-10 rounded-[20px] border border-[#E1E8F4] bg-[#F7F9FC] p-7 sm:p-10 lg:grid-cols-[260px_1fr] lg:gap-14 lg:p-12">
        <div className="relative mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-[16px] bg-[#DCEAFE]">
          <Image src="/aleks-todorovic.jpg" alt="Aleks Todorovic, founder of Intaleks" fill sizes="260px" className="object-cover" />
        </div>
        <div>
          <Eyebrow>Meet the founder</Eyebrow>
          <SectionH2>Built by someone who has spent 26 years valuing businesses.</SectionH2>
          <Lede>
            Aleks Todorovic founded Intaleks to give business owners clear, credible guidance before a
            sale, negotiation, funding decision or turning point makes the question urgent.
          </Lede>
          <BtnOutline href="/about" className="mt-6">Meet Aleks</BtnOutline>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   8. PRICING
───────────────────────────────────────────── */

const pricingFeatures = [
  "Detailed PDF valuation report",
  "Australian & international industry benchmarks",
  "Multiple valuation methodologies",
  "Business assessment framework",
  "Adjust your figures and rerun as often as you like",
  "No hidden costs, no engagement fees",
];

const tiers = [
  { planName: "2 Months Access", term: "2 months", price: "$495", desc: "Included as standard", best: false },
  { planName: "6 Months Access", term: "6 months", price: "$695", desc: "Track a full half-year of trading", best: true },
  { planName: "12 Months Access", term: "12 months", price: "$79/mo", desc: "$948 paid once · value across the full financial year", best: false },
];

function PricingSection() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [processingPlanName, setProcessingPlanName] = useState<string | null>(null);
  const { isAuthenticated, isAuthentiating } = useAuthState();
  const createCheckout = useCreateCheckout();

  useEffect(() => {
    ApiClient.getPublicPlans()
      .then((response) => {
        if (response.success) setPlans(response.data);
      })
      .catch(() => setPlans([]));
  }, []);

  const beginCheckout = (planName: string) => {
    const plan = plans.find((item) => item.name === planName);
    if (!plan) return;

    if (!isAuthenticated) {
      const returnUrl = `/?checkout=${encodeURIComponent(planName)}#pricing`;
      window.location.assign(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setProcessingPlanName(planName);
    createCheckout.mutate(
      {
        planId: plan.id,
        successUrl: `${window.location.origin}/?checkout=success#pricing`,
        cancelUrl: `${window.location.origin}/?checkout=cancelled#pricing`,
      },
      { onSettled: () => setProcessingPlanName(null) },
    );
  };

  useEffect(() => {
    if (!isAuthenticated || isAuthentiating || plans.length === 0) return;

    const checkoutPlanName = new URLSearchParams(window.location.search).get("checkout");
    if (!checkoutPlanName || !plans.some((plan) => plan.name === checkoutPlanName)) return;

    window.history.replaceState(null, "", `${window.location.pathname}#pricing`);
    beginCheckout(checkoutPlanName);
    // The checkout query is removed before the request so this runs once after sign-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthentiating, plans]);

  return (
    <section className="py-[68px] px-6 text-center" id="pricing">
      <div className="max-w-[1120px] mx-auto">
        <Eyebrow>Simple, affordable, professional</Eyebrow>
        <SectionH2>One price. Everything you need.</SectionH2>

        {/* Main price card */}
        <div className="max-w-[560px] mx-auto mt-7 border border-[#E3E8F0] rounded-[16px] overflow-hidden shadow-[0_20px_50px_rgba(13,17,23,0.07)]">
          <div className="bg-[#0d1117] text-white px-7 py-[34px]">
            <h3 className="text-[19px] font-semibold text-[#C4CEDC]">Professional Business Valuation</h3>
            <div className="text-[clamp(48px,7vw,64px)] font-extrabold tracking-[-0.04em] leading-[1.05] mt-1.5 mb-0.5">
              $495
            </div>
            <p className="text-[15px] text-[#aab4c2]">AUD · one payment · includes 2 months access</p>
          </div>
          <div className="bg-white px-7 py-[30px] text-left">
            <ul className="list-none p-0 mb-6">
              {pricingFeatures.map((f) => (
                <TickItem key={f}>{f}</TickItem>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => beginCheckout("2 Months Access")}
              disabled={isAuthentiating || plans.length === 0 || processingPlanName === "2 Months Access"}
              className="block w-full rounded-[10px] bg-[#0d1117] px-7 py-3.5 text-center text-base font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#1c2530] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processingPlanName === "2 Months Access" ? "Opening secure checkout…" : "Choose 2-month access"}
            </button>
          </div>
        </div>

        {/* Tier comparison */}
        <div className="max-w-[900px] mx-auto mt-10">
          <p className="text-[#5A6472] mb-6">
            Tracking your value over time? Extend your access and watch the number move.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tiers.map((t) => (
              <button
                type="button"
                key={t.term}
                onClick={() => beginCheckout(t.planName)}
                disabled={isAuthentiating || plans.length === 0 || processingPlanName !== null}
                className={`relative rounded-[12px] border px-[22px] py-[26px] text-center ${
                  t.best
                    ? "border-[#3B82F6] bg-[#F2F7FF] shadow-[0_10px_28px_rgba(37,99,235,0.12)]"
                    : "border-[#E3E8F0] bg-white"
                } cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#3B82F6] focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-60`}
              >
                {t.best && (
                  <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-[11.5px] font-bold uppercase tracking-[1px] rounded-full px-3 py-1 whitespace-nowrap">
                    Most popular
                  </span>
                )}
                <span className="block text-[14px] font-semibold uppercase tracking-[1.3px] text-[#5A6472]">
                  {t.term}
                </span>
                <b
                  className={`block text-[34px] font-extrabold tracking-[-0.03em] my-2 ${t.best ? "text-[#2563EB]" : ""}`}
                >
                  {t.price}
                </b>
                <span className="block text-[14px] text-[#5A6472] leading-snug">{t.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-[15px] text-[#5A6472] mt-5">
            Extended access can be added at checkout or any time before your 2 months are up.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   9. FINAL CTA
───────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="py-[76px] px-6 text-center bg-gradient-to-b from-white to-[#EAF1FE]">
      <div className="max-w-[1120px] mx-auto">
        <h2 className="text-[clamp(28px,3.6vw,40px)] font-bold leading-[1.12] tracking-[-0.02em] max-w-[22ch] mx-auto mb-4">
          Isn't it time you knew what your{" "}
          <em className="not-italic text-[#3B82F6]">business</em> is worth?
        </h2>
        <p className="text-[#5A6472] mb-7">Your business may be the most valuable asset you'll ever own.</p>
        <BtnDark href="/calculator">Get My Business Valuation Today</BtnDark>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function HomeLandingPage() {
  return (
    <div className="min-h-screen bg-white font-[Inter,system-ui,sans-serif] text-[16.5px] leading-[1.65] antialiased">
      <Navbar />
      <main>
        <Hero />
        <AssetSection />
        <TooLateSection />
        <IndustriesSection />
        <WhySection />
        <StepsSection />
        <EquitySection />
        <MeetFounderSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <HomeFooter />
    </div>
  );
}
