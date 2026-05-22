"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronUp,
  CircleHelp,
  CreditCard,
  DollarSign,
  ExternalLink,
  Grid2x2,
  Images,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { useUser } from "@/components/auth/access-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { affiliateRoutes, getRouteMeta } from "@/lib/affiliate/routes";
import type { NavSection, PortalPath } from "@/lib/affiliate/types";
import { cn } from "@/lib/utils";

const navIcons: Record<PortalPath, React.ComponentType<{ className?: string }>> = {
  "/dashboard": Grid2x2,
  "/referrals": Users,
  "/commissions": DollarSign,
  "/withdrawals": CreditCard,
  "/assets": Images,
  "/chat": MessageCircle,
  "/settings": Settings,
  "/terms": ShieldCheck,
  "/help": CircleHelp,
};

/** Build initials from first/last name or email */
function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

/** Build display name from first/last name or email */
function getDisplayName(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  return email ?? "Affiliate";
}

/** Get the first name only for short greetings */
function getFirstName(firstName?: string | null, email?: string): string {
  if (firstName) return firstName;
  if (email) return email.split("@")[0];
  return "there";
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

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const sections: NavSection[] = ["Overview", "Resources", "Account"];

  const initials = getInitials(user?.firstName, user?.lastName, user?.email);
  const displayName = getDisplayName(user?.firstName, user?.lastName, user?.email);
  const displayEmail = user?.email ?? "";
  const referralCode = user?.affiliateProfile?.code ?? user?.email?.split("@")[0]?.toUpperCase()?.slice(0, 8) ?? "—";

  return (
    <aside className="flex h-full w-56 min-w-56 flex-col bg-[var(--affiliate-navy)]">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="h-8 flex items-center">
          <Image src="/intaleks.png" alt="Intaleks Logo" width={120} height={26} className="h-6 w-auto object-contain" />
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--affiliate-muted-dark)]">Affiliate Portal</p>
      </div>
      {sections.map((section) => (
        <div key={section} className="pt-4">
          <p className="px-4 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--affiliate-section)]">{section}</p>
          <div className="px-2">
            {affiliateRoutes
              .filter((route) => route.section === section)
              .map((route) => {
                const active = pathname === route.path;
                const Icon = navIcons[route.path];
                return (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={onNavigate}
                    className={cn(
                      "mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--affiliate-link)] transition-colors hover:bg-white/10 hover:text-[var(--affiliate-link-active)]",
                      active && "bg-[color:color-mix(in_oklab,var(--affiliate-blue)_20%,transparent)] text-[var(--affiliate-link-active)]"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{route.navLabel}</span>
                    {route.badgeCount ? (
                      <Badge className="ml-auto rounded-full bg-[var(--affiliate-red)] px-2 py-0 text-[10px] text-white">
                        {route.badgeCount}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}

      {/* ─── User Card with Dropdown ─── */}
      <div className="mt-auto border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/10 focus:outline-none"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--affiliate-blue)] text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[var(--affiliate-link-active)]">{displayName}</p>
              <p className="truncate text-[10px] text-[var(--affiliate-muted-dark)]">{displayEmail}</p>
            </div>
            <ChevronUp className="size-4 shrink-0 text-[var(--affiliate-muted-dark)]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-52 rounded-xl border border-[var(--affiliate-border)] bg-white shadow-xl"
          >
            {/* User info header */}
            <div className="px-3 py-2.5">
              <p className="text-sm font-medium text-[var(--affiliate-navy)]">{displayName}</p>
              <p className="text-[11px] text-[var(--affiliate-muted)]">{displayEmail}</p>
              <div className="mt-1.5 inline-flex rounded bg-[var(--affiliate-bg-accent)] px-2 py-0.5 font-mono text-[10px] text-[var(--affiliate-blue)]">
                ref: {referralCode}
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer gap-2 px-3 py-2 text-[var(--affiliate-navy)]"
                onClick={() => { router.push("/settings"); }}
              >
                <User className="size-4 text-[var(--affiliate-muted)]" />
                <span className="text-sm">Profile & Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer gap-2 px-3 py-2 text-[var(--affiliate-navy)]"
                onClick={() => { router.push("/help"); }}
              >
                <CircleHelp className="size-4 text-[var(--affiliate-muted)]" />
                <span className="text-sm">Help & Support</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer gap-2 px-3 py-2 text-[var(--affiliate-navy)]"
                onClick={() => { window.open(getMainAppUrl(), "_blank"); }}
              >
                <ExternalLink className="size-4 text-[var(--affiliate-muted)]" />
                <span className="text-sm">Main App</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2 px-3 py-2"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span className="text-sm">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useUser();
  const meta = getRouteMeta(pathname);

  const referralCode = user?.affiliateProfile?.code ?? user?.email?.split("@")[0]?.toUpperCase()?.slice(0, 8) ?? "—";

  // Build dynamic subtitle for the dashboard page
  const subtitle =
    pathname === "/dashboard"
      ? `Welcome back, ${getFirstName(user?.firstName, user?.email)} — here's your performance at a glance`
      : meta.subtitle;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--affiliate-bg)]">
      <div className="hidden h-full lg:block">
        <SidebarNav />
      </div>
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--affiliate-border)] bg-white px-4 lg:px-7">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button className="lg:hidden" size="icon-sm" variant="outline" />}>
                <Menu />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 border-r p-0">
                <SheetTitle className="sr-only">Affiliate navigation</SheetTitle>
                <SidebarNav />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-sm font-medium text-[var(--affiliate-navy)]">{meta.title}</h1>
              <p className="text-xs text-[var(--affiliate-muted)]">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-[var(--affiliate-border-strong)] bg-[var(--affiliate-bg-accent)] px-3 py-1 font-mono text-xs text-[var(--affiliate-blue)]">
              ref: {referralCode}
            </div>
            <button
              type="button"
              className="relative flex size-8 items-center justify-center rounded-md bg-[var(--affiliate-bg)] text-[var(--affiliate-muted)]"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute top-1 right-1 size-2 rounded-full border border-white bg-[var(--affiliate-red)]" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
