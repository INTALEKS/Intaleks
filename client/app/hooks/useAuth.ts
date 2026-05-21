"use client";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiClient, type loginData, type RegisterData } from "@/app/services/api";

export const AUTH_KEYS = {
  user: ["auth-user"] as const, // Match the key used in useAuthState
  login: ["auth", "login"] as const,
  logout: ["auth", "logout"] as const,
  register: ["auth", "register"] as const,
};

/**
 * Hook for normal user authentication (login, register, logout)
 * Requirements: 2.1, 3.1, 4.1, 7.5
 *
 * @param returnUrl - Optional URL to redirect to after successful auth (defaults to "/")
 */
export function useAuth(returnUrl: string = "/") {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mutation for user login
  const loginMutation = useMutation({
    mutationKey: AUTH_KEYS.login,
    mutationFn: async (credentials: loginData) => {
      return await ApiClient.login(credentials.email, credentials.password);
    },
    onSuccess: (data) => {
      // Update the user query with the response data
      queryClient.setQueryData(AUTH_KEYS.user, data);
      // Invalidate and refetch the auth query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      toast.success("Login successful");
      // Redirect to return URL or home page (Requirement 7.5)
      if (returnUrl.startsWith("http://") || returnUrl.startsWith("https://")) {
        window.location.href = returnUrl;
      } else {
        router.replace(returnUrl);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  // Mutation for user registration
  const registerMutation = useMutation({
    mutationKey: AUTH_KEYS.register,
    mutationFn: async (data: RegisterData) => {
      return await ApiClient.register(data.email, data.password, data.firstName, data.lastName);
    },
    onSuccess: (data, variables) => {
      toast.success("Registration successful! Please check your email.");
      if (typeof window !== "undefined" && returnUrl && returnUrl !== "/") {
        localStorage.setItem("postVerifyReturnUrl", returnUrl);
      }
      // Redirect to verify email page with email parameter
      const verifyUrl = new URL("/auth/verify-email", window.location.origin);
      verifyUrl.searchParams.set("email", variables.email);
      if (returnUrl && returnUrl !== "/") {
        verifyUrl.searchParams.set("returnUrl", returnUrl);
      }
      router.replace(`${verifyUrl.pathname}${verifyUrl.search}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  // Mutation for user logout
  const logoutMutation = useMutation({
    mutationKey: AUTH_KEYS.logout,
    mutationFn: async () => {
      return await ApiClient.logout();
    },
    onSuccess: () => {
      // Clear the auth cache
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user });
      toast.success("Logged out successfully");
      // Redirect to home page
      router.replace("/");
    },
    onError: (error: Error) => {
      // Even on error, clear local state and redirect
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user });
      toast.error(error.message || "Logout failed");
      router.replace("/");
    },
  });

  return {
    // Login
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    // Register
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    // Logout
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    // Combined loading state
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
  };
}

/**
 * Hook for admin authentication (login only)
 * Preserves existing admin login functionality
 */
export function useAdminAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mutation for admin login
  const loginMutation = useMutation({
    mutationKey: [...AUTH_KEYS.login, "admin"],
    mutationFn: async (credentials: loginData) => await ApiClient.loginAdmin(credentials),
    onSuccess: (data) => {
      // Update the user query with the complete response data
      queryClient.setQueryData(AUTH_KEYS.user, data);
      // Invalidate and refetch the auth query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      // Redirect to dashboard
      router.replace("/admin");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const logout = () => {
    // Clear the auth cache
    queryClient.removeQueries({ queryKey: AUTH_KEYS.user });
    // Redirect to login
    router.push("/auth/admin/login");
  };

  return {
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
