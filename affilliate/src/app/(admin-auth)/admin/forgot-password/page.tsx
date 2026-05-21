import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getMainAppUrl() {
  return process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "https://intaleks.com";
}

export default function AdminForgotPasswordPage() {
  return (
    <Card className="rounded-xl border-[var(--affiliate-border)] shadow-none">
      <CardHeader>
        <CardTitle className="text-[var(--affiliate-navy)]">Reset From Intaleks</CardTitle>
        <CardDescription>Password reset is managed from your main Intaleks auth flow.</CardDescription>
      </CardHeader>
      <CardContent>
        <a
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--affiliate-navy)] px-4 py-2 text-sm font-medium text-white"
          href={`${getMainAppUrl()}/auth/forgot-password`}
        >
          Open Intaleks Password Reset
        </a>
      </CardContent>
    </Card>
  );
}
