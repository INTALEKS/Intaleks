import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-xl border-[var(--affiliate-border)] shadow-none">
      <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
        <Inbox className="size-6 text-[var(--affiliate-muted)]" />
        <p className="text-sm font-medium text-[var(--affiliate-navy)]">{title}</p>
        <p className="max-w-md text-xs text-[var(--affiliate-muted)]">{description}</p>
      </CardContent>
    </Card>
  );
}

export function AdminLoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card className="rounded-xl border-[var(--affiliate-border)] shadow-none">
      <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--affiliate-muted)]">
        <Loader2 className="size-4 animate-spin" />
        {label}
      </CardContent>
    </Card>
  );
}

export function AdminErrorState({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <Card className="rounded-xl border-rose-200 shadow-none">
      <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
        <AlertTriangle className="size-6 text-rose-600" />
        <p className="text-sm font-medium text-rose-700">{title}</p>
        <p className="max-w-md text-xs text-rose-600">{description}</p>
        {retry ? (
          <Button variant="outline" size="sm" onClick={retry}>
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
