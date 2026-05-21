"use client";

import { Download } from "lucide-react";

import { Panel } from "@/components/affiliate/primitives";
import { Button } from "@/components/ui/button";
import { useMarketingAssets } from "@/hooks/use-affiliate-data";

function AssetPreview({ preview }: { preview: string }) {
  const tone: Record<string, string> = {
    email: "bg-sky-50",
    linkedin: "bg-slate-100",
    pdf: "bg-amber-50",
    logo: "bg-violet-50",
    wa: "bg-emerald-50",
    slides: "bg-rose-50",
  };

  return <div className={`h-24 ${tone[preview] ?? "bg-slate-50"}`} />;
}

export default function AssetsPage() {
  const { data } = useMarketingAssets();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--affiliate-border)] bg-white p-4 text-sm text-[var(--affiliate-muted)]">
        Use all assets unmodified. Do not alter the Intaleks logo or colour palette.
      </div>

      <Panel title="Downloadable assets">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data?.map((asset) => (
            <article key={asset.title} className="overflow-hidden rounded-xl border border-[var(--affiliate-border)] bg-white">
              <AssetPreview preview={asset.preview} />
              <div className="p-3">
                <h3 className="text-sm font-medium text-[var(--affiliate-navy)]">{asset.title}</h3>
                <p className="mt-1 text-xs text-[var(--affiliate-muted)]">{asset.type}</p>
                <Button variant="outline" className="mt-3" size="sm">
                  <Download data-icon="inline-start" /> Download
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
