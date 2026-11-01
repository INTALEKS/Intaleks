import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Create Your Free Intaleks Account" },
  description: "Sign up for Intaleks to start your business valuation and access your report anytime.",
  alternates: { canonical: "https://www.intaleks.com/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
