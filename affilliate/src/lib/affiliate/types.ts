export type PortalPath =
  | "/dashboard"
  | "/referrals"
  | "/commissions"
  | "/withdrawals"
  | "/assets"
  | "/chat"
  | "/settings"
  | "/terms"
  | "/help";

export type NavSection = "Overview" | "Resources" | "Account";

export type AffiliateRouteMeta = {
  path: PortalPath;
  navLabel: string;
  section: NavSection;
  title: string;
  subtitle: string;
  badgeCount?: number;
};

export type AffiliateStatTone = "info" | "success" | "warning" | "accent";

export type AffiliateStat = {
  label: string;
  value: string;
  detail: string;
  tone: AffiliateStatTone;
};

export type ReferralStatus = "converted" | "pending" | "lead" | "paid";

export type ReferralRow = {
  date: string;
  client: string;
  plan: string;
  planValue: string;
  commission: string;
  available: string;
  status: ReferralStatus;
};

export type CommissionStatus = "available" | "hold" | "paid";

export type CommissionRow = {
  date: string;
  client: string;
  plan: string;
  planValue: string;
  rate: string;
  commission: string;
  status: CommissionStatus;
};

export type WithdrawalStatus = "processed";

export type WithdrawalRow = {
  date: string;
  amount: string;
  method: "PayPal" | "Stripe";
  reference: string;
  status: WithdrawalStatus;
};

export type MarketingAsset = {
  title: string;
  type: string;
  preview: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ChatMessage = {
  id: string;
  from: "you" | "support";
  content: string;
  time: string;
};

export type NotificationPref = {
  key: string;
  label: string;
  enabled: boolean;
};

export type TermsMeta = {
  effectiveDate: string;
  version: string;
  acceptedDate: string;
};
