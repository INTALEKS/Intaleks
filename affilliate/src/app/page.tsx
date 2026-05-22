"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

type ModalKey = null | "register" | "login" | "forgot" | "terms" | "privacy" | "contact";

const faqs = [
  {
    q: "Who can apply to become an affiliate?",
    a: "Business brokers, accountants, advisors, solicitors, and consultants who work with business owners.",
  },
  {
    q: "How does the 30-day attribution window work?",
    a: "When a visitor clicks your referral link, attribution is tracked for 30 days. Any paid conversion in that window is credited to you.",
  },
  {
    q: "When do I get paid?",
    a: "Commission unlocks after a 3-day hold. Withdrawals are available from $250 and processed in 2-5 business days.",
  },
  {
    q: "Is there a cost to join?",
    a: "No. Joining and applying to the affiliate program is free.",
  },
  {
    q: "How long does approval take?",
    a: "Most applications are reviewed within 48 hours.",
  },
];

function mainAppUrl() {
  return process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "https://intaleks.com";
}

function Modal({ open, onClose, children, max = "max-w-2xl" }: { open: boolean; onClose: () => void; children: React.ReactNode; max?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur" onClick={onClose}>
      <div className={`relative w-full ${max} rounded-2xl border border-slate-200 bg-white shadow-2xl`} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default function AffiliateLandingPage() {
  const router = useRouter();
  const [modal, setModal] = useState<ModalKey>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // If the user is already authenticated (e.g. logged in on the main client),
  // silently redirect them to the portal dashboard instead of showing the
  // marketing landing page. The auth_token cookie is shared because both
  // apps make credentialed requests to the same backend origin.
  useEffect(() => {
    let cancelled = false;
    api.get("/api/auth/me")
      .then((res) => {
        if (!cancelled && res.data?.user) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        // Not authenticated — stay on landing page
      });
    return () => { cancelled = true; };
  }, [router]);

  const signupRedirectUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${mainAppUrl()}/signup?returnUrl=${encodeURIComponent(`${window.location.origin}/dashboard`)}`;
    }
    return `${mainAppUrl()}/signup?returnUrl=http://localhost:3001/dashboard`;
  }, []);

  const loginRedirectUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${mainAppUrl()}/login?returnUrl=${encodeURIComponent(`${window.location.origin}/dashboard`)}`;
    }
    return `${mainAppUrl()}/login?returnUrl=http://localhost:3001/dashboard`;
  }, []);

  const stats = useMemo(
    () => [
      ["25%", "Flat commission"],
      ["$250", "Min. payout"],
      ["30-day", "Cookie window"],
      ["5 days", "Payout turnaround"],
    ],
    [],
  );

  return (
    <div className="bg-white text-[#0f2744]">
      <nav className="fixed inset-x-0 top-0 z-50 flex h-[68px] items-center justify-between border-b border-white/10 bg-[#0a1f3de8] px-6 backdrop-blur lg:px-16">
        <div className="font-serif text-xl font-bold text-white">
          intal<span className="text-[#5bb8e0]">eks</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          <a href="#how-it-works">How it works</a>
          <a href="#commission">Commission</a>
          <a href="#marketing-assets">Marketing assets</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setModal("login")} className="cursor-pointer rounded-md border border-white/20 px-4 py-2 text-sm text-white/80">
            Log in
          </button>
          <button type="button" onClick={() => setModal("register")} className="cursor-pointer rounded-md bg-[#2e86ab] px-4 py-2 text-sm font-medium text-white">
            Become an affiliate
          </button>
        </div>
      </nav>

      <section className="grid min-h-screen grid-cols-1 overflow-hidden bg-[#0a1f3d] pt-[68px] lg:grid-cols-[1fr_420px]">
        <div className="px-6 py-20 lg:px-16">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#5bb8e0]">Affiliate Programme</p>
          <h1 className="max-w-3xl font-serif text-5xl leading-tight font-bold text-white lg:text-6xl">
            Earn <span className="text-[#5bb8e0]">25%</span> on every business valuation you refer
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">Join Australia&apos;s trusted business valuation platform and earn commission every time a referred client subscribes to Intaleks.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => setModal("register")} className="rounded-lg bg-[#2e86ab] px-6 py-3 text-sm font-medium text-white">
              Apply now — it&apos;s free ↗
            </button>
            <a href="#how-it-works" className="rounded-lg border border-white/20 px-6 py-3 text-sm text-white/80">
              See how it works
            </a>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 lg:grid-cols-4">
            {stats.map(([value, label]) => (
              <div key={label}>
                <p className="font-mono text-3xl text-white">{value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative hidden lg:block">
          <img src="https://executivebusinessvaluers.com.au/wp-content/uploads/2025/05/ALEKS-3.jpeg" alt="Aleks Todorovic" className="h-full w-full object-cover object-top" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f3d] via-[#0a1f3d55] to-transparent" />
          <div className="absolute bottom-8 left-6 rounded-xl border border-white/10 bg-[#0a1f3dc0] p-4 backdrop-blur">
            <p className="text-sm font-semibold text-white">Aleks Todorovic</p>
            <p className="text-xs text-white/50">Founder — Intaleks & Executive Business Valuers</p>
            <p className="mt-2 inline-block rounded-full border border-[#2e86ab66] bg-[#2e86ab33] px-2 py-1 text-[10px] text-[#5bb8e0]">CA ANZ · 25+ yrs experience</p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between bg-[#2e86ab] px-6 py-5 text-white lg:px-16">
        <p className="text-sm">
          Earn commission on <strong>every plan</strong> — no caps, no tiers.
        </p>
        <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-mono">25% on all conversions</span>
      </div>

      <section id="how-it-works" className="px-6 py-24 lg:px-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[#2e86ab]">Simple process</p>
        <h2 className="mt-3 font-serif text-4xl">How the affiliate programme works</h2>
        <p className="mt-3 max-w-2xl text-[#6a8aaa]">From application to payout in four straightforward steps.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {["Apply & get approved", "Get your unique link", "Share & refer", "Earn & get paid"].map((title, index) => (
            <article key={title} className="rounded-2xl border border-[#e2e8f0] bg-[#f0f4f8] p-6">
              <p className="font-mono text-5xl text-[#5bb8e055]">0{index + 1}</p>
              <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="commission" className="bg-[#f0f4f8] px-6 py-24 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#2e86ab]">Earnings potential</p>
            <h2 className="mt-3 font-serif text-4xl">See what you could earn</h2>
            <p className="mt-4 text-[#6a8aaa]">Every plan earns 25% commission. Refer consistently and the numbers stack quickly.</p>
          </div>
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-7">
            <p className="text-xs uppercase tracking-[0.1em] text-[#6a8aaa]">Monthly example — 4 referrals</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span>Starter</span>
                <span className="font-mono text-emerald-700">$74.75</span>
              </div>
              <div className="flex justify-between">
                <span>Professional</span>
                <span className="font-mono text-emerald-700">$174.75</span>
              </div>
              <div className="flex justify-between">
                <span>Enterprise</span>
                <span className="font-mono text-emerald-700">$249.75</span>
              </div>
              <div className="flex justify-between">
                <span>Enterprise</span>
                <span className="font-mono text-emerald-700">$249.75</span>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-[#0a1f3d] p-4 text-white">
              <p className="text-xs text-white/50">Total earned this month</p>
              <p className="font-mono text-3xl">$749.00</p>
            </div>
          </div>
        </div>
      </section>

      <section id="marketing-assets" className="px-6 py-24 lg:px-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[#2e86ab]">Resources</p>
        <h2 className="mt-3 font-serif text-4xl">Marketing assets included</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {["Email banner", "LinkedIn post graphic", "One-pager PDF", "Logo pack", "WhatsApp graphics", "Slide deck"].map((item) => (
            <article key={item} className="rounded-xl border border-[#e2e8f0] p-5">
              <h3 className="text-sm font-semibold">{item}</h3>
              <p className="mt-1 text-xs text-[#6a8aaa]">Ready-to-use branded asset</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-[#2e86ab]">Common questions</p>
          <h2 className="mt-3 text-center font-serif text-4xl">Everything you need to know</h2>
          <div className="mt-10 border-y border-[#e2e8f0]">
            {faqs.map((item, index) => (
              <div key={item.q} className="border-b border-[#e2e8f0] last:border-b-0">
                <button type="button" className="flex w-full items-center justify-between py-5 text-left text-sm font-medium" onClick={() => setFaqOpen(faqOpen === index ? null : index)}>
                  {item.q}
                  <span>{faqOpen === index ? "▴" : "▾"}</span>
                </button>
                {faqOpen === index ? <p className="pb-5 text-sm leading-relaxed text-[#6a8aaa]">{item.a}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a1f3d] px-6 py-24 text-center lg:px-16">
        <h2 className="font-serif text-4xl text-white">Start earning today</h2>
        <p className="mt-3 text-white/60">Apply in minutes. Get your referral link and start earning 25% on every conversion.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={() => setModal("register")} className="rounded-lg bg-[#2e86ab] px-6 py-3 text-sm font-medium text-white">
            Apply now — it&apos;s free ↗
          </button>
          <button type="button" onClick={() => setModal("login")} className="rounded-lg border border-white/20 px-6 py-3 text-sm text-white/80">
            Log in
          </button>
        </div>
      </section>

      <footer className="flex flex-col gap-4 bg-[#060e1c] px-6 py-10 text-center lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:text-left">
        <div>
          <p className="font-serif text-lg text-white/25">intaleks</p>
          <p className="text-xs text-[#2d5a8a]">© 2025 Intaleks Pty Ltd. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-[#2d5a8a]">
          <button type="button" onClick={() => setModal("terms")}>
            Terms & Conditions
          </button>
          <button type="button" onClick={() => setModal("privacy")}>
            Privacy Policy
          </button>
          <button type="button" onClick={() => setModal("contact")}>
            Contact
          </button>
          <button type="button" onClick={() => setModal("login")}>
            Affiliate login
          </button>
        </div>
      </footer>

      <Modal open={modal === "register"} onClose={() => setModal(null)}>
        <div className="grid lg:grid-cols-[260px_1fr]">
          <div className="rounded-l-2xl rounded-r-2xl lg:rounded-l-2xl lg:rounded-r-none bg-[#0a1f3d] p-6 text-white">
            <p className="font-serif text-lg">
              intal<span className="text-[#5bb8e0]">eks</span>
            </p>
            <p className="mt-6 text-sm text-white/70">Create your affiliate account with your existing Intaleks identity.</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold">Become an affiliate</h3>
            <p className="mt-1 text-sm text-[#6a8aaa]">Use the main Intaleks signup flow to apply.</p>
            <a href={signupRedirectUrl} className="mt-6 inline-flex rounded-lg bg-[#2e86ab] px-5 py-3 text-sm font-medium text-white">
              Continue to Sign Up
            </a>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "login"} onClose={() => setModal(null)}>
        <div className="p-6">
          <h3 className="text-xl font-semibold">Affiliate login</h3>
          <p className="mt-1 text-sm text-[#6a8aaa]">Use your existing Intaleks account credentials.</p>
          <a href={loginRedirectUrl} className="mt-6 inline-flex rounded-lg bg-[#2e86ab] px-5 py-3 text-sm font-medium text-white">
            Continue to Login
          </a>
          <button type="button" onClick={() => setModal("forgot")} className="cursor-pointer mt-3 block text-sm text-[#2e86ab]">
            Forgot password?
          </button>
        </div>
      </Modal>

      <Modal open={modal === "forgot"} onClose={() => setModal(null)} max="max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-semibold">Reset your password</h3>
          <p className="mt-1 text-sm text-[#6a8aaa]">Password recovery is handled on Intaleks auth.</p>
          <a href={`${mainAppUrl()}/auth/forgot-password`} className="mt-6 inline-flex rounded-lg bg-[#2e86ab] px-5 py-3 text-sm font-medium text-white">
            Open Password Reset
          </a>
        </div>
      </Modal>

      <Modal open={modal === "terms"} onClose={() => setModal(null)} max="max-w-3xl">
        <div className="p-7">
          <h3 className="font-serif text-2xl font-bold">Affiliate Programme — Terms & Conditions</h3>
          <p className="mt-1 text-xs text-[#6a8aaa]">Effective 1 January 2025 · Version 1.0</p>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-[#6a8aaa]">
            <p>
              <strong className="text-[#0f2744]">1. Acceptance.</strong> By registering, you agree to programme terms and updates by notice.
            </p>
            <p>
              <strong className="text-[#0f2744]">2. Commission.</strong> Flat 25% on net plan value, 3-day hold, reversals on refunds/fraud.
            </p>
            <p>
              <strong className="text-[#0f2744]">3. Withdrawals.</strong> Minimum $250; payouts via PayPal/Stripe in 2-5 business days.
            </p>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "privacy"} onClose={() => setModal(null)} max="max-w-3xl">
        <div className="p-7">
          <h3 className="font-serif text-2xl font-bold">Privacy Policy</h3>
          <p className="mt-1 text-xs text-[#6a8aaa]">Effective 1 January 2025</p>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-[#6a8aaa]">
            <p>We collect account and referral tracking data to run the affiliate program and process payouts.</p>
            <p>We do not sell affiliate personal data. Data is shared only with required processors/providers.</p>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "contact"} onClose={() => setModal(null)} max="max-w-lg">
        <div className="p-7">
          <h3 className="text-xl font-semibold">Get in touch</h3>
          <div className="mt-4 space-y-2 text-sm text-[#6a8aaa]">
            <p>
              <strong className="text-[#0f2744]">Affiliate enquiries:</strong> affiliates@intaleks.com
            </p>
            <p>
              <strong className="text-[#0f2744]">Privacy enquiries:</strong> privacy@intaleks.com
            </p>
            <p>
              <strong className="text-[#0f2744]">Office:</strong> Perth, Western Australia
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
