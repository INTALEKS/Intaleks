"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthState } from "@/app/hooks/useAuthState";

/**
 * Shared layout for login/signup pages
 * Redirects logged-in users appropriately
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAuthentiating, user } = useAuthState();

  const isAdminAuthPage = pathname?.startsWith("/auth/admin");

  useEffect(() => {
    // Redirect logged-in users appropriately
    if (!isAuthentiating && isAuthenticated) {
      if (user?.role === "ADMIN" && isAdminAuthPage) {
        // Admin logging in via admin login page -> redirect to admin dashboard
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isAuthentiating, user, isAdminAuthPage, router]);

  // Show nothing while checking auth state to prevent flash
  if (isAuthentiating) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-linear-to-b from-sky-200 via-blue-50 to-cyan-100">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  // If authenticated, don't render children (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
