"use client";

import { ReactNode, useEffect } from "react";
import AppSidebar from "./general-ui/AppSidebar";
import { useAuthState } from "@/app/hooks/useAuthState";
import { isAdminOrHigher } from "@/lib/role-utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthentiating, isAuthenticated, user } = useAuthState();

  const isAdmin = isAdminOrHigher(user?.role);

  // Debug logging
  console.log("Admin Layout Debug:", {
    isAuthentiating,
    isAuthenticated,
    userRole: user?.role,
    isAdmin,
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
  });

  // Handle redirect in useEffect to avoid render-time navigation
  useEffect(() => {
    if (!isAuthentiating) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push("/login");
      } else if (!isAdmin) {
        // Redirect non-admin users to home page
        console.log("Not admin, redirecting to home");
        router.push("/");
      }
    }
  }, [isAuthentiating, isAuthenticated, isAdmin, router]);

  if (isAuthentiating) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex items-center gap-x-2">
          <Loader2 className="animate-spin" />
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="h-screen flex">
      <AppSidebar />

      <div className="w-full p-2">
        {/* <header className="flex justify-between items-center">
          <div className="flex items-center gap-x-2">
            <button onClick={() => router.push("/admin/subscriptions")} className="flex items-center gap-x-1 bg-(--light-blue) rounded-md px-2 py-1.5 cursor-pointer text-black text-sm hover:bg-(--light-blue)/80 transition-colors">
              <Image src={LinkIcon} alt="Link Icon" width={16} height={16} />
              <span>Manage Subscription</span>
              <Image src={ChevronLeft} alt="Icon" width={16} height={16} className="ml-auto" />
            </button>

            <button onClick={() => router.push("/admin/users")} className="flex items-center gap-x-1 bg-(--light-blue) rounded-md px-2 py-1.5 cursor-pointer text-black text-sm hover:bg-(--light-blue)/80 transition-colors">
              <Image src={LinkIcon} alt="Link Icon" width={16} height={16} />
              <span>Manage User</span>
              <Image src={ChevronLeft} alt="Icon" width={16} height={16} className="ml-auto" />
            </button>

            <button onClick={() => router.push("/admin/contacts")} className="flex items-center gap-x-1 bg-(--light-blue) rounded-md px-2 py-1.5 cursor-pointer text-black text-sm hover:bg-(--light-blue)/80 transition-colors">
              <Image src={LinkIcon} alt="Link Icon" width={16} height={16} />
              <span>Manage Contact</span>
              <Image src={ChevronLeft} alt="Icon" width={16} height={16} className="ml-auto" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-x-2 border-none outline-none">
              <div className="flex justify-between items-center w-48 hover:bg-(--hover-bg) duration-300 transition-colors p-1 rounded-sm">
                <div className="flex items-center gap-x-2">
                  <Image src={OwnerImage} alt="Owner Image" className="rounded-md" width={30} height={30} />
                  <div className="flex flex-col gap-0">
                    <h3 className="font-medium text-sm text-left">{user?.name || "Admin User"}</h3>
                    <span className="text-[10px]">{user?.email}</span>
                  </div>
                </div>

                <Image src={ChevronLeft} alt="Icon" width={20} height={20} />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" className="w-48">
              <DropdownMenuItem>
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header> */}

        <div className="h-[calc(100dvh-3.5rem)] overflow-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
