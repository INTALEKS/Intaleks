"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SampleReportPreviewProps = {
  children?: ReactNode;
  className?: string;
};

export function SampleReportPreview({
  children = "View Sample Report",
  className = "",
}: SampleReportPreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[940px] gap-0 overflow-y-auto rounded-[20px] border-0 bg-white p-0 text-[#0D1117] shadow-[0_32px_100px_rgba(0,0,0,0.35)] sm:rounded-[22px]">
        <div className="grid min-h-0 grid-cols-1 md:grid-cols-[minmax(360px,1.15fr)_minmax(280px,0.85fr)]">
          <div className="flex min-h-0 items-center justify-center bg-[#EEF3FA] p-5 sm:p-8 md:p-10">
            <div className="relative aspect-[779/1100] w-full max-w-[400px] overflow-hidden bg-white shadow-[0_20px_55px_rgba(15,23,42,0.22)]">
              <Image
                src="/valuation-sample-preview.png"
                alt="First page preview of the Intaleks sample business valuation report"
                fill
                sizes="(min-width: 768px) 480px, calc(100vw - 72px)"
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-8 md:p-10">
            <span className="w-fit rounded-full bg-[#EAF1FE] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              Sample report preview
            </span>
            <DialogTitle className="mt-5 text-[clamp(26px,3vw,36px)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0D1117]">
              See what your valuation report includes
            </DialogTitle>
            <DialogDescription className="mt-4 text-base leading-relaxed text-[#5A6472]">
              Preview the report presentation and valuation summary, then open the complete six-page sample when you are ready.
            </DialogDescription>

            <div className="mt-7 rounded-[14px] border border-[#DCE6F5] bg-[#F7FAFF] p-5 text-sm leading-relaxed text-[#48576B]">
              Includes both Asset and Profit Method perspectives, business-strength analysis and a clear valuation summary.
            </div>

            <div className="mt-8 flex flex-col gap-3 md:mt-auto md:pt-10">
              <a
                href="/valuation-sample.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[#2F78E6] px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-[#1D66D2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
              >
                View Full Sample Report
              </a>
              <DialogClose asChild>
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#D5DEEB] bg-white px-6 py-3 text-base font-semibold text-[#334155] transition-colors hover:bg-[#F5F7FB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                >
                  Continue Browsing
                </button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
