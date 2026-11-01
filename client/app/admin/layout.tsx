import { ReactNode } from "react";
import type { Metadata } from "next";
import AdminDashboardLayout from "@/components/AdminLayout";

export const metadata: Metadata = {
  title: { absolute: "Intaleks Admin" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
