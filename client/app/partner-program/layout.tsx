import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Partner Program for Advisers | Intaleks" },
  description: "Offer clients a fast business valuation under your own firm account. See how the Intaleks partner program works for accountants and advisers.",
  alternates: { canonical: "https://www.intaleks.com/partner-program" },
};

export default function PartnerProgramLayout({ children }: { children: React.ReactNode }) {
  return children;
}
