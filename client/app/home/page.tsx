"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/home/Navbar";
import { HomeFooter } from "@/components/home/HomeFooter";

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

function Hero() {
  return (
    <section
      className="bg-gradient-to-b from-white via-[#F2F7FF] to-[#EAF1FE] pt-[60px] pb-[68px] px-6"
      id="top"
    >
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-14 items-center">
        {/* Left copy */}
        <div>
          <Eyebrow>Business Valuation, Made Simple</Eyebrow>
          <h1 className="text-[clamp(36px,4.9vw,58px)] font-extrabold leading-[1.12] tracking-[-0.02em]">
            You know what your house is worth. What about your{" "}
            <em className="not-italic text-[#3B82F6] font-extrabold">business?</em>
          </h1>
          <p className="text-lg text-[#5A6472] mt-[22px] mb-[26px] max-w-[52ch] leading-relaxed">
            Most Australians know what their home is worth — they track property prices and watch the
            market. Yet ask a business owner what their business is worth, and most have no idea.
          </p>
          <p className="font-bold text-[19px] mb-[18px]">Welcome to Intaleks.</p>
          <ul className="list-none mb-7 p-0">
            <TickItem>Professional business valuation</TickItem>
            <TickItem>Australian market data &amp; benchmarks</TickItem>
            <TickItem>No spreadsheets or complex financial models</TickItem>
            <TickItem>Completed in minutes</TickItem>
            <TickItem>Detailed PDF valuation report</TickItem>
          </ul>
          <div className="flex flex-wrap gap-3.5">
            <BtnDark href="/calculator">Get My Business Valuation</BtnDark>
            <BtnOutline href="/valuation-sample.pdf">View Sample Report</BtnOutline>
          </div>
          <p className="mt-4 text-[14.5px] text-[#5A6472] italic">
            $495 AUD, one payment — includes 2 months access. Extended plans available.
          </p>
        </div>

        {/* Right photo */}
        <div className="relative">
          <div
            className="relative w-full aspect-[4/5] max-h-[540px] rounded-[12px] overflow-hidden shadow-[0_24px_60px_rgba(37,99,235,0.18)] bg-[#EAF1FE]"
          >
            <Image
              src="/aleks-todorovic.jpg"
              alt="Aleks Todorovic, Founder and CEO of Intaleks"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          {/* Badge */}
          <div className="absolute bottom-[-24px] left-[-24px] bg-[#0d1117] text-white rounded-[12px] px-6 py-4 shadow-[0_16px_40px_rgba(13,17,23,0.28)]">
            <b className="block text-[18px] font-extrabold tracking-[-0.02em] leading-tight">Aleks Todorovic</b>
            <span className="block text-[13px] text-[#d6e4fb] mt-1">Founder &amp; CEO, Intaleks</span>
            <span className="block text-[12px] text-[#aab4c2] mt-1">Expert Business Valuer</span>
          </div>
        </div>
      </div>
    </section>
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
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
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
        <div className="bg-[#F7F9FC] border border-[#E3E8F0] rounded-[12px] px-7 py-7">
          <h3 className="text-[13px] font-semibold uppercase tracking-[1.4px] text-[#5A6472] mb-4">
            What you check every year
          </h3>
          <ul className="list-none p-0 m-0">
            {items.map((item, i) => {
              const isLast = i === items.length - 1;
              return (
                <li
                  key={item.label}
                  className={`flex justify-between items-center gap-3 py-3 font-medium text-[15px] ${
                    isLast
                      ? "bg-[#0d1117] text-white -mx-7 -mb-7 px-7 pb-7 pt-5 rounded-b-[12px] mt-3.5"
                      : "border-b border-[#E3E8F0]"
                  }`}
                >
                  <span className="min-w-0">{item.label}</span>
                  {item.known ? (
                    <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-[#3B82F6] bg-[#EAF1FE] rounded-full px-3 py-0.5">
                      You know
                    </span>
                  ) : (
                    <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-white bg-[#2563EB] rounded-full px-4 py-1">
                      No idea
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
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
      title: "An offer lands out of nowhere",
      body: "Thirty years of work, and a fortnight to decide.",
    },
    {
      title: "A partner wants out",
      body: "Yesterday you built it together. Today you're negotiating.",
    },
    {
      title: "A marriage ends",
      body: "The business is on the table, and nobody knows what it's worth.",
    },
    {
      title: "Health forces your hand",
      body: "Retirement stops being a plan and becomes a deadline.",
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
          Nobody plans for the day they need to know their business value
        </SectionH2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6 mb-5">
          {moments.map((m) => (
            <div
              key={m.title}
              className="bg-white/10 border border-white/20 rounded-[10px] p-5"
            >
              <b className="block text-[16.5px] font-bold mb-1.5">{m.title}</b>
              <span className="block text-[14.5px] text-[#D6E4FB] leading-relaxed">{m.body}</span>
            </div>
          ))}
        </div>

        <p className="text-[#E2ECFC] max-w-[60ch] leading-relaxed">
          These moments arrive without warning, and they never wait for you to get organised.{" "}
          <strong className="text-white">
            The best outcomes don't go to the biggest businesses. They go to the owners who already knew
            their business value.
          </strong>
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
    cta: "What's my trade business worth →",
    photo:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&q=70",
    photoAlt: "Electrician at work",
    href: "/calculator",
    light: false,
  },
  {
    title: "Real Estate Agencies",
    desc: "Rent roll, sales performance, team and brand strength",
    cta: "What's my agency worth →",
    photo:
      "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=700&q=70",
    photoAlt: "Sold sign outside a home",
    href: "/calculator",
    light: false,
  },
  {
    title: "Hospitality & Retail",
    desc: "Cafés, restaurants, bars, salons and shopfront businesses",
    cta: "What's my venue worth →",
    photo:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=70",
    photoAlt: "Restaurant interior",
    href: "/calculator",
    light: false,
  },
  {
    title: "Professional Services",
    desc: "Agencies, consultancies, allied health and advisory firms",
    cta: "What's my practice worth →",
    photo:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=700&q=70",
    photoAlt: "Consultants in a meeting",
    href: "/calculator",
    light: false,
  },
  {
    title: "Transport & Logistics",
    desc: "Freight, couriers, earthmoving and equipment-heavy operators",
    cta: "What's my operation worth →",
    photo:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=700&q=70",
    photoAlt: "Delivery trucks at a depot",
    href: "/calculator",
    light: false,
  },
  {
    title: "Family Lawyers",
    desc: "Scope the asset pool early — then escalate to a certified, court-ready report",
    cta: "For legal matters →",
    photo:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=700&q=70",
    photoAlt: "Legal documents on a desk",
    href: "https://executivebusinessvaluers.com.au/#quote",
    light: true,
  },
];

function IndustriesSection() {
  return (
    <section className="py-16 px-6" id="industries">
      <div className="max-w-[1120px] mx-auto">
        <Eyebrow>Built for your industry</Eyebrow>
        <SectionH2>Intaleks helps businesses like yours know their value</SectionH2>
        <Lede className="mb-8">
          A rent roll doesn't earn like a workshop. A client book doesn't sell like a fleet of vans. We
          apply the benchmarks and methods that fit your industry — so the valuation reflects how your
          business actually makes money.
        </Lede>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {industries.map((ind) => {
            const isExternal = ind.href.startsWith("http");
            const cardContent = (
              <>
                <div
                  className="aspect-[16/9] bg-[#EAF1FE] bg-cover bg-center"
                  style={{ backgroundImage: `url('${ind.photo}')` }}
                  role="img"
                  aria-label={ind.photoAlt}
                />
                <div className={`px-6 py-5 ${ind.light ? "bg-[#F7F9FC]" : "bg-white"}`}>
                  <h3 className="text-[18px] font-bold mb-1.5">{ind.title}</h3>
                  <p className="text-[14.5px] text-[#5A6472] mb-3.5">{ind.desc}</p>
                  <span className="text-[14px] font-semibold text-[#3B82F6]">{ind.cta}</span>
                </div>
              </>
            );

            return isExternal ? (
              <a
                key={ind.title}
                href={ind.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-[12px] border border-[#E3E8F0] bg-white no-underline text-inherit transition-all hover:border-[#3B82F6] hover:shadow-[0_10px_28px_rgba(37,99,235,0.1)] hover:-translate-y-0.5"
              >
                {cardContent}
              </a>
            ) : (
              <Link
                key={ind.title}
                href={ind.href}
                className="block overflow-hidden rounded-[12px] border border-[#E3E8F0] bg-white no-underline text-inherit transition-all hover:border-[#3B82F6] hover:shadow-[0_10px_28px_rgba(37,99,235,0.1)] hover:-translate-y-0.5"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>

        <p className="mt-5 text-[15px] text-[#5A6472]">
          Don't see yours? Intaleks covers businesses across every sector — enter your industry and we'll
          apply the right benchmarks.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. WHY (3-card tiles)
───────────────────────────────────────────── */

const whyCards = [
  {
    title: "Recognised methodologies",
    body: "Intaleks applies established valuation approaches used by professional advisors — not guesswork.",
  },
  {
    title: "Australian market benchmarks",
    body: "Your result is grounded in real-world comparable data from Australian industries, not generic global averages.",
  },
  {
    title: "In minutes, not months",
    body: "Traditional valuations take weeks and cost thousands. Intaleks delivers a professional-grade result in minutes.",
  },
];

function WhySection() {
  return (
    <section className="bg-[#F7F9FC] border-t border-[#E3E8F0] py-[88px] px-6">
      <div className="max-w-[1120px] mx-auto">
        <Eyebrow>Why Intaleks</Eyebrow>
        <SectionH2>Professional-grade results, without the professional price tag</SectionH2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mt-7">
          {whyCards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-[#E3E8F0] rounded-[12px] p-7 hover:border-[#3B82F6] hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition-all"
            >
              <h3 className="text-[18px] font-bold mb-2">{card.title}</h3>
              <p className="text-[15px] text-[#5A6472]">{card.body}</p>
            </div>
          ))}
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
  "Greater wealth",
  "Better exit opportunities",
  "More investor interest",
  "Increased financial security",
  "More options for the future",
];

function EquitySection() {
  return (
    <section className="bg-[#F7F9FC] border-t border-[#E3E8F0] py-16 px-6">
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Copy */}
        <div>
          <Eyebrow>Focus on building equity</Eyebrow>
          <SectionH2>The most successful owners know their business value</SectionH2>
          <Lede>
            Most owners focus on working in their business. Successful owners focus on increasing the
            value of it. A more valuable business creates:
          </Lede>
          <ul className="list-none p-0 mt-2.5">
            {equityPoints.map((pt) => (
              <li
                key={pt}
                className="flex items-center gap-3 py-3.5 border-b border-[#E3E8F0] font-semibold text-[15px]"
              >
                <span className="w-[26px] h-[26px] rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-[13px] font-bold flex-none">
                  ✓
                </span>
                {pt}
              </li>
            ))}
          </ul>
          <Lede className="mt-5">
            Understanding your current value is the first step towards improving it.
          </Lede>
        </div>

        {/* Photo */}
        <div className="relative w-full aspect-[5/4] rounded-[12px] overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.15)] bg-[#EAF1FE]">
          <Image
            src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80"
            alt="Restaurant owner behind the counter"
            fill
            className="object-cover"
          />
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
  { term: "2 months", price: "$495", desc: "Included as standard", best: false },
  { term: "6 months", price: "$695", desc: "Track a full half-year of trading", best: true },
  { term: "12 months", price: "$995", desc: "Value at the start and end of the financial year", best: false },
];

function PricingSection() {
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
            <BtnDark href="/calculator" className="block text-center w-full">
              Start My Valuation
            </BtnDark>
          </div>
        </div>

        {/* Tier comparison */}
        <div className="max-w-[900px] mx-auto mt-10">
          <p className="text-[#5A6472] mb-6">
            Tracking your value over time? Extend your access and watch the number move.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tiers.map((t) => (
              <div
                key={t.term}
                className={`relative rounded-[12px] border px-[22px] py-[26px] text-center ${
                  t.best
                    ? "border-[#3B82F6] bg-[#F2F7FF] shadow-[0_10px_28px_rgba(37,99,235,0.12)]"
                    : "border-[#E3E8F0] bg-white"
                }`}
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
              </div>
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
   9. FOUNDER QUOTE
───────────────────────────────────────────── */

function FounderSection() {
  return (
    <section className="py-16 px-6 border-t border-[#E3E8F0]">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-9 items-start max-w-[900px]">
          {/* Photo */}
          <div className="relative w-full aspect-[4/3] md:w-[220px] md:h-[220px] md:aspect-auto rounded-2xl overflow-hidden ring-4 ring-[#EAF1FE] bg-[#EAF1FE] flex-none">
            <Image
              src="/founder.png"
              alt="Aleks Todorovic, founder of Intaleks"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Quote */}
          <div>
            <Eyebrow>From the founder</Eyebrow>
            <blockquote className="text-[20px] leading-[1.6] font-medium border-l-[3px] border-[#3B82F6] pl-[22px] m-0">
              "I've spent 25+ years valuing businesses, and I've seen how hard it is for owners to get
              clear, honest guidance on what their business is worth. I built Intaleks so any business
              owner can get a professional-grade appraisal without the cost, complexity or delay."
            </blockquote>
            <cite className="block mt-4 not-italic text-[#5A6472] text-[15px]">
              Aleks Todorovic — Founder, Intaleks &amp; Executive Business Valuers
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   10. FINAL CTA
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
        <PricingSection />
        <FounderSection />
        <FinalCTA />
      </main>
      <HomeFooter />
    </div>
  );
}
