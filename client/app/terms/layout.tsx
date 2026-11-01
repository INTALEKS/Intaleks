import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Terms and Conditions | Intaleks" },
  description: "Read the terms and conditions for using the Intaleks business valuation calculator and reports.",
  alternates: { canonical: "https://www.intaleks.com/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
