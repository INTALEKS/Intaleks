"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PaymentsApi, type CreateCheckoutRequest, type Payment, type SubscriptionStatus, type PaymentStats, type PaginatedPaymentsResponse, type ListPaymentsParams } from "@/app/services/payments";

/**
 * Query keys for payment-related queries
 */
export const PAYMENT_KEYS = {
  all: ["payments"] as const,
  history: () => [...PAYMENT_KEYS.all, "history"] as const,
  subscription: () => [...PAYMENT_KEYS.all, "subscription"] as const,
  admin: () => [...PAYMENT_KEYS.all, "admin"] as const,
  adminPayments: (params: ListPaymentsParams) => [...PAYMENT_KEYS.admin(), "list", params] as const,
  adminStats: () => [...PAYMENT_KEYS.admin(), "stats"] as const,
};

/**
 * Hook to fetch payment history for the authenticated user
 * Requirements: 5.2
 */
export function usePaymentHistory() {
  return useQuery<Payment[], Error>({
    queryKey: PAYMENT_KEYS.history(),
    queryFn: () => PaymentsApi.getPaymentHistory(),
  });
}

/**
 * Hook to fetch subscription status for the authenticated user
 * Requirements: 4.5
 */
export function useSubscriptionStatus() {
  return useQuery<SubscriptionStatus, Error>({
    queryKey: PAYMENT_KEYS.subscription(),
    queryFn: () => PaymentsApi.getSubscriptionStatus(),
  });
}

/**
 * Hook to create a checkout session and redirect to Stripe
 * Requirements: 2.1
 */
export function useCreateCheckout() {
  return useMutation({
    mutationFn: (request: CreateCheckoutRequest) => PaymentsApi.createCheckout(request),
    onSuccess: (data) => {
      // Redirect to Stripe checkout page
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start checkout");
    },
  });
}

/**
 * Hook to cancel the user's subscription
 * Requirements: 6.1
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => PaymentsApi.cancelSubscription(),
    onSuccess: () => {
      // Invalidate subscription status to refetch
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.subscription() });
      toast.success("Subscription will be canceled at the end of the billing period");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });
}

// ============================================
// Admin Hooks
// ============================================

/**
 * Hook to fetch all payments with filtering (admin only)
 * Requirements: 7.1, 7.2
 */
export function useAdminPayments(params: ListPaymentsParams = {}) {
  return useQuery<PaginatedPaymentsResponse, Error>({
    queryKey: PAYMENT_KEYS.adminPayments(params),
    queryFn: () => PaymentsApi.getAllPayments(params),
  });
}

/**
 * Hook to fetch payment statistics (admin only)
 * Requirements: 7.1
 */
export function useAdminPaymentStats() {
  return useQuery<PaymentStats, Error>({
    queryKey: PAYMENT_KEYS.adminStats(),
    queryFn: () => PaymentsApi.getPaymentStats(),
  });
}

/**
 * Hook to grant subscription access to a user (admin only)
 * Requirements: 7.4
 */
export function useGrantSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, planId }: { userId: string; planId: string }) => PaymentsApi.grantSubscription(userId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Subscription access granted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to grant subscription");
    },
  });
}

/**
 * Hook to revoke subscription access from a user (admin only)
 * Requirements: 7.4
 */
export function useRevokeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => PaymentsApi.revokeSubscription(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Subscription access revoked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke subscription");
    },
  });
}
