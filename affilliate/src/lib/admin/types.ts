export type AdminPath =
  | "/admin/overview"
  | "/admin/applications"
  | "/admin/affiliates"
  | "/admin/referrals"
  | "/admin/withdrawals"
  | "/admin/settings";

export type AdminApplicationStatus = "pending" | "approved" | "rejected";
export type AdminAffiliateStatus = "active" | "suspended";
export type AdminReferralStatus = "converted" | "pending" | "lead";
export type AdminWithdrawalStatus = "requested" | "processed";

export type AdminNavItem = {
  path: AdminPath;
  label: string;
  badgeKey?: "applications" | "withdrawals";
};

export type AdminPageMeta = {
  path: AdminPath;
  title: string;
  subtitle: string;
};

export type AdminApplication = {
  id: string | number;
  name: string;
  email: string;
  company: string;
  website: string;
  paypal: string;
  date: string;
  status: AdminApplicationStatus;
};

export type AdminAffiliate = {
  id: string | number;
  name: string;
  email: string;
  company: string;
  code: string;
  referrals: number;
  converted: number;
  earned: number;
  pending: number;
  status: AdminAffiliateStatus;
  joined: string;
};

export type AdminReferral = {
  id: string | number;
  affiliate: string;
  client: string;
  plan: string;
  value: number;
  commission: number;
  date: string;
  status: AdminReferralStatus;
};

export type AdminWithdrawal = {
  id: string | number;
  affiliate: string;
  amount: number;
  method: "PayPal" | "Stripe";
  paypal: string;
  requested: string;
  status: AdminWithdrawalStatus;
  ref?: string;
};

export type AdminProgramSettings = {
  commission: number;
  minWithdrawal: number;
  holdingDays: number;
  attributionDays: number;
  notifications: Array<{ key: string; label: string; enabled: boolean }>;
  adminEmail: string;
};
