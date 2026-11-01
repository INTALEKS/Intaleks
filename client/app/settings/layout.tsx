import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Manage Your Intaleks Account" },
  description: "Manage your Intaleks account details, valuation purchases and reports.",
  alternates: { canonical: "https://www.intaleks.com/settings" },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
