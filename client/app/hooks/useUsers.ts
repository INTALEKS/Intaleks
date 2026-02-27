"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UsersApi, type UserFilters, type CreateUserInput, type UpdateUserInput } from "@/app/services/users";

export const USER_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_KEYS.all, "list"] as const,
  list: (filters?: UserFilters) => [...USER_KEYS.lists(), filters] as const,
  details: () => [...USER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
  stats: (startDate?: string, endDate?: string) => [...USER_KEYS.all, "stats", startDate, endDate] as const,
};

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: USER_KEYS.list(filters),
    queryFn: () => UsersApi.getUsers(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => UsersApi.getUserById(id),
    enabled: !!id,
  });
}

export function useUserStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: USER_KEYS.stats(startDate, endDate),
    queryFn: () => UsersApi.getStats(startDate, endDate),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => UsersApi.createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.stats() });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => UsersApi.updateUser(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(data.id) });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UsersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.stats() });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UsersApi.suspendUser(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.stats() });
      toast.success("User suspended successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UsersApi.reactivateUser(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.stats() });
      toast.success("User reactivated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) => UsersApi.resetPassword(id),
    onSuccess: (data) => {
      toast.success(`Password reset. Temporary password: ${data.temporaryPassword}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAssignSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, planId }: { userId: string; planId: string }) => UsersApi.assignSubscription(userId, planId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.stats() });
      toast.success("Subscription assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "USER" | "ADMIN" | "SUPER_ADMIN" }) => UsersApi.changeRole(userId, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(data.id) });
      toast.success("User role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
