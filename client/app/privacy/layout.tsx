import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Intaleks" },
  description: "Read the Intaleks privacy policy to understand how we collect, use and protect your personal and business information.",
  alternates: { canonical: "https://www.intaleks.com/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
