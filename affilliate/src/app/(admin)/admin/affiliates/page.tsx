"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPanel, AdminStatusTag } from "@/components/admin/primitives";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminAffiliates } from "@/hooks/use-admin-data";
import { api } from "@/lib/api";
import type { AdminAffiliate } from "@/lib/admin/types";

export default function AdminAffiliatesPage() {
  const { data, isLoading, isError, refetch } = useAdminAffiliates();
  const [search, setSearch] = useState("");
  const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([]);

  useEffect(() => {
    if (data) {
      setAffiliates(data);
    }
  }, [data]);

  const filtered = useMemo(
    () => affiliates.filter((item) => [item.name, item.company, item.code].join(" ").toLowerCase().includes(search.toLowerCase())),
    [affiliates, search]
  );

  async function toggleStatus(id: string) {
    await api.patch(`/api/admin/affiliate/affiliates/${id}/toggle-status`);
    setAffiliates((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "active" ? "suspended" : "active" }
          : item
      )
    );
  }

  if (isLoading) return <AdminLoadingState label="Loading affiliates..." />;
  if (isError) return <AdminErrorState title="Could not load affiliates" description="Please retry." retry={() => void refetch()} />;

  return (
    <AdminPanel title="All affiliates" action={<Input className="w-full md:w-56" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search affiliate or code..." />}>
      {filtered.length === 0 ? (
        <AdminEmptyState title="No affiliates found" description="Try another search term." />
      ) : (
      <Table>
        <TableHeader>
          <TableRow><TableHead>Affiliate</TableHead><TableHead>Company</TableHead><TableHead>Ref code</TableHead><TableHead>Referrals</TableHead><TableHead>Converted</TableHead><TableHead>Total earned</TableHead><TableHead>Pending</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell><p className="font-medium text-[var(--affiliate-navy)]">{item.name}</p><p className="text-xs text-[var(--affiliate-muted)]">{item.email}</p></TableCell>
              <TableCell>{item.company}</TableCell>
              <TableCell className="font-mono text-xs text-[var(--affiliate-blue)]">{item.code}</TableCell>
              <TableCell className="font-mono">{item.referrals}</TableCell>
              <TableCell className="font-mono">{item.converted}</TableCell>
              <TableCell className="font-mono text-emerald-700">${item.earned.toFixed(2)}</TableCell>
              <TableCell className="font-mono text-amber-700">${item.pending.toFixed(2)}</TableCell>
              <TableCell className="text-xs text-[var(--affiliate-muted)]">{item.joined}</TableCell>
              <TableCell><AdminStatusTag tone={item.status}>{item.status}</AdminStatusTag></TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => void toggleStatus(String(item.id))}>{item.status === "active" ? "Suspend" : "Reactivate"}</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
    </AdminPanel>
  );
}
