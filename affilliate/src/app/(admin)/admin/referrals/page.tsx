"use client";

import { useMemo, useState } from "react";

import { AdminFilterPills, AdminPanel, AdminStatCard, AdminStatusTag } from "@/components/admin/primitives";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/states";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminReferrals } from "@/hooks/use-admin-data";
import type { AdminReferralStatus } from "@/lib/admin/types";

export default function AdminReferralsPage() {
  const { data, isLoading, isError, refetch } = useAdminReferrals();
  const [filter, setFilter] = useState<"all" | AdminReferralStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => data.filter((item) => (filter === "all" || item.status === filter) && [item.affiliate, item.client].join(" ").toLowerCase().includes(search.toLowerCase())),
    [data, filter, search]
  );

  const totalComm = filtered.reduce((sum, row) => sum + row.commission, 0);

  if (isLoading) return <AdminLoadingState label="Loading referrals..." />;
  if (isError) return <AdminErrorState title="Could not load referrals" description="Please retry." retry={() => void refetch()} />;

  return (
    <div className="admin-page">
      <div className="flex flex-wrap items-center gap-2">
        <AdminFilterPills value={filter} onChange={(value) => setFilter(value as "all" | AdminReferralStatus)} options={[{ value: "all", label: "All" }, { value: "converted", label: "Converted" }, { value: "pending", label: "Pending" }, { value: "lead", label: "Lead" }]} />
        <Input className="w-full md:ml-auto md:w-56" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search affiliate or client..." />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label="Shown referrals" value={String(filtered.length)} detail="Current filters" />
        <AdminStatCard label="Commission total" value={`$${totalComm.toFixed(2)}`} detail="Filtered sum" />
        <AdminStatCard label="Conversion rate" value={`${Math.round((data.filter((row) => row.status === "converted").length / data.length) * 100)}%`} detail="All referrals" />
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState title="No referrals found" description="Try another filter or search term." />
      ) : (
      <AdminPanel title="Full referral log">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Date</TableHead><TableHead>Affiliate</TableHead><TableHead>Client</TableHead><TableHead>Plan</TableHead><TableHead>Plan value</TableHead><TableHead>Commission</TableHead><TableHead>Status</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-[var(--affiliate-muted)]">{row.date}</TableCell>
                <TableCell className="font-medium">{row.affiliate}</TableCell>
                <TableCell>{row.client}</TableCell>
                <TableCell className="text-[var(--affiliate-muted)]">{row.plan}</TableCell>
                <TableCell className="font-mono">{row.value > 0 ? `$${row.value}` : "—"}</TableCell>
                <TableCell className="font-mono">{row.commission > 0 ? `$${row.commission.toFixed(2)}` : "—"}</TableCell>
                <TableCell><AdminStatusTag tone={row.status}>{row.status}</AdminStatusTag></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminPanel>
      )}
    </div>
  );
}
