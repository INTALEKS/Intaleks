"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { api } from "@/lib/api";

type ModalKey = null | "register" | "login" | "forgot" | "terms" | "privacy" | "contact";

const faqs = [
  {
    q: "Can I refer my existing clients?",
    a: "Yes — there are no exclusions for existing clients. If you refer someone through your affiliate link and they complete a valuation, you earn the 25% commission.",
  },
  {
    q: "How does the 30-day cookie window work?",
    a: "Once someone clicks your referral link, a 30-day cookie is stored in their browser. If they return and complete their valuation at any point within 30 days — even after closing the browser — you earn the commission.",
  },
  {
    q: "What happens if a client requests a refund?",
    a: "If a referred client receives a refund within the applicable refund window, the associated commission will be reversed. Commissions are confirmed and paid only after the refund window has closed.",
  },
  {
    q: "Is there a cap on how much I can earn?",
    a: "No cap. Refer as many clients as you like — every confirmed valuation earns you 25% with no upper limit.",
  },
  {
    q: "When and how do I get paid?",
    a: "Payouts are processed within 5 business days of a commission being confirmed. The minimum payout threshold is $250 AUD. Payment method details are confirmed in your affiliate dashboard once approved.",
  },
  {
    q: "Can I promote Intaleks on social media?",
    a: "Yes — LinkedIn, Instagram, X, email newsletters, websites, podcasts, and direct client outreach are all permitted. Please review the affiliate terms for any specific content guidelines.",
  },
  {
    q: "Is there an exclusivity clause?",
    a: "No. You're free to promote other products and services alongside Intaleks. We don't require exclusivity from our affiliates.",
  },
  {
    q: "Which countries can I refer clients from?",
    a: "Intaleks currently serves Australia, United States, United Kingdom, Canada, China, and Indonesia. Referrals from any of these six markets are eligible for the 25% commission.",
  },
];

function mainAppUrl() {
  return process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "https://intaleks.com";
}

