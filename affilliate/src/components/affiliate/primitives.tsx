import { cva } from "class-variance-authority";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusClass = cva("rounded-full px-2 py-0 text-[10px] font-medium", {
  variants: {
    tone: {
      converted: "bg-emerald-50 text-emerald-700",
      pending: "bg-amber-50 text-amber-700",
      lead: "bg-sky-50 text-sky-700",
      paid: "bg-violet-50 text-violet-700",
      processed: "bg-violet-50 text-violet-700",
      available: "bg-sky-50 text-sky-700",
      hold: "bg-amber-50 text-amber-700",
    },
  },
});

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl border-[var(--affiliate-border)] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardTitle className="text-sm font-medium text-[var(--affiliate-navy)]">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "info" | "success" | "warning" | "accent";
}) {
  const toneClass: Record<typeof tone, string> = {
    info: "before:bg-[var(--affiliate-blue)]",
    success: "before:bg-[var(--affiliate-green)]",
    warning: "before:bg-[var(--affiliate-orange)]",
    accent: "before:bg-[var(--affiliate-purple)]",
  };

  return (
    <Card className={cn("relative overflow-hidden rounded-xl border-[var(--affiliate-border)] shadow-none before:absolute before:inset-y-0 before:left-0 before:w-1", toneClass[tone])}>
      <CardContent className="p-5">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--affiliate-muted)]">{label}</p>
        <p className="mt-3 font-mono text-3xl font-light text-[var(--affiliate-navy)]">{value}</p>
        <p className="mt-2 text-xs text-[var(--affiliate-blue)]">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function StatusTag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone:
    | "converted"
    | "pending"
    | "lead"
    | "paid"
    | "processed"
    | "available"
    | "hold";
}) {
  return <Badge className={statusClass({ tone })}>{children}</Badge>;
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--affiliate-border)] py-2 text-sm last:border-0">
      <span className="text-[var(--affiliate-muted)]">{label}</span>
      <span className="font-mono text-[var(--affiliate-navy)]">{value}</span>
    </div>
  );
}
