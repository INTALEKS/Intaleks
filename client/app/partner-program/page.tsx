import Link from "next/link";
import { Building2, CheckCircle2, Users, FileText, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/home/Navbar";
import { HomeFooter } from "@/components/home/HomeFooter";

const plans = [
  {
    name: "Partner",
    price: "$495",
    items: [
      "5 valuations across the firm for 30 days",
      "Unlimited adviser logins",
      "Firm-level visibility and report export",
      "Additional valuations available at $295 each",
    ],
  },
  {
    name: "Partner Unlimited",
    price: "$995",
    featured: true,
    items: [
      "Unlimited valuations across the firm for 30 days",
      "Unlimited adviser logins",
      "Firm-level visibility and report export",
      "Upgrade path for growing firms",
    ],
  },
];

export default function PartnerProgramPage() {
  return (
    <div className="min-h-screen bg-white text-[#0d1117]">
      <Navbar />
      <main>
        <section className="bg-gradient-to-b from-[#F2F7FF] to-white px-6 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.16em] text-[#3B82F6]">Partner Program</p>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-[-.03em] sm:text-6xl">
              Valuations for <em className="not-italic text-[#3B82F6]">professional partners</em>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[#5A6472]">
              Built for financial planning groups, legal firms, accounting practices and brokerages. Intaleks onboards your firm, your firm adds its advisers, and every valuation stays visible at firm level.
            </p>
            <Link href="/settings?tab=referrals" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0d1117] px-7 py-3.5 font-semibold text-white transition hover:bg-[#1c2530]">
              Apply for partner onboarding <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#3B82F6]">Account structure</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.02em] sm:text-4xl">One firm account. Many adviser accounts.</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-[#5A6472]">A firm owns its access and oversight. Individual advisers use their own logins to create valuations for clients.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                [Building2, "1. Partner Firm", "Holds plan access, billing, users and firm-wide oversight."],
                [Users, "2. Adviser Users", "Added and managed by the firm administrator. Each has an individual login."],
                [FileText, "3. Valuations", "Created by advisers and visible to the firm for review, reproduction and export."],
              ].map(([Icon, title, description]) => {
                const ItemIcon = Icon as typeof Building2;
                return <div key={title as string} className="rounded-2xl border border-[#E3E8F0] bg-[#F7F9FC] p-6"><ItemIcon className="h-7 w-7 text-[#3B82F6]" /><h3 className="mt-5 text-lg font-bold">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-[#5A6472]">{description as string}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#F7F9FC] px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#3B82F6]">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.02em] sm:text-4xl">A guided start, then your team takes over.</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-5">
              {["Apply and book onboarding", "Intaleks sets up your firm", "Choose a plan", "Invite advisers", "Create and oversee valuations"].map((step, index) => <li key={step} className="rounded-xl border border-[#E3E8F0] bg-white p-5"><span className="text-sm font-bold text-[#3B82F6]">0{index + 1}</span><p className="mt-4 font-semibold leading-snug">{step}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="px-6 py-16" id="partner-pricing">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#3B82F6]">Partner pricing</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.02em] sm:text-4xl">Two plans, both firm-wide.</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-[#5A6472]">Partner access is separate from Business Owner plans. Plans do not renew automatically: at the end of each 30-day period, your firm actively chooses to renew, upgrade or stop.</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {plans.map((plan) => <article key={plan.name} className={`rounded-2xl border p-7 ${plan.featured ? "border-[#2563EB] bg-[#0d1117] text-white" : "border-[#E3E8F0] bg-white"}`}><h3 className="text-xl font-bold">{plan.name}</h3><p className="mt-3 text-4xl font-extrabold">{plan.price}<span className={`ml-2 text-sm font-medium ${plan.featured ? "text-[#D6E4FB]" : "text-[#5A6472]"}`}>AUD / 30 days</span></p><ul className="mt-6 space-y-3 text-sm">{plan.items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className={`h-5 w-5 shrink-0 ${plan.featured ? "text-[#8AB8FF]" : "text-[#3B82F6]"}`} />{item}</li>)}</ul></article>)}
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
