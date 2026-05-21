"use client";

import { useState } from "react";

import { useUser } from "@/components/auth/access-guard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardSummary, useReferrals, useCreateWithdrawal } from "@/hooks/use-affiliate-data";
import { Panel, StatCard, StatusTag } from "@/components/affiliate/primitives";

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState<"PayPal" | "Stripe">("PayPal");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const user = useUser();
  const { data: stats, isLoading: loadingStats } = useDashboardSummary();
  const { data: referrals, isLoading: loadingReferrals } = useReferrals();
  const createWithdrawal = useCreateWithdrawal();

  const recentReferrals = referrals?.slice(0, 4) ?? [];
  const referralCode = user?.affiliateProfile?.code ?? user?.email?.split("@")[0]?.toUpperCase()?.slice(0, 8) ?? "—";
  const referralLink = `https://intaleks.com/?ref=${referralCode}`;

  // Find dynamic balance to display and validate against
  const availableBalanceRaw = stats?.find((s) => s.label === "Available Balance")?.value ?? "$0.00";
  const balanceNum = parseFloat(availableBalanceRaw.replace(/[^0-9.]/g, "")) || 0;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function handleRequestWithdrawal() {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (balanceNum < 250) {
      setErrorMsg("Minimum withdrawal amount is $250.00");
      return;
    }

    createWithdrawal.mutate(
      {
        amount: balanceNum,
        method: method,
      },
      {
        onSuccess: () => {
          setSuccessMsg("Withdrawal request submitted successfully!");
          setTimeout(() => setSuccessMsg(null), 3000);
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || "An error occurred submitting withdrawal request.");
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {loadingStats
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
          : stats?.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <Panel title="Your referral link">
            <div className="rounded-lg border border-[var(--affiliate-border-strong)] bg-[var(--affiliate-bg-accent)] p-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-[var(--affiliate-navy)]">
                  {referralLink}
                </p>
                <Button size="sm" className="bg-[var(--affiliate-blue)] hover:bg-[var(--affiliate-blue-strong)]" onClick={copyLink}>
                  {copied ? "Copied!" : "Copy link"}
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Recent referrals">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingReferrals
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell>
                      </TableRow>
                    ))
                  : recentReferrals.map((row) => (
                      <TableRow key={`${row.date}-${row.client}`}>
                        <TableCell className="font-mono text-xs text-[var(--affiliate-muted)]">{row.date}</TableCell>
                        <TableCell>{row.client}</TableCell>
                        <TableCell className="text-[var(--affiliate-muted)]">{row.plan}</TableCell>
                        <TableCell className="font-mono text-emerald-700">{row.commission}</TableCell>
                        <TableCell><StatusTag tone={row.status}>{row.status}</StatusTag></TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Withdraw earnings">
            <div className="text-center">
              {loadingStats ? (
                <Skeleton className="mx-auto h-10 w-28" />
              ) : (
                <p className="font-mono text-4xl font-light text-[var(--affiliate-navy)]">{availableBalanceRaw}</p>
              )}
              <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--affiliate-muted)]">Available now</p>
              <p className="mt-2 text-xs text-[var(--affiliate-muted)]">Min. withdrawal: $250</p>
            </div>
            <div className="mt-4 flex gap-2">
              {(["PayPal", "Stripe"] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={method === value ? "default" : "outline"}
                  className={method === value ? "flex-1 bg-[var(--affiliate-blue)]" : "flex-1"}
                  onClick={() => setMethod(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <Button
              className="mt-4 w-full bg-[var(--affiliate-navy)]"
              onClick={handleRequestWithdrawal}
              disabled={createWithdrawal.isPending || loadingStats}
            >
              {createWithdrawal.isPending ? "Submitting..." : successMsg ? "Request submitted!" : "Request withdrawal"}
            </Button>
            {errorMsg && <p className="mt-2 text-center text-xs font-medium text-red-600">{errorMsg}</p>}
            {successMsg && <p className="mt-2 text-center text-xs font-medium text-emerald-600">{successMsg}</p>}
          </Panel>
        </div>
      </section>
    </div>
  );
}
