"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

import {
  chatMessages,
  faqItems,
  marketingAssets,
  termsMeta,
} from "@/lib/affiliate/data";

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

export function useDashboardSummary() {
  return useQuery<AffiliateStat[]>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await api.get("/api/users/affiliate/dashboard-summary");
      return res.data;
    },
  });
}

export function useReferrals() {
  return useQuery<ReferralRow[]>({
    queryKey: ["referrals"],
    queryFn: async () => {
      const res = await api.get("/api/users/affiliate/referrals");
      return res.data;
    },
  });
}

export interface CommissionData {
  commissionLog: CommissionRow[];
  monthlyEarnings: { month: string; value: number }[];
  planBreakdown: { plan: string; amount: number; color: string }[];
}

export function useCommissions() {
  return useQuery<CommissionData>({
    queryKey: ["commissions"],
    queryFn: async () => {
      const res = await api.get("/api/users/affiliate/commissions");
      return res.data;
    },
  });
}

export function useWithdrawals() {
  return useQuery<WithdrawalRow[]>({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const res = await api.get("/api/users/affiliate/withdrawals");
      return res.data;
    },
  });
}

export function useMarketingAssets() {
  return useQuery({
    queryKey: ["marketing-assets"],
    queryFn: async () => marketingAssets,
    initialData: marketingAssets,
  });
}

export function useChatMessages() {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const res = await api.get("/api/users/affiliate/chat");
      return res.data.map((m: any) => ({
        id: m.id,
        from: m.from,
        content: m.content,
        time: m.timeLabel,
        read: m.read,
      }));
    },
  });
}

export function useMarkChatAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/users/affiliate/chat/read");
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await api.post("/api/users/affiliate/chat", data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });
}

export function useNotificationPrefs() {
  return useQuery<NotificationPref[]>({
    queryKey: ["notification-prefs"],
    queryFn: async () => {
      const res = await api.get("/api/users/affiliate/notification-prefs");
      return res.data;
    },
  });
}

export function useSaveNotificationPrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: NotificationPref[]) => {
      const res = await api.put("/api/users/affiliate/notification-prefs", { preferences });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notification-prefs"] });
    },
  });
}

export function useFaq() {
  return useQuery({
    queryKey: ["faq"],
    queryFn: async () => faqItems,
    initialData: faqItems,
  });
}

export function useTermsMeta() {
  return useQuery({
    queryKey: ["terms-meta"],
    queryFn: async () => termsMeta,
    initialData: termsMeta,
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; method: string; paypalEmail?: string }) => {
      const res = await api.post("/api/users/affiliate/withdrawals", data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (data: { company: string }) => {
      const res = await api.put("/api/users/affiliate/profile", data);
      return res.data;
    },
  });
}
