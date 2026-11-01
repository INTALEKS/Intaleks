import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Contact Intaleks | Business Valuation Support" },
  description: "Contact the Intaleks team, available 24/7 to answer your questions about business valuation, reports, billing and accounts.",
  alternates: { canonical: "https://www.intaleks.com/contact" },
  openGraph: {
    title: "Contact Intaleks | Business Valuation Support",
    description: "Contact the Intaleks team, available 24/7 to answer your questions about business valuation, reports, billing and accounts.",
    url: "https://www.intaleks.com/contact",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Intaleks - Contact Us" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Intaleks | Business Valuation Support",
    description: "Contact the Intaleks team, available 24/7 to answer your questions about business valuation, reports, billing and accounts.",
    images: ["/og-image.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
