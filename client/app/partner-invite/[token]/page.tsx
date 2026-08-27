"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ApiClient } from "@/app/services/api";
import { useAuthState } from "@/app/hooks/useAuthState";

export default function PartnerInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, isAuthentiating } = useAuthState();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const accept = async () => { setBusy(true); try { await ApiClient.acceptPartnerInvitation(token); router.replace("/settings?tab=referrals"); } finally { setBusy(false); } };
  const returnUrl = `/partner-invite/${token}`;
  if (isAuthentiating) return <main className="p-10 text-center">Loading invitation…</main>;
  if (!isAuthenticated) return <main className="mx-auto max-w-lg p-10 text-center"><h1 className="text-2xl font-bold">You&apos;re invited to a Partner firm</h1><p className="mt-3 text-gray-600">Sign in or create an Intaleks account with the email address that received this invitation.</p><div className="mt-6 flex justify-center gap-3"><Link className="rounded bg-blue-600 px-4 py-2 text-white" href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}>Sign in</Link><Link className="rounded border px-4 py-2" href={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`}>Create account</Link></div></main>;
  return <main className="mx-auto max-w-lg p-10 text-center"><h1 className="text-2xl font-bold">Join your Partner firm</h1><p className="mt-3 text-gray-600">Accept this invitation to access the firm&apos;s Partner workspace.</p><button disabled={busy} onClick={accept} className="mt-6 rounded bg-blue-600 px-5 py-2.5 font-semibold text-white">{busy ? "Joining…" : "Accept invitation"}</button></main>;
}
