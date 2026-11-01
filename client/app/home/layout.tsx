import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Business Valuation Australia | Online Valuation | Intaleks" },
  description:
    "Get a professional business valuation in Australia online. Enter your figures, choose a method and download a detailed PDF valuation report in minutes.",
  alternates: { canonical: "https://www.intaleks.com/" },
};

export default function HomeAliasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