function Modal({ open, onClose, children, max = "max-w-2xl" }: { open: boolean; onClose: () => void; children: React.ReactNode; max?: string }) {
  if (!open) return null;
  return (
    <div className="marketing-modal-overlay" onClick={onClose}>
      <div className={`marketing-modal ${max}`} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="marketing-modal-close" onClick={onClose}>
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

  // Calculator states
  const [referrals, setReferrals] = useState(5);
  const [fee, setFee] = useState(299);

  // Dynamic calculations
  const commissionPerValuation = useMemo(() => fee * 0.25, [fee]);
  const monthlyEarnings = useMemo(() => referrals * commissionPerValuation, [referrals, commissionPerValuation]);
  const annualEarnings = useMemo(() => monthlyEarnings * 12, [monthlyEarnings]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/auth/me")
      .then((res) => {
        if (!cancelled && res.data?.user) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        // Not authenticated — stay on landing page
      });
    return () => {
      cancelled = true;
    };
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

  return (
    <div className="marketing-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

        .marketing-body {
          --bg0:#f8fafc;
          --bg1:#ffffff;
          --bg2:#f1f5f9;
          --bg3:#e2e8f0;
          --bg4:#cbd5e1;
          --blue:#3b82f6;
          --blue-dim:rgba(59, 130, 246, 0.08);
          --blue-border:rgba(59, 130, 246, 0.18);
          --blue-hover:#2563eb;
          --white:#0f2744;
          --fog:#334155;
          --mist:#475569;
          --smoke:#64748b;
          --border:rgba(15,39,68,0.07);
          --border2:rgba(15,39,68,0.13);
          --ff-serif:'DM Serif Display',Georgia,serif;
          --ff-sans:'DM Sans',sans-serif;
          --ff-mono:'DM Mono',monospace;
          --radius:8px;
          --radius-lg:14px;

          background:var(--bg0);
          color:var(--white);
          font-family:var(--ff-sans);
          font-size:16px;
          line-height:1.65;
          -webkit-font-smoothing:antialiased;
          overflow-x:hidden;
          min-height: 100vh;
        }

        .marketing-body * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .marketing-body .container {
          max-width:1140px;
          margin:0 auto;
          padding:0 48px;
        }

        .marketing-body .sec-eyebrow {
          font-family:var(--ff-mono);
          font-size:10.5px;
          letter-spacing:.18em;
          color:var(--blue);
          text-transform:uppercase;
          display:block;
          margin-bottom:14px;
        }

        .marketing-body .teal {
          color:var(--blue);
        }

        .marketing-body section {
          padding:96px 0;
          position:relative;
        }

        .marketing-body a {
          text-decoration:none;
        }

        .marketing-body .btn {
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:12px 26px;
          border-radius:var(--radius);
          font-family:var(--ff-sans);
          font-size:14px;
          font-weight:500;
          cursor:pointer;
          transition:all .2s ease;
          border:none;
          white-space:nowrap;
        }

        .marketing-body .btn-primary {
          background:var(--blue);
          color:#fff;
        }

        .marketing-body .btn-primary:hover {
          background:var(--blue-hover);
          transform:translateY(-1px);
        }

        .marketing-body .btn-ghost {
          background:transparent;
          color:var(--fog);
          border:1px solid var(--border2);
        }

        .marketing-body .btn-ghost:hover {
          background:var(--blue-dim);
          border-color:var(--blue);
          color:var(--blue);
        }

        .marketing-body nav {
          position:fixed;
          top:0;
          left:0;
          right:0;
          z-index:100;
          background:rgba(255,255,255,.94);
          backdrop-filter:blur(16px);
          border-bottom:1px solid var(--border);
        }

        .marketing-body .nav-inner {
          max-width:1140px;
          margin:0 auto;
          padding:0 48px;
          height:64px;
          display:flex;
          align-items:center;
          gap:0;
        }

        .marketing-body .nav-logo {
          display:flex;
          align-items:center;
          margin-right:auto;
        }

        .marketing-body .nav-logo img {
          height:28px;
          width:auto;
        }

        .marketing-body .nav-links {
          display:flex;
          align-items:center;
          gap:8px;
          margin-right:32px;
        }

        .marketing-body .nav-links a {
          font-size:14px;
          color:var(--mist);
          padding:6px 12px;
          border-radius:6px;
          transition:color .15s;
        }

        .marketing-body .nav-links a:hover {
          color:var(--white);
        }

        .marketing-body .nav-actions {
          display:flex;
          align-items:center;
          gap:10px;
        }

        .marketing-body .nav-actions .btn {
          padding:9px 20px;
          font-size:13px;
        }

        .marketing-body #hero {
          padding:0;
          min-height:100vh;
          display:grid;
          grid-template-columns:1fr 1fr;
          position:relative;
          overflow:hidden;
        }

        .marketing-body #hero::before {
          content:'';
          position:absolute;
          inset:0;
          background-image:
            linear-gradient(rgba(59,143,232,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(59,143,232,.04) 1px,transparent 1px);
          background-size:60px 60px;
          pointer-events:none;
        }

        .marketing-body .hero-left {
          display:flex;
          flex-direction:column;
          justify-content:center;
          padding:120px 20px 80px 48px;
          position:relative;
          z-index:2;
        }

        .marketing-body .hero-badge {
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:var(--blue-dim);
          border:1px solid var(--blue-border);
          border-radius:99px;
          padding:6px 14px;
          font-size:12px;
          color:var(--blue);
          font-family:var(--ff-mono);
          letter-spacing:.08em;
          text-transform:uppercase;
          margin-bottom:28px;
          width:fit-content;
        }

        .marketing-body .hero-badge span {
          width:6px;
          height:6px;
          border-radius:50%;
          background:var(--blue);
          display:block;
          animation:marketingPulse 2s infinite;
        }

        @keyframes marketingPulse {
          0%,100%{opacity:1}
          50%{opacity:.4}
        }

        .marketing-body .hero-left h1 {
          font-family:var(--ff-serif);
          font-size:clamp(42px,5vw,64px);
          font-weight:400;
          line-height:1.08;
          color:var(--white);
          margin-bottom:22px;
        }

        .marketing-body .hero-left h1 em {
          font-style:normal;
          color:var(--blue);
        }

        .marketing-body .hero-left p {
          font-size:17px;
          color:var(--mist);
          max-width:480px;
          margin-bottom:36px;
          line-height:1.7;
        }

        .marketing-body .hero-ctas {
          display:flex;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:56px;
        }

        .marketing-body .hero-stats {
          display:flex;
          gap:0;
          border:1px solid var(--border);
          border-radius:var(--radius-lg);
          background:var(--bg1);
          overflow:hidden;
        }

        .marketing-body .hstat {
          flex:1;
          padding:18px 22px;
          border-right:1px solid var(--border);
        }

        .marketing-body .hstat:last-child {
          border-right:none;
        }

        .marketing-body .hstat-num {
          font-family:var(--ff-serif);
          font-size:28px;
          color:var(--white);
          line-height:1;
          margin-bottom:4px;
        }

        .marketing-body .hstat-num.blue {
          color:var(--blue);
        }

        .marketing-body .hstat-label {
          font-family:var(--ff-mono);
          font-size:9.5px;
          letter-spacing:.14em;
          color:var(--mist);
          text-transform:uppercase;
        }

        .marketing-body .hero-right {
          position:relative;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:64px 20px 64px 48px;
          background:radial-gradient(circle at 60% 50%, rgba(59,143,232,0.1), transparent 60%);
        }

        .marketing-body .aleks-card {
          position:absolute;
          bottom:40px;
          left:40px;
          z-index:3;
          background:rgba(11,23,40,.92);
          backdrop-filter:blur(12px);
          border:1px solid var(--border2);
          border-radius:var(--radius-lg);
          padding:16px 20px;
          display:flex;
          align-items:center;
          gap:14px;
          max-width:300px;
        }

        .marketing-body .aleks-card img {
          width:44px;
          height:44px;
          border-radius:50%;
          object-fit:cover;
          object-position:top;
          border:2px solid var(--blue);
        }

        .marketing-body .aleks-card-name {
          font-size:13px;
          font-weight:600;
          color:var(--white);
          margin-bottom:2px;
        }

        .marketing-body .aleks-card-role {
          font-size:12px;
          color:var(--mist);
        }

        .marketing-body .aleks-card-badge {
          display:inline-block;
          margin-top:6px;
          background:var(--blue-dim);
          border:1px solid var(--blue-border);
          border-radius:99px;
          padding:2px 10px;
          font-size:10px;
          color:var(--blue);
          font-family:var(--ff-mono);
        }

        .marketing-body #countries {
          padding:70px 0;
          background:#0f2744;
          border-top:1px solid rgba(255,255,255,0.08);
          border-bottom:1px solid rgba(255,255,255,0.08);
        }

        .marketing-body .countries-inner {
          display:flex;
          align-items:center;
          gap:48px;
          flex-wrap:wrap;
        }

        .marketing-body .countries-label {
          font-family:var(--ff-mono);
          font-size:10px;
          letter-spacing:.14em;
          color:rgba(255,255,255,0.5);
          text-transform:uppercase;
          white-space:nowrap;
          flex-shrink:0;
        }

        .marketing-body .countries-row {
          display:flex;
          align-items:center;
          gap:24px;
          flex-wrap:wrap;
          flex:1;
        }

        .marketing-body .country-item {
          display:flex;
          align-items:center;
          gap:10px;
          font-size:14px;
          color:#ffffff;
          white-space:nowrap;
        }

        .marketing-body .country-item img {
          width:28px;
          height:20px;
          object-fit:cover;
          border-radius:3px;
          border:1px solid rgba(255,255,255,0.15);
        }

        .marketing-body .countries-note {
          font-size:12px;
          color:rgba(255,255,255,0.4);
          margin-top:18px;
          font-style:italic;
          padding: 0 48px;
          max-width: 1140px;
          margin-left: auto;
          margin-right: auto;
        }

        .marketing-body #who {
          background:var(--bg0);
        }

        .marketing-body .section-head {
          margin-bottom:56px;
        }

        .marketing-body .section-head h2 {
          font-family:var(--ff-serif);
          font-size:clamp(34px,4.5vw,52px);
          font-weight:400;
          line-height:1.1;
          margin-bottom:14px;
        }

        .marketing-body .section-head p {
          font-size:17px;
          color:var(--mist);
          max-width:520px;
          line-height:1.7;
        }

        .marketing-body .who-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:16px;
        }

        .marketing-body .who-card {
          background:var(--bg1);
          border:1px solid var(--border);
          border-radius:var(--radius-lg);
          padding:28px;
          transition:border-color .2s,background .2s,transform .2s;
          position:relative;
          overflow:hidden;
        }

        .marketing-body .who-card::after {
          content:'';
          position:absolute;
          top:0;
          left:0;
          right:0;
          height:2px;
          background:var(--blue);
          opacity:0;
          transition:opacity .2s;
        }

        .marketing-body .who-card:hover {
          border-color:var(--border2);
          background:var(--bg2);
          transform:translateY(-2px);
        }

        .marketing-body .who-card:hover::after {
          opacity:1;
        }

        .marketing-body .who-icon {
          width:42px;
          height:42px;
          border-radius:10px;
          background:var(--blue-dim);
          border:1px solid var(--blue-border);
          display:flex;
          align-items:center;
          justify-content:center;
          margin-bottom:18px;
          color:var(--blue);
        }

        .marketing-body .who-card h3 {
          font-size:15px;
          font-weight:600;
          margin-bottom:8px;
        }

        .marketing-body .who-card p {
          font-size:13.5px;
          color:var(--mist);
          line-height:1.65;
        }

        .marketing-body .who-open-note {
          margin-top:40px;
          padding:20px 26px;
          background:var(--blue-dim);
          border:1px solid var(--blue-border);
          border-radius:var(--radius-lg);
          display:flex;
          align-items:flex-start;
          gap:14px;
          font-size:14.5px;
          color:var(--fog);
          line-height:1.6;
        }

        .marketing-body .who-open-note svg {
          flex-shrink:0;
          margin-top:2px;
        }

        .marketing-body #how {
          background:var(--bg1);
          border-top:1px solid var(--border);
          border-bottom:1px solid var(--border);
        }

        .marketing-body .steps-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:0;
          margin-top:56px;
        }

        .marketing-body .step {
          padding:0 28px;
          border-right:1px solid var(--border);
          position:relative;
        }

        .marketing-body .step:first-child {
          padding-left:0;
        }

        .marketing-body .step:last-child {
          border-right:none;
        }

        .marketing-body .step-num {
          font-family:var(--ff-serif);
          font-size:44px;
          color:var(--blue);
          line-height:1;
          margin-bottom:20px;
        }

        .marketing-body .step-tag {
          display:inline-block;
          font-family:var(--ff-mono);
          font-size:9.5px;
          letter-spacing:.1em;
          padding:3px 9px;
          border-radius:99px;
          background:var(--blue-dim);
          color:var(--blue);
          border:1px solid var(--blue-border);
          text-transform:uppercase;
          margin-bottom:12px;
        }

        .marketing-body .step h3 {
          font-size:16px;
          font-weight:600;
          margin-bottom:10px;
          line-height:1.3;
        }

        .marketing-body .step p {
          font-size:13.5px;
          color:var(--mist);
          line-height:1.65;
        }

        .marketing-body #calculator {
          background:var(--bg0);
        }

        .marketing-body .calc-wrap {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:72px;
          align-items:start;
          margin-top:56px;
        }

        .marketing-body .calc-row {
          margin-bottom:36px;
        }

        .marketing-body .calc-row-top {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:12px;
        }

        .marketing-body .calc-row-top span {
          font-size:14px;
          color:var(--fog);
          font-weight:500;
        }

        .marketing-body .calc-chip {
          font-family:var(--ff-mono);
          font-size:13px;
          color:var(--blue);
          background:var(--blue-dim);
          border:1px solid var(--blue-border);
          padding:3px 10px;
          border-radius:6px;
        }

        .marketing-body input[type=range] {
          -webkit-appearance:none;
          appearance:none;
          width:100%;
          height:3px;
          background:var(--bg3);
          border-radius:99px;
          outline:none;
          cursor:pointer;
        }

        .marketing-body input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none;
          width:18px;
          height:18px;
          border-radius:50%;
          background:var(--blue);
          border:3px solid var(--bg1);
          cursor:pointer;
          box-shadow:0 0 0 1px rgba(59,143,232,.5);
          transition:transform .15s;
        }

        .marketing-body input[type=range]::-webkit-slider-thumb:hover {
          transform:scale(1.15);
        }

        .marketing-body .range-ends {
          display:flex;
          justify-content:space-between;
          font-size:11px;
          color:var(--smoke);
          margin-top:6px;
        }

        .marketing-body .calc-note {
          background:var(--bg1);
          border:1px solid var(--border);
          border-radius:var(--radius-lg);
          padding:18px 22px;
          font-size:13.5px;
          color:var(--mist);
          line-height:1.65;
          margin-top:8px;
        }

        .marketing-body .calc-note strong {
          color:var(--blue);
        }

        .marketing-body .calc-panel {
          background:var(--bg1);
          border:1px solid var(--border);
          border-radius:var(--radius-lg);
          padding:36px;
          position:sticky;
          top:80px;
        }

        .marketing-body .calc-panel-title {
          font-family:var(--ff-mono);
          font-size:10px;
          letter-spacing:.15em;
          text-transform:uppercase;
          color:var(--mist);
          margin-bottom:28px;
        }

        .marketing-body .earn-row {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:12px 0;
          border-bottom:1px solid var(--border);
        }

        .marketing-body .earn-row:last-of-type {
          border-bottom:none;
        }

        .marketing-body .earn-label {
          font-size:13.5px;
          color:var(--mist);
        }

        .marketing-body .earn-val {
          font-family:var(--ff-mono);
          font-size:15px;
          color:var(--fog);
        }

        .marketing-body .earn-big {
          margin:24px 0 20px;
          padding:28px 24px;
          text-align:center;
          background:linear-gradient(135deg,rgba(59,143,232,.1),rgba(59,143,232,.05));
          border:1px solid var(--blue-border);
          border-radius:var(--radius-lg);
        }

        .marketing-body .earn-big-eyebrow {
          font-family:var(--ff-mono);
          font-size:9.5px;
          letter-spacing:.15em;
          text-transform:uppercase;
          color:var(--mist);
          margin-bottom:8px;
        }

        .marketing-body .earn-big-num {
          font-family:var(--ff-serif);
          font-size:58px;
          color:var(--blue);
          line-height:1;
          margin-bottom:4px;
        }

        .marketing-body .earn-big-sub {
          font-size:12px;
          color:var(--mist);
        }

        .marketing-body .calc-disclaimer {
          font-size:11.5px;
          color:var(--smoke);
          line-height:1.6;
          margin-top:16px;
          text-align:center;
        }

        .marketing-body #dashboard {
          background:var(--bg1);
          border-top:1px solid var(--border);
          border-bottom:1px solid var(--border);
        }

        .marketing-body .dash-wrap {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:16px;
          margin-top:56px;
        }

        .marketing-body .dash-feat {
          background:var(--bg1);
          border:1px solid var(--border);
          border-radius:var(--radius-lg);
          padding:28px;
          display:flex;
          flex-direction:column;
          gap:16px;
          transition:border-color .2s,background .2s,transform .2s;
          position:relative;
          overflow:hidden;
        }

        .marketing-body .dash-feat::after {
          content:'';
          position:absolute;
          top:0;
          left:0;
          right:0;
          height:2px;
          background:var(--blue);
          opacity:0;
          transition:opacity .2s;
        }

        .marketing-body .dash-feat:hover {
          border-color:var(--border2);
          background:var(--bg2);
          transform:translateY(-2px);
        }

        .marketing-body .dash-feat:hover::after {
          opacity:1;
        }

        .marketing-body .dash-feat-icon {
          width:36px;
          height:36px;
          border-radius:8px;
          background:var(--blue-dim);
          border:1px solid var(--blue-border);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--blue);
          flex-shrink:0;
        }

        .marketing-body .dash-feat h4 {
          font-size:15px;
          font-weight:600;
          margin-bottom:8px;
        }

        .marketing-body .dash-feat p {
          font-size:13.5px;
          color:var(--mist);
          line-height:1.65;
        }

        .marketing-body .dash-ui {
          background:var(--bg2);
          border:1px solid var(--border2);
          border-radius:14px;
          overflow:hidden;
          box-shadow:0 40px 80px rgba(0,0,0,.5);
        }

        .marketing-body .dash-bar {
          background:var(--bg3);
          border-bottom:1px solid var(--border);
          padding:11px 18px;
          display:flex;
          align-items:center;
          gap:6px;
        }

        .marketing-body .dot {
          width:10px;
          height:10px;
          border-radius:50%;
        }

        .marketing-body .dr { background:#ff5f57 }
        .marketing-body .dy { background:#ffbd2e }
        .marketing-body .dg { background:#28c840 }

        .marketing-body .dash-url-pill {
          margin-left:10px;
          font-family:var(--ff-mono);
          font-size:10px;
          color:var(--smoke);
          background:var(--bg0);
          padding:3px 10px;
          border-radius:4px;
          flex:1;
        }

        .marketing-body .dash-body {
          padding:18px;
        }

        .marketing-body .dash-period {
          font-family:var(--ff-mono);
          font-size:9.5px;
          color:var(--mist);
          letter-spacing:.1em;
          margin-bottom:12px;
        }

        .marketing-body .dash-stats {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:8px;
          margin-bottom:14px;
        }

        .marketing-body .dash-stat {
          background:var(--bg3);
          border:1px solid var(--border);
          border-radius:8px;
          padding:11px 13px;
        }

        .marketing-body .dash-stat-lbl {
          font-family:var(--ff-mono);
          font-size:8.5px;
          letter-spacing:.1em;
          color:var(--smoke);
          text-transform:uppercase;
          margin-bottom:5px;
        }

        .marketing-body .dash-stat-val {
          font-size:20px;
          font-weight:600;
          color:var(--white);
        }

        .marketing-body .dash-stat-val.g { color:#4bc97a }
        .marketing-body .dash-stat-val.b { color:var(--blue) }

        .marketing-body .dash-link {
          background:var(--bg3);
          border:1px solid var(--border);
          border-radius:8px;
          padding:11px 14px;
          margin-bottom:12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
        }

        .marketing-body .dash-link-lbl {
          font-family:var(--ff-mono);
          font-size:8.5px;
          letter-spacing:.08em;
          color:var(--smoke);
          text-transform:uppercase;
          margin-bottom:3px;
        }

        .marketing-body .dash-link-url {
          font-family:var(--ff-mono);
          font-size:11px;
          color:var(--blue);
        }

        .marketing-body .dash-copy {
          font-size:10px;
          padding:4px 10px;
          background:var(--blue-dim);
          border:1px solid var(--blue-border);
          border-radius:4px;
          color:var(--blue);
          cursor:pointer;
          flex-shrink:0;
        }

        .marketing-body .dash-th {
          display:grid;
          grid-template-columns:2fr 1fr 1fr 1fr;
          gap:6px;
          padding:7px 10px;
          font-family:var(--ff-mono);
          font-size:8.5px;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:var(--smoke);
          border-bottom:1px solid var(--border);
        }

        .marketing-body .dash-tr {
          display:grid;
          grid-template-columns:2fr 1fr 1fr 1fr;
          gap:6px;
          padding:8px 10px;
          font-size:11.5px;
          color:var(--fog);
          border-bottom:1px solid var(--border);
          align-items:center;
        }

        .marketing-body .dash-tr:last-child {
          border-bottom:none;
        }

        .marketing-body .sbadge {
          font-size:8.5px;
          padding:2px 7px;
          border-radius:99px;
          font-family:var(--ff-mono);
          text-transform:uppercase;
          letter-spacing:.06em;
        }

        .marketing-body .s-paid { background:rgba(75,201,122,.12); color:#4bc97a }
        .marketing-body .s-proc { background:rgba(59,143,232,.12); color:var(--blue) }
        .marketing-body .s-pend { background:rgba(255,189,46,.12); color:#ffbd2e }

        .marketing-body #assets {
          background:var(--bg0);
        }

        .marketing-body .assets-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-top:48px;
        }

        .marketing-body .asset-card {
          background:var(--bg1);
          border:1px solid var(--border);
          border-radius:var(--radius-lg);
          overflow:hidden;
          transition:border-color .2s,transform .2s;
        }

        .marketing-body .asset-card:hover {
          border-color:var(--border2);
          transform:translateY(-3px);
        }

        .marketing-body .asset-thumb {
          aspect-ratio:16/9;
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--blue);
          opacity:.95;
        }

        .marketing-body .at-email { background:linear-gradient(135deg,#e0f2fe,#bae6fd) }
        .marketing-body .at-banner { background:linear-gradient(135deg,#f0fdf4,#dcfce7) }
        .marketing-body .at-social { background:linear-gradient(135deg,#fdf2f8,#fbcfe8) }
        .marketing-body .at-copy { background:linear-gradient(135deg,#faf5ff,#f3e8ff) }

        .marketing-body .asset-meta {
          padding:14px 18px 18px;
        }

        .marketing-body .asset-type {
          font-family:var(--ff-mono);
          font-size:9.5px;
          letter-spacing:.1em;
          text-transform:uppercase;
          color:var(--mist);
          margin-bottom:5px;
        }

        .marketing-body .asset-name {
          font-size:14px;
          font-weight:600;
          color:var(--white);
          margin-bottom:3px;
        }

        .marketing-body .asset-desc {
          font-size:12px;
          color:var(--mist);
        }

        .marketing-body .assets-bottom {
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-top:32px;
          padding:20px 28px;
          background:var(--bg1);
          border:1px solid var(--border);
          border-radius:var(--radius-lg);
        }

        .marketing-body .assets-bottom p {
          font-size:14.5px;
          color:var(--fog);
          max-width:460px;
        }

        .marketing-body #founder {
          background:var(--bg1);
          border-top:1px solid var(--border);
          border-bottom:1px solid var(--border);
        }

        .marketing-body .founder-wrap {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:80px;
          align-items:center;
        }

        .marketing-body .founder-photo-wrap {
          position:relative;
        }

        .marketing-body .founder-photo {
          width:100%;
          border-radius:var(--radius-lg);
          object-fit:cover;
          object-position:top;
          aspect-ratio:4/5;
          filter:brightness(.92) saturate(.9);
          border:1px solid var(--border2);
        }

        .marketing-body .founder-badge-float {
          position:absolute;
          bottom:-16px;
          right:-16px;
          background:var(--bg2);
          border:1px solid var(--border2);
          border-radius:var(--radius-lg);
          padding:14px 18px;
          backdrop-filter:blur(10px);
        }

        .marketing-body .fbf-label {
          font-family:var(--ff-mono);
          font-size:9px;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:var(--mist);
          margin-bottom:4px;
        }

        .marketing-body .fbf-val {
          font-family:var(--ff-serif);
          font-size:28px;
          color:var(--blue);
          line-height:1;
        }

        .marketing-body .fbf-sub {
          font-size:11px;
          color:var(--mist);
          margin-top:2px;
        }

        .marketing-body .founder-quote {
          font-family:var(--ff-serif);
          font-size:clamp(24px,3vw,34px);
          font-weight:400;
          line-height:1.2;
          color:var(--white);
          margin-bottom:24px;
          font-style:italic;
        }

        .marketing-body .founder-body {
          font-size:15px;
          color:var(--mist);
          line-height:1.75;
          margin-bottom:28px;
        }

        .marketing-body .founder-sig {
          display:flex;
          align-items:center;
          gap:14px;
          padding-top:24px;
          border-top:1px solid var(--border);
        }

        .marketing-body .founder-sig img {
          width:48px;
          height:48px;
          border-radius:50%;
          object-fit:cover;
          object-position:top;
          border:2px solid var(--blue);
        }

        .marketing-body .sig-name {
          font-size:14px;
          font-weight:600;
          color:var(--white);
          margin-bottom:2px;
        }

        .marketing-body .sig-role {
          font-size:13px;
          color:var(--mist);
        }

        .marketing-body .sig-badges {
          display:flex;
          gap:6px;
          margin-top:6px;
          flex-wrap:wrap;
        }

        .marketing-body .sig-badge {
          font-family:var(--ff-mono);
          font-size:9.5px;
          padding:3px 9px;
          border-radius:99px;
          background:var(--blue-dim);
          border:1px solid var(--blue-border);
          color:var(--blue);
          letter-spacing:.06em;
        }

        .marketing-body #faq {
          background:var(--bg0);
        }

        .marketing-body .faq-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:0 64px;
          margin-top:56px;
        }

        .marketing-body .faq-item {
          border-bottom:1px solid var(--border);
          cursor:pointer;
        }

        .marketing-body .faq-q {
          padding:20px 0;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
          user-select:none;
        }

        .marketing-body .faq-q-text {
          font-size:15px;
          font-weight:500;
          color:var(--white);
          line-height:1.35;
        }

        .marketing-body .faq-icon {
          width:24px;
          height:24px;
          border-radius:50%;
          background:var(--bg2);
          border:1px solid var(--border2);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--mist);
          flex-shrink:0;
          font-size:16px;
          transition:background .2s,transform .25s,color .2s;
        }

        .marketing-body .faq-item.open .faq-icon {
          background:var(--blue-dim);
          color:var(--blue);
          transform:rotate(45deg);
        }

        .marketing-body .faq-a {
          font-size:13.5px;
          color:var(--mist);
          line-height:1.75;
          max-height:0;
          overflow:hidden;
          transition:max-height .35s ease,padding-bottom .25s;
          padding-bottom:0;
        }

        .marketing-body .faq-item.open .faq-a {
          max-height:220px;
          padding-bottom:20px;
        }

        .marketing-body #cta {
          text-align:center;
          padding:110px 48px;
          background:var(--bg1);
          border-top:1px solid var(--border);
          position:relative;
          overflow:hidden;
        }

        .marketing-body #cta::before {
          content:'';
          position:absolute;
          inset:0;
          background:radial-gradient(ellipse 70% 60% at 50% 100%,rgba(59,143,232,.1),transparent);
          pointer-events:none;
        }

        .marketing-body #cta h2 {
          font-family:var(--ff-serif);
          font-size:clamp(38px,5vw,62px);
          font-weight:400;
          line-height:1.08;
          max-width:700px;
          margin:0 auto 18px;
        }

        .marketing-body #cta p {
          font-size:17px;
          color:var(--mist);
          max-width:460px;
          margin:0 auto 40px;
        }

        .marketing-body .cta-btns {
          display:flex;
          gap:14px;
          justify-content:center;
          flex-wrap:wrap;
        }

        .marketing-body .cta-note {
          margin-top:22px;
          font-size:13px;
          color:var(--smoke);
          display:flex;
          align-items:center;
          justify-content:center;
          gap:7px;
        }

        .marketing-body footer {
          background:var(--bg0);
          border-top:1px solid var(--border);
          padding:64px 0 40px;
        }

        .marketing-body .footer-grid {
          display:grid;
          grid-template-columns:2fr 1fr 1fr 1fr;
          gap:48px;
          margin-bottom:48px;
        }

        .marketing-body .footer-logo-wrap {
          margin-bottom:14px;
        }

        .marketing-body .footer-logo-wrap img {
          height:24px;
          width:auto;
          opacity:.9;
        }

        .marketing-body .footer-tagline {
          font-size:13.5px;
          color:var(--mist);
          line-height:1.65;
          max-width:230px;
        }

        .marketing-body .footer-email {
          display:inline-block;
          margin-top:12px;
          font-size:13px;
          color:var(--mist);
          transition:color .15s;
        }

        .marketing-body .footer-email:hover {
          color:var(--white);
        }

        .marketing-body .footer-col h4 {
          font-family:var(--ff-mono);
          font-size:10px;
          letter-spacing:.1em;
          text-transform:uppercase;
          color:var(--fog);
          font-weight:600;
          margin-bottom:16px;
        }

        .marketing-body .footer-col ul {
          list-style:none;
        }

        .marketing-body .footer-col li {
          margin-bottom:10px;
        }

        .marketing-body .footer-col a {
          font-size:13.5px;
          color:var(--mist);
          transition:color .15s;
        }

        .marketing-body .footer-col a:hover {
          color:var(--white);
        }

        .marketing-body .footer-bottom {
          border-top:1px solid var(--border);
          padding-top:28px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          font-size:12.5px;
          color:var(--smoke);
        }

        .marketing-body .footer-legal {
          display:flex;
          gap:24px;
        }

        .marketing-body .footer-legal a {
          color:var(--smoke);
          transition:color .15s;
        }

        .marketing-body .footer-legal a:hover {
          color:var(--mist);
        }

        /* responsive media queries */
        @media(max-width:1024px){
          .marketing-body #hero {
            grid-template-columns:1fr;
            min-height:auto;
          }
          .marketing-body .hero-left {
            padding:100px 48px 60px;
          }
          .marketing-body .hero-right {
            height:auto;
            padding:60px 48px;
          }
          .marketing-body .who-grid {
            grid-template-columns:repeat(2,1fr);
          }
          .marketing-body .steps-grid {
            grid-template-columns:repeat(2,1fr);
            gap:32px;
          }
          .marketing-body .step {
            border-right:none;
            border-bottom:1px solid var(--border);
            padding:0 0 28px;
          }
          .marketing-body .step:last-child {
            border-bottom:none;
          }
          .marketing-body .calc-wrap {
            grid-template-columns:1fr;
            gap:40px;
          }
          .marketing-body .dash-wrap {
            grid-template-columns:1fr;
            gap:48px;
          }
          .marketing-body .founder-wrap {
            grid-template-columns:1fr;
            gap:48px;
          }
          .marketing-body .faq-grid {
            grid-template-columns:1fr;
            gap:0;
          }
          .marketing-body .footer-grid {
            grid-template-columns:1fr 1fr;
            gap:36px;
          }
          .marketing-body .assets-grid {
            grid-template-columns:repeat(2,1fr);
          }
          .marketing-body .assets-bottom {
            flex-direction:column;
            gap:16px;
            text-align:center;
          }
        }

        @media(max-width:600px){
          .marketing-body .container,
          .marketing-body .hero-left {
            padding-left:24px;
            padding-right:24px;
          }
          .marketing-body #cta {
            padding:80px 24px;
          }
          .marketing-body .who-grid,
          .marketing-body .assets-grid {
            grid-template-columns:1fr;
          }
          .marketing-body .footer-grid {
            grid-template-columns:1fr;
          }
          .marketing-body .footer-bottom {
            flex-direction:column;
            gap:12px;
            text-align:center;
          }
          .marketing-body .nav-links {
            display:none;
          }
          .marketing-body .hero-stats {
            flex-wrap:wrap;
          }
          .marketing-body .hstat {
            min-width:120px;
          }
        }

        /* ── MODALS ── */
        .marketing-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(3, 7, 18, 0.82);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .marketing-modal {
          position: relative;
          width: 100%;
          border-radius: var(--radius-lg);
          background: var(--bg1);
          border: 1px solid var(--border2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          color: var(--white);
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalSlideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .marketing-modal-close {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: var(--mist);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          z-index: 10;
          border-style: solid;
        }

        .marketing-modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--white);
          border-color: var(--border2);
        }

        .modal-grid-2 {
          display: grid;
          grid-template-columns: 280px 1fr;
        }

        @media(max-width: 768px) {
          .modal-grid-2 {
            grid-template-columns: 1fr;
          }
          .modal-sidebar {
            display: none;
          }
        }

        .modal-sidebar {
          background: linear-gradient(180deg, var(--bg2) 0%, var(--bg0) 100%);
          border-right: 1px solid var(--border);
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .modal-sidebar-logo {
          font-family: var(--ff-serif);
          font-size: 24px;
          font-weight: 500;
          color: var(--white);
        }

        .modal-sidebar-logo span {
          color: var(--blue);
        }

        .modal-sidebar-text {
          font-size: 14px;
          color: var(--mist);
          line-height: 1.6;
          margin-top: 24px;
        }

        .modal-content {
          padding: 40px;
        }

        .modal-title {
          font-family: var(--ff-serif);
          font-size: 28px;
          font-weight: 400;
          color: var(--white);
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .modal-desc {
          font-size: 15px;
          color: var(--mist);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        /* Terms / Privacy content formatting */
        .modal-scrollable {
          max-height: 60vh;
          overflow-y: auto;
          padding-right: 16px;
        }

        .modal-scrollable::-webkit-scrollbar {
          width: 6px;
        }

        .modal-scrollable::-webkit-scrollbar-track {
          background: transparent;
        }

        .modal-scrollable::-webkit-scrollbar-thumb {
          background: var(--border2);
          border-radius: 99px;
        }

        .modal-scrollable::-webkit-scrollbar-thumb:hover {
          background: var(--blue-border);
        }

        .modal-section {
          margin-bottom: 24px;
        }

        .modal-section h4 {
          font-family: var(--ff-sans);
          font-size: 15px;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 8px;
        }

        .modal-section p {
          font-size: 13.5px;
          color: var(--mist);
          line-height: 1.65;
          margin-bottom: 12px;
        }
      `}</style>

      {/* ══════ NAV ══════ */}
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">
            <a href="https://intaleks.com">
              <Image src="/intaleks.png" alt="Intaleks" width={120} height={28} className="h-[28px] w-auto object-contain" />
            </a>
          </div>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#calculator">Commission</a>
            <a href="#assets">Marketing assets</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setModal("login");
              }}
              className="btn btn-ghost"
            >
              Log in
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setModal("register");
              }}
              className="btn btn-primary"
            >
              Become an affiliate ↗
            </a>
          </div>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section id="hero">
        <div className="hero-left">
          <span className="hero-badge">
            <span></span>Affiliate Programme
          </span>
          <h1>
            Earn <em>25%</em> on every business valuation you refer
          </h1>
          <p>Partner with the trusted platform used by business owners, advisors, and legal professionals across 6 countries — and earn every time your referrals complete a valuation.</p>
          <div className="hero-ctas">
            <button type="button" onClick={() => setModal("register")} className="btn btn-primary">
              Apply now — it&apos;s free ↗
            </button>
            <a href="#how" className="btn btn-ghost">
              See how it works
            </a>
          </div>
          <div className="hero-stats">
            <div className="hstat">
              <div className="hstat-num blue">25%</div>
              <div className="hstat-label">Flat commission</div>
            </div>
            <div className="hstat">
              <div className="hstat-num">$250</div>
              <div className="hstat-label">Min. payout</div>
            </div>
            <div className="hstat">
              <div className="hstat-num">30-day</div>
              <div className="hstat-label">Cookie window</div>
            </div>
            <div className="hstat">
              <div className="hstat-num">5 days</div>
              <div className="hstat-label">Payout turnaround</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="dash-ui w-full max-w-[480px]">
            <div className="dash-bar">
              <div className="dot dr"></div>
              <div className="dot dy"></div>
              <div className="dot dg"></div>
              <div className="dash-url-pill">affiliate.intaleks.com/dashboard</div>
            </div>
            <div className="dash-body text-left">
              <div className="dash-period">OVERVIEW — MAY 2026</div>
              <div className="dash-stats">
                <div className="dash-stat text-left">
                  <div className="dash-stat-lbl">Clicks</div>
                  <div className="dash-stat-val">1248</div>
                </div>
                <div className="dash-stat text-left">
                  <div className="dash-stat-lbl">Converted</div>
                  <div className="dash-stat-val b">20</div>
                </div>
                <div className="dash-stat text-left">
                  <div className="dash-stat-lbl">Earned</div>
                  <div className="dash-stat-val g">$2475</div>
                </div>
              </div>
              <div className="dash-link text-left">
                <div>
                  <div className="dash-link-lbl">Your referral link</div>
                  <div className="dash-link-url">intaleks.com?ref=ALEKS</div>
                </div>
                <div className="dash-copy">Copy link</div>
              </div>
              <div className="dash-th">
                <span>Client</span>
                <span>Fee</span>
                <span>Commission</span>
                <span>Status</span>
              </div>
              <div className="dash-tr">
                <span>Redacted Ltd</span>
                <span>$495</span>
                <span>$123.75</span>
                <span>
                  <span className="sbadge s-paid">Paid</span>
                </span>
              </div>
              <div className="dash-tr">
                <span>Venture Co.</span>
                <span>$495</span>
                <span>$123.75</span>
                <span>
                  <span className="sbadge s-proc">Processing</span>
                </span>
              </div>
              <div className="dash-tr">
                <span>SME Group</span>
                <span>$495</span>
                <span>$123.75</span>
                <span>
                  <span className="sbadge s-pend">Pending</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ COUNTRIES ══════ */}
      <section id="countries">
        <div className="container">
          <div className="countries-inner">
            <div className="countries-label">Markets we serve</div>
            <div className="countries-row">
              <div className="country-item">
                <img src="https://flagcdn.com/w80/au.png" alt="Australia" />
                <span>Australia</span>
              </div>
              <div className="country-item">
                <img src="https://flagcdn.com/w80/us.png" alt="United States" />
                <span>United States</span>
              </div>
              <div className="country-item">
                <img src="https://flagcdn.com/w80/gb.png" alt="United Kingdom" />
                <span>United Kingdom</span>
              </div>
              <div className="country-item">
                <img src="https://flagcdn.com/w80/ca.png" alt="Canada" />
                <span>Canada</span>
              </div>
              <div className="country-item">
                <img src="https://flagcdn.com/w80/cn.png" alt="China" />
                <span>China</span>
              </div>
              <div className="country-item">
                <img src="https://flagcdn.com/w80/id.png" alt="Indonesia" />
                <span>Indonesia</span>
              </div>
            </div>
          </div>
        </div>
        <p className="countries-note">Valuation multiples and industry data tailored to each local market. Referrals from all six countries are eligible for commission.</p>
      </section>

      {/* ══════ WHO IS THIS FOR ══════ */}
      <section id="who">
        <div className="container">
          <span className="sec-eyebrow">Who qualifies</span>
          <div className="section-head">
            <h2>
              Built for professionals who
              <br />
              advise business owners
            </h2>
            <p>If your clients ever ask &quot;what is my business worth?&quot; — you should be earning every time they find out.</p>
          </div>
          <div className="who-grid">
            <div className="who-card">
              <div className="who-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
              </div>
              <h3>Business Brokers</h3>
              <p>You&apos;re already in deal flow. Every listing you manage is a client who needs to know what their business is worth — now you earn when they find out.</p>
            </div>

            <div className="who-card">
              <div className="who-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3>Accountants &amp; CPAs</h3>
              <p>Your SME clients trust you with their numbers. Refer them to Intaleks for a fast, credible valuation — you earn 25%, they get the clarity they need.</p>
            </div>

            <div className="who-card">
              <div className="who-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3>Commercial Lawyers</h3>
              <p>Separations, shareholder disputes, estate planning — every one of these needs a credible valuation. Intaleks makes it accessible and fast for your clients.</p>
            </div>

            <div className="who-card">
              <div className="who-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>Financial Advisors</h3>
              <p>Business equity is often the largest asset in a client&apos;s portfolio. Refer them to Intaleks and earn while helping them understand their true position.</p>
            </div>

            <div className="who-card">
              <div className="who-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3>Mortgage Brokers</h3>
              <p>Business owners borrowing against their company need a valuation first. You&apos;re already the trusted link — Intaleks makes the referral effortless.</p>
            </div>

            <div className="who-card">
              <div className="who-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <h3>Business Consultants</h3>
              <p>If you advise SME owners on strategy, exits, or growth — a valuation is often the natural starting point of that conversation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how">
        <div className="container">
          <span className="sec-eyebrow">The process</span>
          <div className="section-head">
            <h2>
              From application to
              <br />
              your first payment
            </h2>
            <p>Four steps. Apply once — and earn on every valuation your referrals complete.</p>
          </div>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">01</div>
              <span className="step-tag">One-time</span>
              <h3>Apply — it&apos;s free</h3>
              <p>Submit your affiliate application in under two minutes. Tell us about your audience and how you plan to refer clients to Intaleks.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <span className="step-tag">24–48 hrs</span>
              <h3>Get approved</h3>
              <p>Our team reviews every application personally. You&apos;ll receive a decision by email — most applications are approved within 48 hours of submission.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <span className="step-tag">Ongoing</span>
              <h3>Share your unique link</h3>
              <p>Access your affiliate dashboard, copy your personal referral link, and share it — via email, your website, social media, or directly with clients.</p>
            </div>
            <div className="step">
              <div className="step-num">04</div>
              <span className="step-tag">Every referral</span>
              <h3>Earn 25% commission</h3>
              <p>Every time a referred client completes a valuation through Intaleks, you earn 25% — tracked automatically and paid within 5 business days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ EARNINGS CALCULATOR ══════ */}
      <section id="calculator">
        <div className="container">
          <span className="sec-eyebrow">Earnings estimator</span>
          <div className="section-head">
            <h2>
              See what 25% actually
              <br />
              looks like in your account
            </h2>
            <p>Adjust the sliders to estimate your potential earnings based on how many clients you refer each month.</p>
          </div>
          <div className="calc-wrap">
            <div className="calc-controls">
              <div className="calc-row">
                <div className="calc-row-top">
                  <span>Referrals per month</span>
                  <span className="calc-chip" id="refs-chip">
                    {referrals} referrals
                  </span>
                </div>
                <input type="range" id="refs" min="1" max="30" value={referrals} step="1" onChange={(e) => setReferrals(Number(e.target.value))} />
                <div className="range-ends">
                  <span>1</span>
                  <span>30</span>
                </div>
              </div>
              <div className="calc-row">
                <div className="calc-row-top">
                  <span>Average valuation fee (AUD)</span>
                  <span className="calc-chip" id="fee-chip">
                    ${fee}
                  </span>
                </div>
                <input type="range" id="fee" min="100" max="1000" value={fee} step="1" onChange={(e) => setFee(Number(e.target.value))} />
                <div className="range-ends">
                  <span>$100</span>
                  <span>$1,000</span>
                </div>
              </div>
              <div className="calc-note">
                Intaleks charges a <strong>one-off fee</strong> per valuation — no subscriptions, no recurring billing. Your 25% commission applies to each completed, confirmed valuation your referral link generates. The <strong>30-day cookie window</strong> means you earn even if your referral signs up a month after clicking your link.
              </div>
            </div>

            <div className="calc-panel">
              <div className="calc-panel-title">Your estimated earnings</div>
              <div className="earn-row">
                <span className="earn-label">Commission per valuation</span>
                <span className="earn-val" id="per-val">
                  ${commissionPerValuation.toFixed(2)}
                </span>
              </div>
              <div className="earn-row">
                <span className="earn-label">Referrals this month</span>
                <span className="earn-val" id="ref-ct">
                  × {referrals}
                </span>
              </div>
              <div className="earn-big">
                <div className="earn-big-eyebrow">Monthly earnings estimate</div>
                <div className="earn-big-num" id="monthly">
                  ${Math.round(monthlyEarnings).toLocaleString()}
                </div>
                <div className="earn-big-sub">paid within 5 business days of confirmation</div>
              </div>
              <div className="earn-row">
                <span className="earn-label">Annual projection</span>
                <span className="earn-val" id="annual">
                  ${Math.round(annualEarnings).toLocaleString()}
                </span>
              </div>
              <div className="calc-disclaimer">Estimates only. Actual earnings depend on confirmed valuations. Minimum payout threshold: $250 AUD. Commissions reversed on refunds within the refund window.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ DASHBOARD PREVIEW ══════ */}
      <section id="dashboard">
        <div className="container">
          <span className="sec-eyebrow">Your affiliate portal</span>
          <div className="section-head">
            <h2>
              Everything you need to track
              <br />
              and grow your earnings
            </h2>
          </div>
          <div className="dash-wrap">
            <div className="dash-feat">
              <div className="dash-feat-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div>
                <h4>Your unique referral link</h4>
                <p>One personal URL with 30-day tracking. Share it anywhere — email, social, your website, or directly with clients. No technical setup needed.</p>
              </div>
            </div>
            <div className="dash-feat">
              <div className="dash-feat-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <h4>Real-time performance stats</h4>
                <p>See clicks, conversions, and commissions as they happen. Know exactly which referrals converted and when your payouts are due.</p>
              </div>
            </div>
            <div className="dash-feat">
              <div className="dash-feat-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div>
                <h4>Transparent payout history</h4>
                <p>Full records of every commission earned, pending, and paid. Your earnings are never a black box — everything is itemised clearly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ MARKETING ASSETS ══════ */}
      <section id="assets">
        <div className="container">
          <span className="sec-eyebrow">Marketing assets</span>
          <div className="section-head">
            <h2>
              Everything you need to promote
              <br />— already made for you
            </h2>
            <p>You don&apos;t start from scratch. The moment you&apos;re approved, a complete promotional kit is waiting in your dashboard.</p>
          </div>
          <div className="assets-grid">
            <div className="asset-card">
              <div className="asset-thumb at-email">
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="asset-meta">
                <div className="asset-type">Email</div>
                <div className="asset-name">Email templates</div>
                <div className="asset-desc">3 templates · ready to send to your clients</div>
              </div>
            </div>
            <div className="asset-card">
              <div className="asset-thumb at-banner">
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div className="asset-meta">
                <div className="asset-type">Display</div>
                <div className="asset-name">Web banners</div>
                <div className="asset-desc">6 sizes · PNG + SVG formats</div>
              </div>
            </div>
            <div className="asset-card">
              <div className="asset-thumb at-social">
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div className="asset-meta">
                <div className="asset-type">Social</div>
                <div className="asset-name">Social media posts</div>
                <div className="asset-desc">LinkedIn · Instagram · X · formatted</div>
              </div>
            </div>
            <div className="asset-card">
              <div className="asset-thumb at-copy">
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="asset-meta">
                <div className="asset-type">Copy</div>
                <div className="asset-name">Swipe copy</div>
                <div className="asset-desc">Short, medium &amp; long-form scripts</div>
              </div>
            </div>
          </div>
          <div className="assets-bottom">
            <p>All assets unlock the moment you&apos;re approved — available directly inside your affiliate dashboard.</p>
            <button type="button" onClick={() => setModal("login")} className="btn btn-ghost">
              Browse asset library →
            </button>
          </div>
        </div>
      </section>

      {/* ══════ FOUNDER / TRUST ══════ */}
      <section id="founder">
        <div className="container">
          <div className="founder-wrap">
            <div className="founder-photo-wrap">
              <img className="founder-photo" src="/founder.png" alt="Aleks Todorovic — Founder, Intaleks" />
              <div className="founder-badge-float">
                <div className="fbf-label">Experience</div>
                <div className="fbf-val">25+</div>
                <div className="fbf-sub">years in business valuation</div>
              </div>
            </div>
            <div className="founder-content">
              <span className="sec-eyebrow">A word from the founder</span>
              <div className="founder-quote">&quot;I&apos;ve seen how hard it is for business owners to access clear, reliable valuation guidance. Intaleks changes that — and our affiliate programme lets the professionals who know these owners best share in what we&apos;re building.&quot;</div>
              <p className="founder-body">I created Intaleks to make professional-grade valuation insights accessible to every business owner — without the barriers of cost, complexity, or delay. The affiliate programme is an extension of that mission: built for the accountants, brokers, lawyers, and advisors who are already trusted by the business owners who need this most.</p>
              <div className="founder-sig">
                <img src="/founder.png" alt="Aleks Todorovic" />
                <div>
                  <div className="sig-name">Aleks Todorovic</div>
                  <div className="sig-role">Founder, Intaleks · Principal, Executive Business Valuers</div>
                  <div className="sig-badges">
                    <span className="sig-badge">CA ANZ</span>
                    <span className="sig-badge">Sydney NSW</span>
                    <span className="sig-badge">25+ yrs experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section id="faq">
        <div className="container">
          <span className="sec-eyebrow">Questions &amp; answers</span>
          <div className="section-head">
            <h2>
              Everything you need to know
              <br />
              before you apply
            </h2>
          </div>
          <div className="faq-grid">
            <div>
              {faqs.slice(0, 4).map((item, index) => (
                <div key={item.q} className={`faq-item ${faqOpen === index ? "open" : ""}`} onClick={() => setFaqOpen(faqOpen === index ? null : index)}>
                  <div className="faq-q">
                    <span className="faq-q-text">{item.q}</span>
                    <span className="faq-icon">{faqOpen === index ? "×" : "+"}</span>
                  </div>
                  <div className="faq-a" style={{ transition: "max-height 0.35s ease, padding-bottom 0.25s", maxHeight: faqOpen === index ? "220px" : "0", paddingBottom: faqOpen === index ? "20px" : "0", overflow: "hidden" }}>
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
            <div>
              {faqs.slice(4, 8).map((item, index) => {
                const actualIndex = index + 4;
                return (
                  <div key={item.q} className={`faq-item ${faqOpen === actualIndex ? "open" : ""}`} onClick={() => setFaqOpen(faqOpen === actualIndex ? null : actualIndex)}>
                    <div className="faq-q">
                      <span className="faq-q-text">{item.q}</span>
                      <span className="faq-icon">{faqOpen === actualIndex ? "×" : "+"}</span>
                    </div>
                    <div className="faq-a" style={{ transition: "max-height 0.35s ease, padding-bottom 0.25s", maxHeight: faqOpen === actualIndex ? "220px" : "0", paddingBottom: faqOpen === actualIndex ? "20px" : "0", overflow: "hidden" }}>
                      {item.a}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section id="cta">
        <span className="sec-eyebrow">Ready to start earning?</span>
        <h2>
          Your next referral
          <br />
          should pay you
        </h2>
        <p>Apply in minutes. Get reviewed within 48 hours. Start earning 25% on every valuation you refer — no caps, no tiers, one flat rate.</p>
        <div className="cta-btns">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setModal("register");
            }}
            className="btn btn-primary"
          >
            Apply now — it&apos;s free ↗
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setModal("terms");
            }}
            className="btn btn-ghost"
          >
            Read affiliate terms
          </a>
        </div>
        <div className="cta-note">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Applications reviewed within 24–48 hours · No commitment or exclusivity required
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo-wrap">
                <Image src="/intaleks.png" alt="Intaleks" width={120} height={28} className="h-[28px] w-auto object-contain" />
              </div>
              <p className="footer-tagline">Professional business valuation — accessible to every business owner, everywhere.</p>
              <a href="mailto:admin@intaleks.com" className="footer-email">
                admin@intaleks.com
              </a>
            </div>
            <div className="footer-col">
              <h4>Programme</h4>
              <ul>
                <li>
                  <a href="#how">How it works</a>
                </li>
                <li>
                  <a href="#calculator">Commission</a>
                </li>
                <li>
                  <a href="#assets">Marketing assets</a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setModal("terms");
                    }}
                  >
                    Affiliate terms
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setModal("login");
                    }}
                  >
                    Affiliate dashboard
                  </a>
                </li>
                <li>
                  <a href="https://intaleks.com/valuation-sample.pdf" target="_blank" rel="noopener noreferrer">
                    Valuation sample
                  </a>
                </li>
                <li>
                  <a href="https://intaleks.com" target="_blank" rel="noopener noreferrer">
                    Visit Intaleks.com
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="https://intaleks.com/#about" target="_blank" rel="noopener noreferrer">
                    About Intaleks
                  </a>
                </li>
                <li>
                  <a href="https://intaleks.com/contact" target="_blank" rel="noopener noreferrer">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="https://intaleks.com/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a href="https://executivebusinessvaluers.com.au" target="_blank" rel="noopener noreferrer">
                    Executive Business Valuers
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Intaleks. All rights reserved.</span>
            <div className="footer-legal">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModal("terms");
                }}
              >
                Affiliate terms
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModal("privacy");
                }}
              >
                Privacy
              </a>
              <a href="https://intaleks.com/terms" target="_blank" rel="noopener noreferrer">
                Terms of use
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal open={modal === "register"} onClose={() => setModal(null)}>
        <div className="modal-grid-2">
          <div className="modal-sidebar">
            <div className="modal-sidebar-logo">
              intal<span>eks</span>
            </div>
            <div className="modal-sidebar-text">Create your affiliate account with your existing Intaleks identity.</div>
          </div>
          <div className="modal-content">
            <h3 className="modal-title">Become an affiliate</h3>
            <p className="modal-desc">Use the main Intaleks signup flow to submit your details and apply.</p>
            <a href={signupRedirectUrl} className="btn btn-primary">
              Continue to Sign Up
            </a>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "login"} onClose={() => setModal(null)}>
        <div className="modal-grid-2">
          <div className="modal-sidebar">
            <div className="modal-sidebar-logo">
              intal<span>eks</span>
            </div>
            <div className="modal-sidebar-text">Manage referrals, track commissions in real-time, and download your marketing kit.</div>
          </div>
          <div className="modal-content">
            <h3 className="modal-title">Affiliate login</h3>
            <p className="modal-desc">Sign in using your existing Intaleks account credentials to access your dashboard.</p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
              <a href={loginRedirectUrl} className="btn btn-primary">
                Continue to Login
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModal("forgot");
                }}
                style={{ fontSize: "13px", color: "var(--mist)", transition: "color 0.2s", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--mist)")}
              >
                Forgot password?
              </a>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "forgot"} onClose={() => setModal(null)} max="max-w-md">
        <div className="modal-content">
          <h3 className="modal-title">Reset password</h3>
          <p className="modal-desc">Password recovery is securely handled on the main Intaleks authentication service.</p>
          <a href={`${mainAppUrl()}/auth/forgot-password`} className="btn btn-primary">
            Open Password Reset
          </a>
        </div>
      </Modal>

      <Modal open={modal === "terms"} onClose={() => setModal(null)} max="max-w-3xl">
        <div className="modal-content">
          <h3 className="modal-title">Terms &amp; Conditions</h3>
          <p className="modal-desc" style={{ marginBottom: "24px" }}>
            Affiliate Programme · Effective 1 May 2026 · Version 1.1
          </p>
          <div className="modal-scrollable">
            <div className="modal-section">
              <h4>1. Enrollment &amp; Eligibility</h4>
              <p>By registering for the Intaleks Affiliate Programme, you represent and warrant that you are a qualified professional (such as a business broker, CPA, commercial lawyer, financial advisor, consultant, or mortgage broker) advising business owners, or that you have an established business audience. All applications are subject to manual administrative review and approval. We reserve the right to decline or terminate participation at our sole discretion.</p>
            </div>
            <div className="modal-section">
              <h4>2. Referral Tracking &amp; Attribution</h4>
              <p>Commissions are tracked using your unique affiliate referral link. When a prospect clicks your link, a tracking cookie is stored in their browser for a period of thirty (30) days. If the prospect completes a business valuation on the Intaleks platform within this 30-day window, the referral is automatically attributed to your account. We are not responsible for tracking failures due to cookie deletion, browser privacy settings, or ad-blocking software.</p>
            </div>
            <div className="modal-section">
              <h4>3. Commission Structure &amp; Fee Exclusions</h4>
              <p>Affiliates earn a flat 25% commission on the net valuation fee paid by referred clients. Net fees represent the gross amount collected less any local sales taxes, transaction processing charges, or discretionary discounts. Commission is only earned on confirmed, completed valuations. In the event that a referred client is granted a refund within our standard refund windows, any associated pending or paid commission will be reversed.</p>
            </div>
            <div className="modal-section">
              <h4>4. Payouts &amp; Minimum Thresholds</h4>
              <p>Payouts are processed within five (5) business days after a commission has been fully confirmed and cleared. The minimum payout threshold is $250 AUD. If your pending balance is below this threshold, the balance will roll over to the next billing cycle. Affiliates must confirm and maintain valid payout details (such as PayPal or Stripe information) in their affiliate portal dashboard to receive payments.</p>
            </div>
            <div className="modal-section">
              <h4>5. Permitted &amp; Prohibited Marketing Channels</h4>
              <p>You are permitted to promote Intaleks via professional social networks (e.g., LinkedIn, Instagram, X), email newsletters, website embeds, podcasts, and direct client advisory outreach. You are strictly prohibited from bidding on trademarked search terms (such as &quot;Intaleks&quot; or &quot;Intaleks valuation&quot;) in pay-per-click advertising, sending unsolicited bulk communications (spam), or making false, misleading, or unauthorized claims regarding the platform&apos;s capabilities or fees.</p>
            </div>
            <div className="modal-section">
              <h4>6. Independent Contractor Status &amp; Liability</h4>
              <p>Participation in the Affiliate Programme does not establish a partnership, joint venture, agency, or employment relationship between you and Intaleks. You act solely as an independent contractor. Under no circumstances shall Intaleks or its parent entities be liable for any indirect, incidental, special, or consequential damages arising out of your promotional activities or participation in the programme.</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "privacy"} onClose={() => setModal(null)} max="max-w-3xl">
        <div className="modal-content">
          <h3 className="modal-title">Privacy Policy</h3>
          <p className="modal-desc" style={{ marginBottom: "24px" }}>
            Effective 1 January 2025
          </p>
          <div className="modal-scrollable">
            <div className="modal-section">
              <h4>1. Data Collection</h4>
              <p>We collect account information, referral logs, click events, and payout details necessary to safely operate the affiliate programme and calculate conversions accurately.</p>
            </div>
            <div className="modal-section">
              <h4>2. Privacy Protection</h4>
              <p>We do not sell or lease affiliate personal data to third parties. Data is shared securely only with required infrastructure and processing providers (e.g., databases, payment processors) under strict confidentiality.</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "contact"} onClose={() => setModal(null)} max="max-w-lg">
        <div className="modal-content">
          <h3 className="modal-title">Get in touch</h3>
          <p className="modal-desc" style={{ marginBottom: "24px" }}>
            Have questions about the programme? We are here to help.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="modal-section" style={{ marginBottom: 0 }}>
              <h4>Affiliate Support</h4>
              <p style={{ margin: 0 }}>
                <a href="mailto:admin@intaleks.com" style={{ color: "var(--blue)" }}>
                  admin@intaleks.com
                </a>
              </p>
            </div>
            <div className="modal-section" style={{ marginBottom: 0 }}>
              <h4>Privacy Enquiries</h4>
              <p style={{ margin: 0 }}>
                <a href="mailto:privacy@intaleks.com" style={{ color: "var(--blue)" }}>
                  privacy@intaleks.com
                </a>
              </p>
            </div>
            <div className="modal-section" style={{ marginBottom: 0 }}>
              <h4>Main Headquarters</h4>
              <p style={{ margin: 0, color: "var(--mist)" }}>Sydney, New South Wales, Australia</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
