"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiClient, type SubscriptionStatus } from "../services/api";
import { AUTH_KEYS } from "./useAuth";

/**
 * Hook for managing authentication state
 * Includes subscription status and auto-fetches profile on mount
 * Requirements: 3.4
 */
export const useAuthState = () => {
  const getUserProfile = useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: () => ApiClient.getUserProfile(), // Wrap in arrow function to preserve context
    retry: false, // Don't retry on auth failures
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: (query) => {
      // If user is logged in but email not verified, poll every 10 seconds
      // This helps when user verifies email on another device
      const authData = query.state.data;
      const user = authData?.user as { emailVerified?: boolean } | undefined;
      if (user && !user.emailVerified) {
        return 10000; // 10 seconds
      }
      return false; // Don't poll otherwise
    },
  });

  const user = getUserProfile.data?.user || null;

  // Extract subscription status from user data
  const subscriptionStatus: SubscriptionStatus = user?.subscriptionStatus || "NONE";
  const hasActiveSubscription = subscriptionStatus === "ACTIVE";
  const hasCouponAccess = user?.couponAccess === true;
  const hasCalculatorAccess = hasActiveSubscription || hasCouponAccess;
  const currentPeriodEnd = user?.currentPeriodEnd ? new Date(user.currentPeriodEnd) : null;
  const subscription = user?.subscription || null;

  return {
    // Authentication state
    isAuthentiating: getUserProfile.isLoading,
    isAuthenticated: !getUserProfile.error && !!getUserProfile.data?.success,
    user,

    // Subscription state
    subscriptionStatus,
    hasActiveSubscription,
    hasCouponAccess,
    hasCalculatorAccess,
    currentPeriodEnd,
    subscription,

    // Query utilities
    refetch: getUserProfile.refetch,
    isRefetching: getUserProfile.isRefetching,
    error: getUserProfile.error,
  };
};
