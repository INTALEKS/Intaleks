"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CouponsApi, type CreateCouponInput } from "@/app/services/coupons";
import { AUTH_KEYS } from "./useAuth";

export const COUPON_KEYS = {
  all: ["coupons"] as const,
  list: (used?: boolean) => [...COUPON_KEYS.all, "list", used] as const,
};

export function useRedeemCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => CouponsApi.redeem(code),
    onSuccess: (data) => {
      toast.success(data.message);
      // Refresh auth state so hasCalculatorAccess updates immediately
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to redeem coupon");
    },
  });
}

export function useAdminCoupons(used?: boolean) {
  return useQuery({
    queryKey: COUPON_KEYS.list(used),
    queryFn: () => CouponsApi.list(used),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCouponInput) => CouponsApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: COUPON_KEYS.all });
      toast.success(`${data.length} coupon code${data.length > 1 ? "s" : ""} created`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create coupon");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CouponsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPON_KEYS.all });
      toast.success("Coupon deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete coupon");
    },
  });
}

export function useRevokeCouponAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => CouponsApi.revokeAccess(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPON_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Coupon access revoked");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to revoke coupon access");
    },
  });
}
