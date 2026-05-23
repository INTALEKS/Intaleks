"use client";

import { useMemo, useState } from "react";

import { AdminFilterPills, AdminPanel, AdminStatCard, AdminStatusTag } from "@/components/admin/primitives";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminWithdrawals } from "@/hooks/use-admin-data";
import { api } from "@/lib/api";
import type { AdminWithdrawal, AdminWithdrawalStatus } from "@/lib/admin/types";

export default function AdminWithdrawalsPage() {
  const { data, isLoading, isError, refetch } = useAdminWithdrawals();
  const [filter, setFilter] = useState<"all" | AdminWithdrawalStatus>("requested");
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>(data);
  const [refs, setRefs] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () => withdrawals.filter((item) => (filter === "all" ? true : item.status === filter)),
    [withdrawals, filter]
  );

  const pendingItems = withdrawals.filter((item) => item.status === "requested");
  const pendingAmt = pendingItems.reduce((sum, item) => sum + item.amount, 0);

  async function markProcessed(id: string) {
    const ref = refs[id]?.trim();
    if (!ref) return;
    await api.patch(`/api/admin/affiliate/withdrawals/${id}/process`, { reference: ref });
    setWithdrawals((current) => current.map((item) => (item.id === id ? { ...item, status: "processed", ref } : item)));
  }

  if (isLoading) return <AdminLoadingState label="Loading payouts..." />;
  if (isError) return <AdminErrorState title="Could not load payouts" description="Please retry." retry={() => void refetch()} />;

  return (
    <div className="admin-page">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label="Pending requests" value={String(pendingItems.length)} detail="Awaiting processing" />
        <AdminStatCard label="Pending amount" value={`$${pendingAmt.toFixed(2)}`} detail="Total requested" />
        <AdminStatCard label="Total processed" value={String(withdrawals.filter((item) => item.status === "processed").length)} detail="Completed payouts" />
      </div>

      <AdminFilterPills value={filter} onChange={(value) => setFilter(value as "all" | AdminWithdrawalStatus)} options={[{ value: "requested", label: "Requested" }, { value: "processed", label: "Processed" }, { value: "all", label: "All" }]} />

      {filtered.length === 0 ? (
        <AdminEmptyState title="No payouts found" description="Try a different filter." />
      ) : (
      <AdminPanel title="Payout requests">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Affiliate</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Payout account</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead><TableHead>Transaction ref</TableHead><TableHead>Action</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const missingRef = item.status === "requested" && !(refs[String(item.id)] ?? "").trim();
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.affiliate}</TableCell>
                  <TableCell className="font-mono text-emerald-700">${item.amount.toFixed(2)}</TableCell>
                  <TableCell>{item.method}</TableCell>
                  <TableCell className="font-mono text-xs text-[var(--affiliate-muted)]">{item.paypal}</TableCell>
                  <TableCell className="text-xs text-[var(--affiliate-muted)]">{item.requested}</TableCell>
                  <TableCell><AdminStatusTag tone={item.status}>{item.status}</AdminStatusTag></TableCell>
                  <TableCell>
                    {item.status === "processed" ? (
                      <span className="font-mono text-xs text-violet-700">{item.ref}</span>
                    ) : (
                      <div className="space-y-1">
                        <Input value={refs[String(item.id)] ?? ""} onChange={(e) => setRefs((current) => ({ ...current, [String(item.id)]: e.target.value }))} placeholder="e.g. PP-1234XY" className="h-8 text-xs" />
                        {missingRef ? <p className="text-[10px] text-rose-600">Enter reference to process</p> : null}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.status === "requested" ? (
                      <Button size="sm" variant="outline" disabled={missingRef} onClick={() => void markProcessed(String(item.id))}>Mark processed</Button>
                    ) : (
                      <span className="text-xs text-violet-700">Done</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </AdminPanel>
      )}
    </div>
  );
}
