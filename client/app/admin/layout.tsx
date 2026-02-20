import { ReactNode } from "react";
import AdminDashboardLayout from "@/components/AdminLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
