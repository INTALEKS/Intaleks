import type { AffiliateRouteMeta } from "@/lib/affiliate/types";

export const affiliateRoutes: AffiliateRouteMeta[] = [
  {
    path: "/dashboard",
    navLabel: "Dashboard",
    section: "Overview",
    title: "Dashboard",
    subtitle: "Here's your performance at a glance",
  },
  {
    path: "/referrals",
    navLabel: "Referrals",
    section: "Overview",
    title: "Referrals",
    subtitle: "Track every lead and conversion from your referral link",
    badgeCount: 19,
  },
  {
    path: "/commissions",
    navLabel: "Commissions",
    section: "Overview",
    title: "Commissions",
    subtitle: "Your earnings breakdown across all converted referrals",
  },
  {
    path: "/withdrawals",
    navLabel: "Withdrawals",
    section: "Overview",
    title: "Withdrawals",
    subtitle: "Request payouts and view your withdrawal history",
  },
  {
    path: "/assets",
    navLabel: "Marketing Assets",
    section: "Resources",
    title: "Marketing Assets",
    subtitle: "Branded materials to help you promote Intaleks",
  },
  {
    path: "/chat",
    navLabel: "Chat Support",
    section: "Account",
    title: "Chat Support",
    subtitle: "Message the Intaleks team directly",
    badgeCount: 2,
  },
  {
    path: "/settings",
    navLabel: "Settings",
    section: "Account",
    title: "Settings",
    subtitle: "Manage your profile, payout details and notifications",
  },
  {
    path: "/terms",
    navLabel: "Terms & Conditions",
    section: "Account",
    title: "Terms & Conditions",
    subtitle: "Intaleks Affiliate Programme legal agreement",
  },
  {
    path: "/help",
    navLabel: "Help",
    section: "Account",
    title: "Help & Support",
    subtitle: "FAQs, guides and contact options",
  },
];

export function getRouteMeta(pathname: string) {
  return (
    affiliateRoutes.find((route) => pathname === route.path) ?? affiliateRoutes[0]
  );
}
