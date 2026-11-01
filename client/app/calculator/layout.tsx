import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Business Valuation Tools Australia | Online Valuator | Intaleks" },
  description: "Use our online business valuation tool for your Australian business. Compare Asset and Profit methods and download a detailed PDF valuation report.",
  keywords: ["business valuation tools australia", "business valuation methods in australia", "business valuation service australia", "professional business valuation australia", "business valuations australia"],
  alternates: { canonical: "https://www.intaleks.com/calculator" },
  openGraph: {
    title: "Business Valuation Tools Australia | Online Valuator | Intaleks",
    description: "Compare Asset and Profit methods for your Australian business and download a detailed PDF valuation report.",
    url: "https://www.intaleks.com/calculator",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Intaleks online business valuation calculator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Valuation Tools Australia | Intaleks",
    description: "Compare Asset and Profit valuation methods and download a detailed PDF report.",
    images: ["/og-image.png"],
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Intaleks Business Valuation Calculator",
    url: "https://www.intaleks.com/calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "495",
      priceCurrency: "AUD",
      description: "One-off fee for one business valuation; corrections to that valuation are included.",
    },
    description: "Compare Asset and Profit valuation methods for an Australian business and download a PDF estimate for guidance.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }} />
      {children}
    </>
  );
}
