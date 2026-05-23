"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  AdminAffiliate,
  AdminApplication,
  AdminProgramSettings,
  AdminReferral,
  AdminWithdrawal,
} from "@/lib/admin/types";

type RawMap = Record<string, unknown>;

const appStatusMap = { PENDING: "pending", APPROVED: "approved", REJECTED: "rejected" } as const;
const affiliateStatusMap = { ACTIVE: "active", SUSPENDED: "suspended" } as const;
const referralStatusMap = { CONVERTED: "converted", PENDING: "pending", LEAD: "lead" } as const;
const withdrawalStatusMap = { REQUESTED: "requested", PROCESSED: "processed" } as const;

function getString(row: RawMap, key: string, fallback = ""): string {
  const value = row[key];
  return typeof value === "string" ? value : fallback;
}

function getNumber(row: RawMap, key: string, fallback = 0): number {
  const value = row[key];
  return typeof value === "number" ? value : fallback;
}

function mapApplication(row: RawMap): AdminApplication {
  return {
    id: getString(row, "id"),
    name: getString(row, "name"),
    email: getString(row, "email"),
    company: getString(row, "company"),
    website: getString(row, "website"),
    paypal: getString(row, "paypal"),
    date: new Date(getString(row, "createdAt")).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    status: appStatusMap[getString(row, "status") as keyof typeof appStatusMap] ?? "pending",
  };
}

function mapAffiliate(row: RawMap): AdminAffiliate {
  return {
    id: getString(row, "id"),
    name: getString(row, "name"),
    email: getString(row, "email"),
    company: getString(row, "company"),
    code: getString(row, "code"),
    referrals: getNumber(row, "referrals"),
    converted: getNumber(row, "converted"),
    earned: getNumber(row, "earned"),
    pending: getNumber(row, "pending"),
    status: affiliateStatusMap[getString(row, "status") as keyof typeof affiliateStatusMap] ?? "active",
    joined: getString(row, "joinedAtLabel"),
  };
}

function mapReferral(row: RawMap): AdminReferral {
  return {
    id: getString(row, "id"),
    affiliate: getString(row, "affiliateName"),
    client: getString(row, "clientMasked"),
    plan: getString(row, "plan"),
    value: getNumber(row, "value"),
    commission: getNumber(row, "commission"),
    date: new Date(getString(row, "conversionDate")).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    status: referralStatusMap[getString(row, "status") as keyof typeof referralStatusMap] ?? "lead",
  };
}

function mapWithdrawal(row: RawMap): AdminWithdrawal {
  const method = getString(row, "method");
  return {
    id: getString(row, "id"),
    affiliate: getString(row, "affiliateName"),
    amount: getNumber(row, "amount"),
    method: method === "Stripe" ? "Stripe" : "PayPal",
    paypal: getString(row, "payoutAccount"),
    requested: new Date(getString(row, "requestedAt")).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    status: withdrawalStatusMap[getString(row, "status") as keyof typeof withdrawalStatusMap] ?? "requested",
    ref: getString(row, "reference") || undefined,
  };
}

export function useAdminApplications() {
  return useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const res = await api.get("/api/admin/affiliate/applications");
      return ((res.data.data as unknown[]) ?? []).map((item) => mapApplication(item as RawMap));
    },
    initialData: [] as AdminApplication[],
  });
}

export function useAdminAffiliates() {
  return useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async () => {
      const res = await api.get("/api/admin/affiliate/affiliates");
      return ((res.data.data as unknown[]) ?? []).map((item) => mapAffiliate(item as RawMap));
    },
    initialData: [] as AdminAffiliate[],
  });
}

export function useAdminReferrals() {
  return useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const res = await api.get("/api/admin/affiliate/referrals");
      return ((res.data.data as unknown[]) ?? []).map((item) => mapReferral(item as RawMap));
    },
    initialData: [] as AdminReferral[],
  });
}

export function useAdminWithdrawals() {
  return useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const res = await api.get("/api/admin/affiliate/withdrawals");
      return ((res.data.data as unknown[]) ?? []).map((item) => mapWithdrawal(item as RawMap));
    },
    initialData: [] as AdminWithdrawal[],
  });
}

const notificationLabels: Record<string, string> = {
  appReceived: "Affiliate application received",
  appReviewed: "Application approved or rejected",
  withdrawalRequested: "Payout request submitted",
  weeklyReport: "Weekly affiliate report",
  monthlySummary: "Monthly program summary",
};

export function useAdminProgramSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: async (): Promise<AdminProgramSettings & { id: string }> => {
      const res = await api.get("/api/admin/affiliate/settings");
      const row = res.data.data as RawMap;
      const notifications = (row.notifications ?? {}) as Record<string, unknown>;
      return {
        id: getString(row, "id"),
        commission: getNumber(row, "commissionRate", 25),
        minWithdrawal: getNumber(row, "minWithdrawal", 250),
        holdingDays: getNumber(row, "holdingDays", 3),
        attributionDays: getNumber(row, "attributionDays", 30),
        adminEmail: getString(row, "adminEmail", "aleks@intaleks.com"),
        notifications: Object.entries(notifications).map(([key, enabled]) => ({
          key,
          label: notificationLabels[key] || key,
          enabled: Boolean(enabled),
        })),
      };
    },
    initialData: {
      id: "",
      commission: 25,
      minWithdrawal: 250,
      holdingDays: 3,
      attributionDays: 30,
      adminEmail: "aleks@intaleks.com",
      notifications: [],
    },
  });
}

export function useAdminOverviewSummary() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await api.get("/api/admin/affiliate/overview");
      const raw = res.data.data as Record<string, unknown>;
      return {
        applications: ((raw.applications as unknown[]) ?? []).map((item) => mapApplication(item as RawMap)),
        affiliates: ((raw.affiliates as unknown[]) ?? []).map((item) => mapAffiliate(item as RawMap)),
        withdrawals: ((raw.withdrawals as unknown[]) ?? []).map((item) => mapWithdrawal(item as RawMap)),
        monthlyPayouts: (raw.monthlyPayouts as number[]) ?? [],
        monthlyPayoutMonths: (raw.monthlyPayoutMonths as string[]) ?? [],
      };
    },
    initialData: {
      applications: [] as AdminApplication[],
      affiliates: [] as AdminAffiliate[],
      withdrawals: [] as AdminWithdrawal[],
      monthlyPayouts: [] as number[],
      monthlyPayoutMonths: [] as string[],
    },
  });
}
