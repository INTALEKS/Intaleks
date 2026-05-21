"use client";

import { useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getMainAppUrl() {
  return process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "https://intaleks.com";
}

export default function AdminLoginPage() {
  useEffect(() => {
    const next = encodeURIComponent("/admin/overview");
    window.location.href = `${getMainAppUrl()}/login?next=${next}`;
  }, []);

  return (
    <Card className="rounded-xl border-[var(--affiliate-border)] shadow-none">
      <CardHeader>
        <CardTitle className="text-[var(--affiliate-navy)]">Use Intaleks Sign In</CardTitle>
        <CardDescription>Admin access uses your existing Intaleks account.</CardDescription>
      </CardHeader>
      <CardContent>
        <a
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--affiliate-navy)] px-4 py-2 text-sm font-medium text-white"
          href={`${getMainAppUrl()}/login?next=${encodeURIComponent("/admin/overview")}`}
        >
          Continue to Intaleks Login
        </a>
      </CardContent>
    </Card>
  );
}
