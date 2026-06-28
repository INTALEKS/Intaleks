"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import AppSidebarItem from "./AppSidebarItem";

import DashboardIcon from "@/app/assets/dashboard-Icon.svg";
import SubscribePlanIcon from "@/app/assets/subscribe-icons.svg";
import SubscribeUserIcon from "@/app/assets/subscribe-users-icons.svg";
import VideoManageIcon from "@/app/assets/video-management.svg";
import ForumIcon from "@/app/assets/forum-icon.svg";
import EventManageIcon from "@/app/assets/event-manage.svg";
import NotificationIcon from "@/app/assets/notify.svg";
// import SettingsIcon from "@/app/assets/settings.svg";
import RevenueIcon from "@/app/assets/revenue.svg";
import LinkIcon from "@/app/assets/link.svg";
import OwnerImage from "@/app/assets/images/owner.png";
import ChevronLeft from "@/app/assets/chevron-left.svg";

import Link from "next/link";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useAdminAuth } from "@/app/hooks/useAuth";
import { isSuperAdmin } from "@/lib/role-utils";

const PRIMARY_NAV_ITEMS = [
  { icon: DashboardIcon, text: "Dashboard", path: "/admin/dashboard" },
  { icon: SubscribePlanIcon, text: "Subscription Plans", path: "/admin/subscription-plans" },
  { icon: SubscribeUserIcon, text: "Users Management", path: "/admin/users" },
  { icon: RevenueIcon, text: "Payment Management", path: "/admin/payments" },
  { icon: ForumIcon, text: "Forum Management", path: "/admin/forum" },
  { icon: VideoManageIcon, text: "Video Management", path: "/admin/videos" },
  { icon: EventManageIcon, text: "Event Management", path: "/admin/events" },
  { icon: RevenueIcon, text: "Valuation Multiples", path: "/admin/valuation-multiples" },
] as const;

export default function AppSidebar() {
  const pathname = usePathname();

  const { user } = useAuthState();
  const { logout } = useAdminAuth();

  return (
    <aside className="w-68 min-w-68 max-w-68 p-2 flex flex-col justify-between h-screen shrink-0">
      <div className="flex-1 overflow-y-auto sidebar-scrollbar pr-1 py-2">
        <Link href="/">
          <Image src="/intaleks.jpg" alt="Intaleks Logo" width={150} height={30} className="mb-5" />
        </Link>

        <div className="flex flex-col gap-1">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <AppSidebarItem key={item.text} icon={item.icon} text={item.text} path={item.path} isActive={pathname === item.path || pathname.startsWith(item.path + "/")} />
          ))}
          {isSuperAdmin(user?.role) && <AppSidebarItem icon={SubscribePlanIcon} text="Coupon Codes" path="/admin/coupons" isActive={pathname === "/admin/coupons"} />}
        </div>
      </div>

      <div className="w-full mt-4 shrink-0">
        <div className="flex items-center flex-col gap-y-2.5 p-3 bg-(--light-gray-bg) rounded-md w-full mb-4">
          <div className="flex items-center gap-x-1 w-full justify-between">
            <Image src={NotificationIcon} alt="Dashboard Icon" width={16} height={16} />
            <span className="bg-[#0BD6FF4D] text-[10px] w-[35px] h-[20px] rounded-[15px] flex justify-center items-center">New</span>
          </div>

          <div>
            <h3 className="font-medium text-sm">Manage Subscription</h3>
            <p className="text-[12px] font-lig">Check this out, user14$ subscribed to $495 per month, generated 25 valuation reports with their handles and add.... </p>
          </div>

          <div className="flex items-center gap-x-2 w-full justify-between">
            <span className="text-[12px]">Quick link</span>
            <Image src={LinkIcon} alt="Link Icon" width={16} height={16} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-x-2 border-none outline-none">
              <div className="flex justify-between items-center w-full hover:bg-(--hover-bg) duration-300 transition-colors p-1 rounded-sm">
                <div className="flex items-center gap-x-2">
                  <Image src={user?.avatar || OwnerImage} alt="User Avatar" className="rounded-md object-cover" width={30} height={30} />
                  <div className="flex flex-col gap-0">
                    <h3 className="font-medium text-sm text-left">{user?.name || "Admin User"}</h3>
                    <span className="text-[10px]">{user?.email}</span>
                  </div>
                </div>

                <Image src={ChevronLeft} alt="Icon" width={20} height={20} />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" className="w-64">
              <DropdownMenuItem>
                <Link className="w-full" href="/settings">
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={logout}>
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
