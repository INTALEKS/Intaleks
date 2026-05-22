"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { api } from "@/lib/api";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface AffiliateUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  role: Role;
  affiliateProfile?: {
    id: string;
    status: string;
    code?: string | null;
    company?: string | null;
  } | null;
  affiliateApplication?: {
    id: string;
    status: "pending" | "approved" | "rejected";
  } | null;
}

const UserContext = createContext<AffiliateUser | null>(null);

export function useUser() {
  return useContext(UserContext);
}

function getMainAppUrl() {
  return process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "https://intaleks.com";
}

export function AccessGuard({
  children,
  allowedRoles,
  loadingLabel,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
  loadingLabel?: string;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<AffiliateUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const res = await api.get("/api/auth/me");
        const userData = res.data?.user;
        const role = userData?.role as Role | undefined;

        if (allowedRoles && (!role || !allowedRoles.includes(role))) {
          window.location.href = `${getMainAppUrl()}/login`;
          return;
        }

        // If this is an admin/super_admin user, but they are visiting a non-admin route, redirect to /admin
        if ((role === "ADMIN" || role === "SUPER_ADMIN") && !pathname.startsWith("/admin")) {
          window.location.href = "/admin";
          return;
        }

        if (mounted) {
          setUser(userData as AffiliateUser);
          setReady(true);
        }
      } catch {
        const absolutePath =
          typeof window !== "undefined"
            ? `${window.location.origin}${window.location.pathname}${window.location.search}`
            : pathname;
        const next = encodeURIComponent(absolutePath);
        window.location.href = `${getMainAppUrl()}/login?next=${next}`;
      }
    }

    void verify();
    return () => {
      mounted = false;
    };
  }, [allowedRoles, pathname]);

  if (!ready) {
    return <div className="p-6 text-sm text-[var(--affiliate-muted)]">{loadingLabel ?? "Checking access..."}</div>;
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
