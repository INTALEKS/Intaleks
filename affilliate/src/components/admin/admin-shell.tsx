"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronUp, CreditCard, ExternalLink, Grid2x2, LayoutDashboard, Link2, LogOut, Menu, Settings, UserRoundCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getAdminMeta, adminNav } from "@/lib/admin/routes";
import type { AdminPath } from "@/lib/admin/types";
import { useAdminApplications, useAdminWithdrawals } from "@/hooks/use-admin-data";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/auth/access-guard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

const iconByPath: Record<AdminPath, React.ComponentType<{ className?: string }>> = {
  "/admin/overview": Grid2x2,
  "/admin/applications": UserRoundCheck,
  "/admin/affiliates": Users,
  "/admin/referrals": Link2,
  "/admin/withdrawals": CreditCard,
  "/admin/settings": Settings,
};

function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function getDisplayName(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  return email ?? "Administrator";
}

function getMainAppUrl() {
  return process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "https://intaleks.com";
}

async function handleLogout() {
  try {
    await api.post("/api/auth/logout");
  } catch {
    // silently ignore
  }
  window.location.href = `${getMainAppUrl()}/login`;
}

function AdminSidebar({ appBadge, wdBadge, onNavigate }: { appBadge: number; wdBadge: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();

  const initials = getInitials(user?.firstName, user?.lastName, user?.email);
  const displayName = getDisplayName(user?.firstName, user?.lastName, user?.email);
  const displayEmail = user?.email ?? "";
  const displayRole = user?.role === "SUPER_ADMIN" ? "Super Admin" : "Administrator";

  return (
    <aside className="flex h-full w-56 min-w-56 flex-col bg-[#0a1f3d]">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-sm font-semibold text-white">intaleks</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--affiliate-muted-dark)]">Admin Panel</p>
      </div>
      <p className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--affiliate-section)]">Management</p>
      <div className="px-2">
        {adminNav.map((item) => {
          const Icon = iconByPath[item.path];
          const active = pathname === item.path;
          const badge = item.badgeKey === "applications" ? appBadge : item.badgeKey === "withdrawals" ? wdBadge : null;
          return (
            <Link key={item.path} href={item.path} onClick={onNavigate} className={cn("mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--affiliate-link)] hover:bg-white/10 hover:text-[var(--affiliate-link-active)]", active && "bg-[color:color-mix(in_oklab,var(--affiliate-blue)_20%,transparent)] text-[var(--affiliate-link-active)]")}>
              <Icon className="size-4" />
              <span>{item.label}</span>
              {badge ? <Badge className="ml-auto rounded-full bg-[#5c1a7a] px-2 py-0 text-[10px] text-white">{badge}</Badge> : null}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/10 focus:outline-none">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--affiliate-blue)] text-xs font-semibold text-white">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[var(--affiliate-link-active)]">{displayName}</p>
              <p className="truncate text-[10px] text-[var(--affiliate-muted-dark)]">{displayRole}</p>
            </div>
            <ChevronUp className="size-4 shrink-0 text-[var(--affiliate-muted-dark)]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-52 rounded-xl border border-[var(--affiliate-border)] bg-white shadow-xl">
            {/* User info header */}
            <div className="px-3 py-2.5">
              <p className="text-sm font-medium text-[var(--affiliate-navy)]">{displayName}</p>
              <p className="text-[11px] text-[var(--affiliate-muted)]">{displayEmail}</p>
              <div className="mt-1.5 inline-flex rounded bg-[var(--affiliate-bg-accent)] px-2 py-0.5 font-mono text-[10px] text-[var(--affiliate-blue)]">{displayRole.toUpperCase()}</div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer gap-2 px-3 py-2 text-[var(--affiliate-navy)]"
                onClick={() => {
                  router.push("/admin/settings");
                }}
              >
                <Settings className="size-4 text-[var(--affiliate-muted)]" />
                <span className="text-sm">Platform Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer gap-2 px-3 py-2 text-[var(--affiliate-navy)]"
                onClick={() => {
                  router.push("/dashboard");
                }}
              >
                <LayoutDashboard className="size-4 text-[var(--affiliate-muted)]" />
                <span className="text-sm">Affiliate Portal</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer gap-2 px-3 py-2 text-[var(--affiliate-navy)]"
                onClick={() => {
                  window.open(getMainAppUrl(), "_blank");
                }}
              >
                <ExternalLink className="size-4 text-[var(--affiliate-muted)]" />
                <span className="text-sm">Main App</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" className="cursor-pointer gap-2 px-3 py-2" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="text-sm">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = getAdminMeta(pathname);
  const { data: applications = [] } = useAdminApplications();
  const { data: withdrawals = [] } = useAdminWithdrawals();
  const appBadge = applications.filter((item) => item.status === "pending").length;
  const wdBadge = withdrawals.filter((item) => item.status === "requested").length;

  return (
    <div className="flex h-screen overflow-hidden bg-(--affiliate-bg)">
      <div className="hidden h-full lg:block">
        <AdminSidebar appBadge={appBadge} wdBadge={wdBadge} />
      </div>
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-(--affiliate-border) bg-white px-4 lg:px-7">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button className="lg:hidden" size="icon-sm" variant="outline" />}>
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" className="w-56 border-r p-0">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <AdminSidebar appBadge={appBadge} wdBadge={wdBadge} />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-sm font-medium text-[var(--affiliate-navy)]">{meta.title}</h1>
              <p className="text-xs text-[var(--affiliate-muted)]">{meta.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-[var(--affiliate-bg)] px-3 py-1 text-xs text-[var(--affiliate-muted)]">{new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
            <button type="button" className="relative flex size-8 items-center justify-center rounded-md bg-[var(--affiliate-bg)] text-[var(--affiliate-muted)]">
              <Bell className="size-4" />
              {appBadge + wdBadge > 0 ? <span className="absolute top-1 right-1 size-2 rounded-full border border-white bg-[var(--affiliate-red)]" /> : null}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
