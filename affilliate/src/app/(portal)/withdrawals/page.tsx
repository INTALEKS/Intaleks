"use client";

import { useState, useEffect } from "react";

import { useUser } from "@/components/auth/access-guard";
import { InfoRow, Panel, StatusTag } from "@/components/affiliate/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useWithdrawals, useDashboardSummary, useCreateWithdrawal } from "@/hooks/use-affiliate-data";

export default function WithdrawalsPage() {
  const [method, setMethod] = useState<"PayPal" | "Stripe">("PayPal");
  const [amount, setAmount] = useState<string>("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const user = useUser();
  const { data: withdrawals, isLoading: loadingWithdrawals } = useWithdrawals();
  const { data: stats, isLoading: loadingStats } = useDashboardSummary();
  const createWithdrawal = useCreateWithdrawal();

  const availableBalanceRaw = stats?.find((s) => s.label === "Available Balance")?.value ?? "$0.00";
  const balanceNum = parseFloat(availableBalanceRaw.replace(/[^0-9.]/g, "")) || 0;

  // Initialize amount and paypalEmail once data loads
  useEffect(() => {
    if (balanceNum > 0 && !amount) {
      setAmount(balanceNum.toString());
    }
  }, [balanceNum, amount]);

  useEffect(() => {
    if (user?.email && !paypalEmail) {
      setPaypalEmail(user.email);
    }
  }, [user, paypalEmail]);

  const totalPaidOutNum = withdrawals
    ?.filter((w) => w.status === "processed")
    ?.reduce((sum, w) => sum + (parseFloat(w.amount.replace(/[^0-9.]/g, "")) || 0), 0) ?? 0;

  function handleRequestWithdrawal() {
    setErrorMsg(null);
    setSuccessMsg(null);

    const requestAmt = parseFloat(amount);
    if (isNaN(requestAmt) || requestAmt < 250) {
      setErrorMsg("Minimum withdrawal amount is $250.00");
      return;
    }

    if (requestAmt > balanceNum) {
      setErrorMsg("Amount exceeds your available balance");
      return;
    }

    createWithdrawal.mutate(
      {
        amount: requestAmt,
        method,
        paypalEmail: method === "PayPal" ? paypalEmail : undefined,
      },
      {
        onSuccess: () => {
          setSuccessMsg("Withdrawal request submitted successfully!");
          setAmount("");
          setTimeout(() => setSuccessMsg(null), 4000);
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || "An error occurred submitting withdrawal request.");
        },
      }
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
      <Panel title="Request a withdrawal">
        <div className="text-center">
          {loadingStats ? (
            <Skeleton className="mx-auto h-10 w-32" />
          ) : (
            <p className="font-mono text-4xl font-light text-[var(--affiliate-navy)]">{availableBalanceRaw}</p>
          )}
          <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--affiliate-muted)]">Available balance</p>
          <p className="mt-2 text-xs text-[var(--affiliate-muted)]">Min. withdrawal: $250</p>
        </div>
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-xs text-[var(--affiliate-muted)]">
            <span>Amount</span>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min={250}
              max={balanceNum}
              placeholder="0.00"
            />
          </label>
          <div>
            <p className="mb-2 text-xs text-[var(--affiliate-muted)]">Payout method</p>
            <div className="flex gap-2">
              {(["PayPal", "Stripe"] as const).map((value) => (
                <Button key={value} className="flex-1" variant={method === value ? "default" : "outline"} onClick={() => setMethod(value)}>
                  {value}
                </Button>
              ))}
            </div>
          </div>
          {method === "PayPal" && (
            <label className="flex flex-col gap-1 text-xs text-[var(--affiliate-muted)]">
              <span>PayPal email</span>
              <Input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} type="email" placeholder="email@address.com" />
            </label>
          )}
        </div>
        <div className="mt-4 rounded-md border border-[var(--affiliate-border-strong)] bg-[var(--affiliate-bg-accent)] p-3 text-xs text-[var(--affiliate-muted)]">
          Processed manually within 2–5 business days.
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

      <Panel title="Withdrawal history">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingWithdrawals ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))
            ) : !withdrawals || withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-[var(--affiliate-muted)]">
                  No payout history found.
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((row) => (
                <TableRow key={row.reference}>
                  <TableCell className="font-mono text-xs text-[var(--affiliate-muted)]">{row.date}</TableCell>
                  <TableCell className="font-mono text-emerald-700">{row.amount}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell className="font-mono text-xs text-[var(--affiliate-muted)]">{row.reference}</TableCell>
                  <TableCell>
                    <StatusTag tone={row.status === "processed" ? "processed" : "pending"}>
                      {row.status}
                    </StatusTag>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="mt-3 border-t border-[var(--affiliate-border)] pt-2">
          {loadingWithdrawals ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <InfoRow
              label="Total paid out"
              value={`$${totalPaidOutNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          )}
          <InfoRow label="Commission rate" value="25%" />
        </div>
      </Panel>
    </div>
  );
}
