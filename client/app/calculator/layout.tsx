import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Valuation Calculator",
  description: "Calculate your business value using professional valuation methods. Choose from Asset-Based, Profit-Based (Capitalization of Earnings), or DCF (Discounted Cash Flow) methods. Get instant results and download professional PDF reports.",
  keywords: ["business valuation calculator", "company value calculator", "DCF calculator", "asset valuation", "profit valuation", "EBIT calculator", "business worth", "valuation report generator"],
  openGraph: {
    title: "Business Valuation Calculator | Intaleks",
    description: "Calculate your business value using Asset, Profit, or DCF methods. Get professional valuation reports instantly.",
    url: "/calculator",
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
