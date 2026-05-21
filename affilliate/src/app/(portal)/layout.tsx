import { AffiliateGate } from "@/components/affiliate/affiliate-gate";
import { PortalShell } from "@/components/affiliate/portal-shell";
import { AccessGuard } from "@/components/auth/access-guard";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccessGuard loadingLabel="Verifying your account...">
      <AffiliateGate>
        <PortalShell>{children}</PortalShell>
      </AffiliateGate>
    </AccessGuard>
  );
}
