"use client";

import { InfoRow, Panel } from "@/components/affiliate/primitives";
import { useTermsMeta } from "@/hooks/use-affiliate-data";

export default function TermsPage() {
  const { data } = useTermsMeta();

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Panel title="Intaleks Affiliate Programme — Terms & Conditions">
        <p className="mb-4 text-xs text-[var(--affiliate-muted)]">
          Effective {data?.effectiveDate} · Version {data?.version}
        </p>
        <div className="space-y-4 text-sm leading-7 text-[var(--affiliate-muted)]">
          <p><strong className="text-[var(--affiliate-navy)]">1. Acceptance.</strong> By registering for the Intaleks Affiliate Programme, you agree to these terms.</p>
          <p><strong className="text-[var(--affiliate-navy)]">2. Referral tracking.</strong> A 30-day attribution cookie is used, and only one affiliate may be credited per conversion.</p>
          <p><strong className="text-[var(--affiliate-navy)]">3. Commission.</strong> Commission is 25% of net plan value, subject to a 3-day hold, and reversible for refunded/fraudulent transactions.</p>
          <p><strong className="text-[var(--affiliate-navy)]">4. Withdrawals.</strong> Minimum withdrawal is $250 USD and payouts are processed in 2-5 business days.</p>
          <p><strong className="text-[var(--affiliate-navy)]">5. Prohibited conduct.</strong> No self-referral, spam, deceptive claims, or unauthorized brand modifications.</p>
          <p><strong className="text-[var(--affiliate-navy)]">6. Governing law.</strong> New South Wales, Australia.</p>
        </div>
      </Panel>

      <div className="flex flex-col gap-4">
        <Panel title="Quick reference">
          <InfoRow label="Commission" value="25% per conversion" />
          <InfoRow label="Holding period" value="3 days" />
          <InfoRow label="Min withdrawal" value="$250" />
          <InfoRow label="Attribution" value="30-day cookie" />
          <InfoRow label="Payouts" value="PayPal · Stripe" />
        </Panel>
        <Panel title="Your acceptance">
          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
            Accepted on {data?.acceptedDate} · Version {data?.version}
          </div>
        </Panel>
      </div>
    </div>
  );
}
