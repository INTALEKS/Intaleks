import type { AdminNavItem, AdminPageMeta } from "@/lib/admin/types";

export const adminNav: AdminNavItem[] = [
  { path: "/admin/overview", label: "Overview" },
  { path: "/admin/applications", label: "Applications", badgeKey: "applications" },
  { path: "/admin/affiliates", label: "Affiliates" },
  { path: "/admin/referrals", label: "Referrals" },
  { path: "/admin/withdrawals", label: "Payouts", badgeKey: "withdrawals" },
  { path: "/admin/settings", label: "Settings" },
];

export const adminMeta: AdminPageMeta[] = [
  { path: "/admin/overview", title: "Overview", subtitle: "Platform-wide affiliate performance at a glance" },
  { path: "/admin/applications", title: "Applications", subtitle: "Review and action pending affiliate requests" },
  { path: "/admin/affiliates", title: "Affiliates", subtitle: "Manage active partners and their accounts" },
  { path: "/admin/referrals", title: "Referrals", subtitle: "Full referral log across all affiliates" },
  { path: "/admin/withdrawals", title: "Payouts", subtitle: "Process payout requests from affiliates" },
  { path: "/admin/settings", title: "Settings", subtitle: "Configure global program parameters" },
];

export function getAdminMeta(pathname: string): AdminPageMeta {
  return adminMeta.find((item) => item.path === pathname) ?? adminMeta[0];
}

