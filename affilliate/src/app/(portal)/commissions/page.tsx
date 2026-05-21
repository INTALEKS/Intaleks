"use client";

import { Panel, StatCard, StatusTag } from "@/components/affiliate/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCommissions } from "@/hooks/use-affiliate-data";

export default function CommissionsPage() {
  const { data, isLoading } = useCommissions();

  const totalEarnedNum = data?.commissionLog.reduce((sum, row) => sum + parseFloat(row.commission.replace(/[^0-9.]/g, "") || "0"), 0) ?? 0;
  const max = Math.max(...(data?.monthlyEarnings.map((item) => item.value) ?? [1]));
  const totalBreakdown = data?.planBreakdown.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  const currentMonthVal = data?.monthlyEarnings[data?.monthlyEarnings.length - 1]?.value ?? 0;
  const lastMonthVal = data?.monthlyEarnings[data?.monthlyEarnings.length - 2]?.value ?? 0;
  let growthPercent = 0;
  if (lastMonthVal > 0) {
    growthPercent = Math.round(((currentMonthVal - lastMonthVal) / lastMonthVal) * 100);
  }
  const growthLabel = growthPercent >= 0 ? `+${growthPercent}% vs last month` : `${growthPercent}% vs last month`;

  const conversionsCount = data?.commissionLog.filter(row => row.status === "available").length ?? 0;
  const avgPerConversion = conversionsCount > 0 ? Math.round(totalEarnedNum / conversionsCount) : 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard
              label="Total earned"
              value={`$${totalEarnedNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              detail="All time"
              tone="info"
            />
            <StatCard
              label="This month"
              value={`$${currentMonthVal.toLocaleString("en-US")}`}
              detail={growthLabel}
              tone="success"
            />
            <StatCard
              label="Avg per conversion"
              value={`$${avgPerConversion.toLocaleString("en-US")}`}
              detail={`${conversionsCount} conversion${conversionsCount === 1 ? "" : "s"}`}
              tone="accent"
            />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Panel title="Monthly earnings">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="flex h-36 items-end gap-3">
              {data?.monthlyEarnings.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-mono text-xs">${item.value}</span>
                  <div className="w-full rounded-t bg-[var(--affiliate-blue)]" style={{ height: `${Math.round((item.value / max) * 100)}px` }} />
                  <span className="text-xs text-[var(--affiliate-muted)]">{item.month}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="By plan">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="flex flex-col gap-4">
              {data?.planBreakdown.map((item) => (
                <div key={item.plan}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{item.plan}</span>
                    <span className="font-mono">${item.amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded bg-[var(--affiliate-bg)]">
                    <div className="h-full rounded" style={{ width: `${Math.round((item.amount / (totalBreakdown || 1)) * 100)}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Panel title="Commission log">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Plan</TableHead><TableHead>Plan value</TableHead><TableHead>Rate</TableHead><TableHead>Commission</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-5 w-full" /></TableCell></TableRow>)
              : data?.commissionLog.map((row) => (
                  <TableRow key={`${row.date}-${row.client}`}>
                    <TableCell className="font-mono text-xs text-[var(--affiliate-muted)]">{row.date}</TableCell>
                    <TableCell>{row.client}</TableCell>
                    <TableCell className="text-[var(--affiliate-muted)]">{row.plan}</TableCell>
                    <TableCell className="font-mono">{row.planValue}</TableCell>
                    <TableCell className="font-mono">{row.rate}</TableCell>
                    <TableCell className="font-mono">{row.commission}</TableCell>
                    <TableCell><StatusTag tone={row.status}>{row.status}</StatusTag></TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
