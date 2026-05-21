import { cva } from "class-variance-authority";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClass = cva("rounded-full px-2 py-0 text-[10px] font-medium", {
  variants: {
    tone: {
      converted: "bg-emerald-50 text-emerald-700",
      pending: "bg-amber-50 text-amber-700",
      lead: "bg-sky-50 text-sky-700",
      active: "bg-emerald-50 text-emerald-700",
      suspended: "bg-rose-50 text-rose-700",
      approved: "bg-emerald-50 text-emerald-700",
      rejected: "bg-rose-50 text-rose-700",
      requested: "bg-amber-50 text-amber-700",
      processed: "bg-violet-50 text-violet-700",
    },
  },
});

export function AdminPanel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="rounded-xl border-[var(--affiliate-border)] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm text-[var(--affiliate-navy)]">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminStatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="rounded-xl border-[var(--affiliate-border)] shadow-none">
      <CardContent className="p-4">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--affiliate-muted)]">{label}</p>
        <p className="mt-2 font-mono text-2xl font-light text-[var(--affiliate-navy)]">{value}</p>
        <p className="mt-2 text-xs text-[var(--affiliate-muted)]">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function AdminStatusTag({ tone, children }: { tone: "converted" | "pending" | "lead" | "active" | "suspended" | "approved" | "rejected" | "requested" | "processed"; children: React.ReactNode }) {
  return <Badge className={toneClass({ tone })}>{children}</Badge>;
}

export function AdminFilterPills({ options, value, onChange }: { options: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void; }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md border px-3 py-1 text-xs font-medium",
            value === option.value ? "border-[var(--affiliate-navy)] bg-[var(--affiliate-navy)] text-white" : "border-[var(--affiliate-border)] bg-white text-[var(--affiliate-muted)]"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
