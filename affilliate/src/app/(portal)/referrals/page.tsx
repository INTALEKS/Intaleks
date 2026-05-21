"use client";

import { useMemo, useState } from "react";

import { Panel, StatusTag } from "@/components/affiliate/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReferrals } from "@/hooks/use-affiliate-data";
import type { ReferralStatus } from "@/lib/affiliate/types";

const filters: Array<{ label: string; value: "all" | ReferralStatus }> = [
  { label: "All", value: "all" },
  { label: "Converted", value: "converted" },
  { label: "Leads", value: "lead" },
  { label: "Pending", value: "pending" },
  { label: "Paid out", value: "paid" },
];

export default function ReferralsPage() {
  const { data, isLoading } = useReferrals();
  const [filter, setFilter] = useState<"all" | ReferralStatus>("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return (data ?? []).filter((row) => {
      const matchesFilter = filter === "all" || row.status === filter;
      const matchesSearch = !search || row.client.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [data, filter, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <Button
            key={item.value}
            variant={filter === item.value ? "default" : "outline"}
            className={filter === item.value ? "bg-[var(--affiliate-navy)]" : ""}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search client..."
          className="ml-auto max-w-52"
        />
      </div>

      <Panel title="All referrals">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Plan value</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-[var(--affiliate-muted)]">No referrals match this filter.</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${row.date}-${row.client}`}>
                  <TableCell className="font-mono text-xs text-[var(--affiliate-muted)]">{row.date}</TableCell>
                  <TableCell>{row.client}</TableCell>
                  <TableCell className="text-[var(--affiliate-muted)]">{row.plan}</TableCell>
                  <TableCell className="font-mono">{row.planValue}</TableCell>
                  <TableCell className="font-mono">{row.commission}</TableCell>
                  <TableCell className="font-mono">{row.available}</TableCell>
                  <TableCell><StatusTag tone={row.status}>{row.status}</StatusTag></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
