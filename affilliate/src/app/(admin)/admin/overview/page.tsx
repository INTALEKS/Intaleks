"use client";

import { AdminPanel, AdminStatCard, AdminStatusTag } from "@/components/admin/primitives";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/states";
import { useAdminOverviewSummary } from "@/hooks/use-admin-data";

export default function AdminOverviewPage() {
  const { data, isLoading, isError, refetch } = useAdminOverviewSummary();
  if (isLoading) return <AdminLoadingState label="Loading overview..." />;
  if (isError) return <AdminErrorState title="Could not load overview" description="Please retry." retry={() => void refetch()} />;
  const pending = data.applications.filter((item) => item.status === "pending").length;
  const active = data.affiliates.filter((item) => item.status === "active").length;
  const totalEarned = data.affiliates.reduce((sum, item) => sum + item.earned, 0);
  const pendingWd = data.withdrawals.filter((item) => item.status === "requested").length;
  const pendingWdAmt = data.withdrawals.filter((item) => item.status === "requested").reduce((sum, item) => sum + item.amount, 0);
  const max = Math.max(...data.monthlyPayouts);

  return (
    <div className="admin-page">
      <section className="admin-grid-cards">
        <AdminStatCard label="Active Affiliates" value={String(active)} detail={`${pending} pending review`} />
        <AdminStatCard label="Total Commissions Paid" value={`$${totalEarned.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`} detail="All time" />
        <AdminStatCard label="Pending Payouts" value={String(pendingWd)} detail={`$${pendingWdAmt.toLocaleString("en-AU", { minimumFractionDigits: 2 })} total`} />
        <AdminStatCard label="New Applications" value={String(pending)} detail="Awaiting review" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <AdminPanel title="Monthly commission payouts">
          <div className="flex h-36 items-end gap-2">
            {data.monthlyPayouts.map((value, index) => (
              <div key={data.monthlyPayoutMonths[index]} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[10px] text-[var(--affiliate-navy)]">${(value / 1000).toFixed(1)}k</span>
                <div className="w-full rounded-t bg-[var(--affiliate-blue)]" style={{ height: `${Math.round((value / max) * 110)}px` }} />
                <span className="text-[10px] text-[var(--affiliate-muted)]">{data.monthlyPayoutMonths[index]}</span>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Top affiliates">
          <div className="space-y-2">
            {data.affiliates.filter((item) => item.status === "active").sort((a, b) => b.earned - a.earned).slice(0, 3).map((affiliate) => (
              <div key={affiliate.id} className="flex items-center justify-between rounded-md border border-[var(--affiliate-border)] p-2">
                <div>
                  <p className="text-sm font-medium text-[var(--affiliate-navy)]">{affiliate.name}</p>
                  <p className="text-xs text-[var(--affiliate-muted)]">{affiliate.converted} conversions</p>
                </div>
                <p className="font-mono text-sm text-emerald-700">${affiliate.earned.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel title="Latest payout requests">
        <div className="space-y-2">
          {data.withdrawals.filter((item) => item.status === "requested").slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-[var(--affiliate-border)] p-2">
              <div>
                <p className="text-sm text-[var(--affiliate-navy)]">{item.affiliate}</p>
                <p className="text-xs text-[var(--affiliate-muted)]">{item.requested}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-[var(--affiliate-navy)]">${item.amount.toFixed(2)}</span>
                <AdminStatusTag tone="requested">Requested</AdminStatusTag>
              </div>
            </div>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}
