import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/home/Navbar";
import { HomeFooter } from "@/components/home/HomeFooter";

export const metadata: Metadata = {
  title: "About Intaleks | Business Valuation Australia",
  description:
    "Meet Aleks Todorovic, founder of Intaleks. 26 years in Australian corporate finance, now making professional business valuation accessible to every owner.",
};

const beliefs = [
  {
    title: "It’s an asset, not just a job",
    body: "You don’t only work in it — you’ve been building it. And you can’t grow what you’ve never measured.",
  },
  {
    title: "A number you can defend beats a number you hope for",
    body: "Rules of thumb and “what my mate got for his” aren’t appraisals. Recognised methods and real market data are.",
  },
  {
    title: "The time to find out is before you need to",
    body: "Buyers, partners and opposing lawyers all turn up with a figure. The owners who do well already have their own.",
  },
];

const principles = [
  {
    title: "The same methods the professionals use",
    body: "We work out your value the way a professional valuer would — not with a rough multiple or a rule of thumb someone told you down the pub.",
  },
  {
    title: "Based on real Australian businesses",
    body: "Your number comes from what businesses like yours actually sell for here, in your industry. Not an overseas average with no bearing on your market.",
  },
  {
    title: "Built for your industry",
    body: "A rent roll doesn’t earn like a workshop. A client book doesn’t sell like a fleet of vans. We apply the benchmarks that match how your business actually makes money.",
  },
  {
    title: "Minutes, not months",
    body: "A traditional valuation takes weeks and costs thousands. This takes a few minutes and gives you a report you can put in front of a buyer, a partner or the bank.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#3B82F6]">{children}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[clamp(30px,4vw,48px)] font-bold leading-[1.08] tracking-[-0.03em]">{children}</h2>;
}

function PrimaryLink({ children, href = "/calculator" }: { children: React.ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-[10px] bg-[#2F78E6] px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1D66D2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
    >
      {children}
    </Link>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-[Inter,system-ui,sans-serif] text-[#0D1117] antialiased">
      <Navbar />
      <main>
        <section className="w-full bg-[#102947]">
          <div className="mx-auto grid max-w-[1600px] grid-cols-1 overflow-hidden lg:grid-cols-2">
            <div className="flex min-h-[480px] flex-col justify-center px-7 py-16 text-white sm:px-12 lg:min-h-[650px] lg:px-[clamp(3rem,7vw,9rem)]">
              <Eyebrow>Meet the founder</Eyebrow>
              <h1 className="text-[clamp(44px,6.5vw,82px)] font-extrabold leading-[0.98] tracking-[-0.045em]">
                Aleks Todorovic
              </h1>
              <p className="mt-4 text-[clamp(19px,2vw,26px)] text-[#C7D8F0]">CEO &amp; Founder, Intaleks</p>
              <div className="my-8 h-1 w-16 bg-[#3B82F6]" />
              <blockquote className="max-w-[16ch] font-serif text-[clamp(30px,3.5vw,48px)] leading-[1.1] text-[#F4F8FF]">
                “You built it. You deserve to know what it’s worth.”
              </blockquote>
              <div className="mt-9">
                <PrimaryLink>Start My Business Valuation</PrimaryLink>
              </div>
            </div>
            <div className="relative min-h-[430px] lg:min-h-[650px]">
              <Image
                src="/aleks-todorovic.jpg"
                alt="Aleks Todorovic, CEO and Founder of Intaleks"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="rounded-[18px] border border-[#E1E8F4] bg-white p-7 sm:p-12">
              <Eyebrow>About the founder</Eyebrow>
              <SectionTitle>26 years of watching one number change everything.</SectionTitle>
              <div className="mt-9 grid grid-cols-1 items-start gap-8 lg:grid-cols-[170px_1fr] lg:gap-12">
                <div className="relative aspect-square w-full max-w-[170px] overflow-hidden rounded-[16px] bg-[#E8EDF8]">
                  <Image
                    src="/aleks-todorovic-founder.jpg"
                    alt="Aleks Todorovic, founder of Intaleks"
                    fill
                    sizes="170px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="max-w-[760px] space-y-5 text-[clamp(18px,2.1vw,24px)] leading-relaxed text-[#62666B]">
                  <p>I have spent 26 years in corporate Australia running finance and operations teams. I have sat in the rooms where the numbers get decided, and I have watched a single figure on a page change the direction of a company, and the lives of the people behind it.</p>
                  <p>I started Executive Business Valuers preparing formal valuations for shareholder disputes, family law matters and buy-outs. The kind of report that has to hold up when the other side&apos;s expert goes through it line by line.</p>
                  <p>Then the phone started ringing with a different sort of call.</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <Eyebrow>Why this exists</Eyebrow>
              <SectionTitle>Finding out what a business is worth has never been accessible</SectionTitle>
            </div>
            <div className="mt-10 space-y-5">
              <article className="rounded-[18px] border border-[#E1E8F4] bg-[#F5F7FB] p-7 sm:p-12">
                <h2 className="text-[clamp(27px,3vw,36px)] font-bold tracking-[-0.03em]">The calls I could not help.</h2>
                <div className="mt-5 max-w-[850px] space-y-5 text-[clamp(18px,2.1vw,24px)] leading-relaxed text-[#62666B]">
                  <p>A builder, three years out from selling. A café owner whose landlord had just raised the rent. A couple facing a settlement with no idea what the business they had spent a decade building would mean for the outcome.</p>
                  <p>None of them needed a court-ready report. They wanted to know what they were walking into. But the only thing I could quote them was a price built for litigation. Most of them thanked me and hung up.</p>
                  <p>That never sat well with me. An answer that costs thousands and takes six weeks is not an answer most owners can get to.</p>
                </div>
              </article>
              <article className="rounded-[18px] border border-[#E3E8F0] bg-white p-7 sm:p-12">
                <h2 className="text-[clamp(27px,3vw,36px)] font-bold tracking-[-0.03em]">Intaleks is the fix.</h2>
                <div className="mt-5 max-w-[850px] space-y-5 text-[clamp(18px,2.1vw,24px)] leading-relaxed text-[#62666B]">
                  <p>The same rigour and the same 26 years, at a price a real business owner can say yes to. Every valuation runs on the methodology I built for reports that had to survive cross-examination. The difference is the delivery, not the standard.</p>
                  <p className="pt-1 text-[18px] font-bold text-[#363A41]">Aleks Todorovic, Founder</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-[#E3E8F0] bg-[#F6F9FE] px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-[1120px]">
            <Eyebrow>What we believe</Eyebrow>
            <SectionTitle>The owners who do well already know their number</SectionTitle>
            <p className="mt-5 max-w-[72ch] text-[17px] leading-relaxed text-[#48576B]">
              Most people can tell you what their house is worth to the dollar. Ask the same person what their business is worth and you’ll usually get a shrug. That gap costs money — in buy-outs settled too low, offers accepted without a comparison, and settlements agreed under pressure because nobody had a defensible figure to point at.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {beliefs.map((belief) => (
                <article key={belief.title} className="rounded-[14px] border border-[#E0E8F4] bg-white p-7">
                  <h3 className="text-[19px] font-bold tracking-[-0.02em]">{belief.title}</h3>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-[#5A6472]">{belief.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-[1120px]">
            <Eyebrow>How we work</Eyebrow>
            <SectionTitle>Professional results, in plain English</SectionTitle>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {principles.map((principle, index) => (
                <article key={principle.title} className="flex gap-5 rounded-[14px] border border-[#E3E8F0] p-7">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF1FE] text-sm font-bold text-[#2563EB]">0{index + 1}</span>
                  <div>
                    <h3 className="text-[19px] font-bold tracking-[-0.02em]">{principle.title}</h3>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-[#5A6472]">{principle.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#102947] px-6 py-20 text-white sm:py-24">
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow>Where Intaleks fits</Eyebrow>
              <SectionTitle>When you need more, we’ll tell you</SectionTitle>
            </div>
            <div className="space-y-5 text-[17px] leading-relaxed text-[#D0DDEE]">
              <p>Intaleks gives you a clear, well-founded view of what your business is worth — for planning, for negotiating, for knowing where you stand.</p>
              <p>Some situations call for more: a contested shareholder dispute, a family law matter heading to court, or a deal where the other side’s expert will pull the report apart line by line.</p>
              <p>For those, there’s Executive Business Valuers — certified, court-ready valuations built to withstand exactly that scrutiny.</p>
              <p>Same rigour. Same 26 years. We’ll point you to the right one for your situation, even when that isn’t us.</p>
              <a href="https://executivebusinessvaluers.com.au/#quote" target="_blank" rel="noreferrer" className="inline-flex font-semibold text-[#9FC4FF] underline underline-offset-4 hover:text-white">
                Certified valuations at Executive Business Valuers →
              </a>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-[14px] border border-[#E3E8F0] p-8">
              <Eyebrow>Mission</Eyebrow>
              <h2 className="text-[26px] font-bold tracking-[-0.025em]">To put a credible appraisal within reach of every Australian business owner.</h2>
            </div>
            <div className="rounded-[14px] border border-[#E3E8F0] p-8">
              <Eyebrow>Vision</Eyebrow>
              <h2 className="text-[26px] font-bold tracking-[-0.025em]">To make business value as ordinary to track as a house price.</h2>
            </div>
          </div>
        </section>

        <section className="bg-[#F6F9FE] px-6 py-20 text-center sm:py-24">
          <div className="mx-auto max-w-[720px]">
            <SectionTitle>Isn’t it time you knew what your business is worth?</SectionTitle>
            <p className="mt-5 text-[17px] text-[#5A6472]">Your business may be the most valuable asset you’ll ever own. Find out where you stand.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-5">
              <PrimaryLink>Start My Business Valuation</PrimaryLink>
              <Link href="/valuation-sample.pdf" className="self-center font-semibold text-[#2563EB] underline underline-offset-4 hover:text-[#174EA6]">View Sample Report</Link>
            </div>
            <p className="mt-5 text-sm text-[#5A6472]">$495 AUD, one payment — includes 2 months access.</p>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
