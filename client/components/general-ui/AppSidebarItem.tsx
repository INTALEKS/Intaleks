"use client";

import Image, { type StaticImageData } from "next/image";

import { cn } from "@/lib/utils";
import Link from "next/link";

type AppSidebarItemProps = {
  icon: StaticImageData | string;
  text: string;
  path: string;
  isActive?: boolean;
  onSelect?: () => void;
};

export default function AppSidebarItem({ icon, text, path, isActive = false, onSelect }: AppSidebarItemProps) {
  return (
    <Link href={path} onClick={onSelect} className={cn("w-full text-left flex items-center gap-x-1.5 py-2 px-3 rounded-sm cursor-pointer text-sm transition-colors duration-200", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", isActive ? "bg-(--hover-bg) text-sidebar-primary font-medium" : "bg-transparent text-(--text-primary-dark) hover:bg-(--hover-bg)")}>
      <Image src={icon} alt={`${text} Icon`} width={20} height={20} />
      <span>{text}</span>
    </Link>
  );
}
