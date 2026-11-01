import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Log In to Intaleks" },
  description: "Log in to Intaleks to access your business valuations and account.",
  alternates: { canonical: "https://www.intaleks.com/login" },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
