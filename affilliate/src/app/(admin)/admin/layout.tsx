import { AdminShell } from "@/components/admin/admin-shell";
import { AccessGuard } from "@/components/auth/access-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccessGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]} loadingLabel="Verifying admin access...">
      <AdminShell>{children}</AdminShell>
    </AccessGuard>
  );
}
