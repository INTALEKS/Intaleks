"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isAdminOrHigher } from "@/lib/role-utils";
import Image from "next/image";
import { ChevronDown, LogOut, User, Settings, Menu } from "lucide-react";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useAuth } from "@/app/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface NavLink {
  href: string;
  label: string;
  isAnchor?: boolean;
}

interface NavDropdown {
  label: string;
  dropdown: { href: string; label: string }[];
}

type NavItem = NavLink | NavDropdown;

const navLinks: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Valuator" },
  // {
  //   label: "Learning",
  //   dropdown: [
  //     { href: "/videos", label: "Videos" },
  //     // { href: "/articles", label: "Articles" },
  //   ],
  // },
  { href: "/#pricing", label: "Pricing", isAnchor: true },
  { href: "/#about", label: "About", isAnchor: true },
  { href: "/forum", label: "Forum" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [learningOpen, setLearningOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state - Requirements: 9.1, 9.2, 9.3, 9.4
  const { isAuthentiating, isAuthenticated, user } = useAuthState();
  const { logout, isLoggingOut } = useAuth();

  // Handle logout - Requirement 9.3
  const handleLogout = () => {
    logout();
  };

  // Handle anchor link click - navigate to home and scroll to section
  const handleAnchorClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const hash = href.split("#")[1];
    if (!hash) return;

    if (pathname === "/") {
      const section = document.getElementById(hash);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(href);
    }
  };

  // Get display name (firstName lastName or email) - Requirement 9.2
  const displayName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "User";

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          <Image src="/intaleks.png" alt="Intaleks logo" width={150} height={32} />
        </Link>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Access navigation links and user account options</SheetDescription>

            {/* Logo Header */}
            <div className="px-6 py-6 border-b">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image src="/intaleks.png" alt="Intaleks logo" width={140} height={30} />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) =>
                "dropdown" in link ? (
                  <div key={link.label} className="flex flex-col gap-1 py-2">
                    <span className="text-sm font-semibold text-gray-900 px-2">{link.label}</span>
                    <div className="flex flex-col gap-1 pl-4">
                      {link.dropdown?.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("text-sm py-2.5 px-2 rounded-md transition-colors", pathname === item.href ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-700 hover:bg-gray-50")}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : "isAnchor" in link && link.isAnchor ? (
                  <button
                    key={link.href}
                    onClick={(e) => {
                      handleAnchorClick(e, link.href);
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm py-2.5 px-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={cn("text-sm py-2.5 px-2 rounded-md transition-colors", pathname === link.href ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-700 hover:bg-gray-50")}>
                    {link.label}
                  </Link>
                ),
              )}

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 mt-auto pt-4 pb-6 border-t">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>
                    </div>
                    {isAdminOrHigher(user.role) && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <User className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      disabled={isLoggingOut}
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full border-blue-500 text-blue-500">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            "dropdown" in link ? (
              <div key={link.label} className="relative" onMouseEnter={() => setLearningOpen(true)} onMouseLeave={() => setLearningOpen(false)}>
                <button className={cn("flex items-center gap-1 text-sm transition-colors py-2", pathname.startsWith("/videos") || pathname.startsWith("/articles") ? "text-blue-500 font-medium" : "text-gray-600 hover:text-gray-900")}>
                  {link.label}
                  <ChevronDown className={cn("w-4 h-4 transition-transform", learningOpen && "rotate-180")} />
                </button>
                {learningOpen && (
                  <div className="absolute top-full left-0 pt-1">
                    <div className="bg-white rounded-lg shadow-lg border py-2 min-w-[140px]">
                      {link.dropdown?.map((item) => (
                        <Link key={item.href} href={item.href} className={cn("block px-4 py-2 text-sm transition-colors", pathname === item.href ? "text-blue-500 font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : "isAnchor" in link && link.isAnchor ? (
              <button key={link.href} onClick={(e) => handleAnchorClick(e, link.href)} className={cn("text-sm transition-colors text-gray-600 hover:text-gray-900")}>
                {link.label}
              </button>
            ) : (
              <Link key={link.href} href={link.href} className={cn("text-sm transition-colors", pathname === link.href ? "text-blue-500 font-medium" : "text-gray-600 hover:text-gray-900")}>
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {/* Desktop Auth UI */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthentiating ? (
            // Loading state - Requirement 9.4
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          ) : isAuthenticated && user ? (
            // Logged in state - Requirement 9.2
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {user.firstName && user.lastName && <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>}
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdminOrHigher(user.role) && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/admin">
                      <User className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Not logged in state
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
