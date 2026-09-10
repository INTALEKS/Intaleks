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

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[1000px] gap-0 overflow-y-auto rounded-[20px] border-0 bg-white p-0 text-[#0D1117] shadow-[0_32px_100px_rgba(0,0,0,0.35)] sm:rounded-[24px]">
        <div className="grid min-h-0 grid-cols-1 md:grid-cols-[minmax(300px,0.82fr)_minmax(380px,1.18fr)]">
          <div className="flex flex-col bg-[linear-gradient(145deg,#FFFFFF_0%,#F4F8FF_100%)] p-7 sm:p-9 md:p-11 lg:p-12">
            <span className="w-fit rounded-full bg-[#EAF1FE] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              Sample report preview
            </span>
            <DialogTitle className="mt-6 text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.04] tracking-[-0.04em] text-[#0D1117]">
              See what your valuation report includes
            </DialogTitle>
            <DialogDescription className="mt-5 text-base leading-[1.75] text-[#536174]">
              Preview the report presentation and valuation summary, then open the complete six-page sample when you are ready.
            </DialogDescription>

            <div className="mt-7 rounded-[16px] border border-[#D8E4F5] bg-white p-5 text-sm leading-relaxed text-[#48576B] shadow-[0_12px_30px_rgba(37,99,235,0.08)]">
              Includes both Asset and Profit Method perspectives, business-strength analysis and a clear valuation summary.
            </div>

            <div className="mt-8 md:mt-auto md:pt-10">
              <DialogClose asChild>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-[#526174] underline decoration-[#A9B8CC] underline-offset-4 transition-colors hover:text-[#1D66D2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]"
                >
                  Continue Browsing
                </button>
              </DialogClose>
            </div>
          </div>

          <div className="flex min-h-0 flex-col items-center justify-center bg-[#E9F0FA] p-5 sm:p-8 md:p-10">
            <div className="relative aspect-[779/1100] w-full max-w-[400px] overflow-hidden rounded-[3px] bg-white shadow-[0_24px_65px_rgba(15,23,42,0.24)] ring-1 ring-black/5">
              <Image
                src="/valuation-sample-preview.png"
                alt="First page preview of the Intaleks sample business valuation report"
                fill
                sizes="(min-width: 768px) 440px, calc(100vw - 72px)"
                className="object-contain"
              />
            </div>
            <a
              href="/valuation-sample.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-14 w-full max-w-[400px] items-center justify-center rounded-[12px] bg-[#216FE0] px-8 py-4 text-center text-lg font-bold text-white shadow-[0_14px_32px_rgba(33,111,224,0.32)] transition-all hover:-translate-y-0.5 hover:bg-[#145FC9] hover:shadow-[0_18px_38px_rgba(33,111,224,0.4)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#216FE0]"
            >
              View Our Sample Report
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
