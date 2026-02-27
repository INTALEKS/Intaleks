"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SubscriptionsApi, type CreateSubscriptionPlanInput, type UpdateSubscriptionPlanInput } from "@/app/services/subscriptions";

export const SUBSCRIPTION_KEYS = {
  all: ["subscriptions"] as const,
  lists: () => [...SUBSCRIPTION_KEYS.all, "list"] as const,
  list: () => [...SUBSCRIPTION_KEYS.lists()] as const,
  details: () => [...SUBSCRIPTION_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SUBSCRIPTION_KEYS.details(), id] as const,
};

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.list(),
    queryFn: () => SubscriptionsApi.getPlans(),
  });
}

// Public hook for non-admin users (settings page, pricing page, etc.)
export function useActiveSubscriptionPlans() {
  return useQuery({
    queryKey: [...SUBSCRIPTION_KEYS.list(), "active"],
    queryFn: () => SubscriptionsApi.getActivePlans(),
  });
}

export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.detail(id),
    queryFn: () => SubscriptionsApi.getPlanById(id),
    enabled: !!id,
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubscriptionPlanInput) => SubscriptionsApi.createPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.lists() });
      toast.success("Subscription plan created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSubscriptionPlanInput }) => SubscriptionsApi.updatePlan(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.detail(data.id) });
      toast.success("Subscription plan updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SubscriptionsApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.lists() });
      toast.success("Subscription plan deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useActivateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SubscriptionsApi.activatePlan(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.detail(data.id) });
      toast.success("Subscription plan activated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeactivateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SubscriptionsApi.deactivatePlan(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.detail(data.id) });
      toast.success("Subscription plan deactivated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
