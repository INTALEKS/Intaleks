import Image from "next/image";

const reportFeatures = [
  "Asset Method valuation",
  "Profit Method valuation",
  "Business-strength assessment",
  "Clear valuation summary",
  "Detailed assumptions and financial inputs",
];

export function SampleReportSection() {
  return (
    <section className="border-y border-[#DFE8F4] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_100%)] px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
        <div className="max-w-[560px]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[1.8px] text-[#2563EB]">
            Sample report preview
          </p>
          <h2 className="text-[clamp(34px,4.5vw,58px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#0D1117]">
            See what your valuation report includes
          </h2>
          <p className="mt-6 max-w-[52ch] text-[17px] leading-[1.75] text-[#536174] sm:text-lg">
            Explore the presentation, analysis and valuation summary included in your report before you begin.
          </p>

          <ul className="mt-8 space-y-4" aria-label="Sample report contents">
            {reportFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[16px] font-medium leading-6 text-[#263548] sm:text-[17px]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DDEBFF] text-[#2563EB]" aria-hidden="true">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                    <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[570px]">
          <div className="rounded-[20px] border border-[#D6E2F2] bg-white p-4 shadow-[0_28px_70px_rgba(28,65,112,0.18)] sm:p-6">
            <div className="relative mx-auto aspect-[779/1100] w-full max-w-[445px] overflow-hidden rounded-[4px] bg-white shadow-[0_14px_38px_rgba(15,23,42,0.18)] ring-1 ring-black/5">
              <Image
                src="/valuation-sample-preview.png"
                alt="First page of the Intaleks sample business valuation report"
                fill
                sizes="(min-width: 1024px) 445px, calc(100vw - 80px)"
                className="object-contain"
              />
            </div>
            <a
              href="/valuation-sample.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-16 w-full items-center justify-center rounded-[12px] bg-[#216FE0] px-8 py-4 text-center text-xl font-bold text-white shadow-[0_14px_32px_rgba(33,111,224,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#145FC9] hover:shadow-[0_18px_38px_rgba(33,111,224,0.38)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#216FE0]"
            >
              View Full Sample Report
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
