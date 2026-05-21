import type {
  AffiliateStat,
  ChatMessage,
  CommissionRow,
  FaqItem,
  MarketingAsset,
  NotificationPref,
  ReferralRow,
  TermsMeta,
  WithdrawalRow,
} from "@/lib/affiliate/types";

export const affiliateStats: AffiliateStat[] = [
  { label: "Total Earnings", value: "$4,287", detail: "+$612 this month", tone: "info" },
  { label: "Available Balance", value: "$1,740", detail: "Ready to withdraw", tone: "success" },
  { label: "Pending (3-day hold)", value: "$425", detail: "Unlocks Apr 4", tone: "warning" },
  { label: "Total Referrals", value: "19", detail: "12 converted", tone: "accent" },
];

export const referrals: ReferralRow[] = [
  { date: "28 Mar 2025", client: "R.T. ••••", plan: "Professional", planValue: "$699", commission: "$174.75", available: "Yes", status: "converted" },
  { date: "25 Mar 2025", client: "B.C. ••••", plan: "Enterprise", planValue: "$1,000", commission: "$250.00", available: "Apr 4", status: "pending" },
  { date: "19 Mar 2025", client: "K.N. ••••", plan: "Starter", planValue: "$299", commission: "$74.75", available: "Yes", status: "converted" },
  { date: "12 Mar 2025", client: "A.P. ••••", plan: "—", planValue: "—", commission: "—", available: "—", status: "lead" },
  { date: "5 Mar 2025", client: "S.L. ••••", plan: "Enterprise", planValue: "$1,000", commission: "$250.00", available: "Paid", status: "paid" },
  { date: "28 Feb 2025", client: "M.O. ••••", plan: "Starter", planValue: "$299", commission: "$74.75", available: "Yes", status: "converted" },
  { date: "20 Feb 2025", client: "T.W. ••••", plan: "—", planValue: "—", commission: "—", available: "—", status: "lead" },
  { date: "4 Apr 2025", client: "F.N. ••••", plan: "Professional", planValue: "$699", commission: "$174.75", available: "Apr 7", status: "pending" },
];

export const commissionLog: CommissionRow[] = [
  { date: "28 Mar", client: "R.T. ••••", plan: "Professional", planValue: "$699", rate: "25%", commission: "$174.75", status: "available" },
  { date: "25 Mar", client: "B.C. ••••", plan: "Enterprise", planValue: "$1,000", rate: "25%", commission: "$250.00", status: "hold" },
  { date: "19 Mar", client: "K.N. ••••", plan: "Starter", planValue: "$299", rate: "25%", commission: "$74.75", status: "available" },
  { date: "14 Feb", client: "C.H. ••••", plan: "Professional", planValue: "$699", rate: "25%", commission: "$174.75", status: "paid" },
];

export const withdrawals: WithdrawalRow[] = [
  { date: "14 Feb 2025", amount: "$500.00", method: "PayPal", reference: "PP-9823HX", status: "processed" },
  { date: "9 Jan 2025", amount: "$347.25", method: "PayPal", reference: "PP-7712AK", status: "processed" },
  { date: "28 Nov 2024", amount: "$700.00", method: "Stripe", reference: "STR-1129BZ", status: "processed" },
];

export const monthlyEarnings = [
  { month: "Oct", value: 287 },
  { month: "Nov", value: 524 },
  { month: "Dec", value: 348 },
  { month: "Jan", value: 612 },
  { month: "Feb", value: 499 },
  { month: "Mar", value: 612 },
];

export const planBreakdown = [
  { plan: "Enterprise", amount: 500, color: "var(--affiliate-navy)" },
  { plan: "Professional", amount: 524.25, color: "var(--affiliate-blue)" },
  { plan: "Starter", amount: 149.5, color: "var(--affiliate-sky)" },
];

export const marketingAssets: MarketingAsset[] = [
  { title: "Email banner", type: "PNG · 600×200px", preview: "email" },
  { title: "LinkedIn graphic", type: "PNG · 1200×628px", preview: "linkedin" },
  { title: "One-pager PDF", type: "PDF · A4 · Printable", preview: "pdf" },
  { title: "Logo pack", type: "ZIP · SVG + PNG", preview: "logo" },
  { title: "WhatsApp graphics (×4)", type: "PNG · 1080×1080px", preview: "wa" },
  { title: "Slide deck", type: "PPTX · 5 slides · Editable", preview: "slides" },
];

export const chatMessages: ChatMessage[] = [
  { id: "s1", from: "support", content: "Hi James! Welcome to the Intaleks affiliate programme. Feel free to ask us anything — commissions, payouts, how to promote Intaleks, or anything else.", time: "Aleks · 12 Jan, 9:02 am" },
  { id: "m1", from: "you", content: "Thanks! Quick question — when do commissions become available to withdraw after a conversion?", time: "You · 12 Jan, 2:14 pm" },
  { id: "s2", from: "support", content: "Commissions are held for 3 days after the conversion date. After that they move to your available balance automatically and you can withdraw any time your balance is $250 or above.", time: "Aleks · 12 Jan, 2:31 pm" },
];

export const notificationPrefs: NotificationPref[] = [
  { key: "earned", label: "Commission earned", enabled: true },
  { key: "processed", label: "Withdrawal processed", enabled: true },
  { key: "traffic", label: "New referral visits", enabled: false },
  { key: "summary", label: "Monthly summary", enabled: true },
  { key: "tips", label: "Marketing tips", enabled: false },
];

export const faqItems: FaqItem[] = [
  { question: "How does the 3-day holding period work?", answer: "When a referral converts, commission is held for 3 days for refund protection. After that it moves to your available balance automatically." },
  { question: "When can I request my first withdrawal?", answer: "Once your available balance reaches $250 — the minimum threshold." },
  { question: "How long does payout processing take?", answer: "2–5 business days. You'll get an email when it's done." },
  { question: "Which plans earn commission?", answer: "All tiers — Starter, Professional, and Enterprise. Commission is 25% of the plan value." },
  { question: "How long does my referral link stay active?", answer: "It's permanent. Visitors are attributed to you for 30 days after clicking." },
];

export const termsMeta: TermsMeta = {
  effectiveDate: "1 January 2025",
  version: "1.0",
  acceptedDate: "12 January 2025",
};
