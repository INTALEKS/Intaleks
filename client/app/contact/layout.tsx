import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Intaleks team. We're available 24/7 to answer your questions about business valuation.",
  openGraph: {
    title: "Contact Us | Intaleks",
    description: "Get in touch with the Intaleks team. We're available 24/7 to answer your questions about business valuation.",
    url: "/contact",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Intaleks - Contact Us" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Intaleks",
    description: "Get in touch with the Intaleks team. We're available 24/7 to answer your questions.",
    images: ["/og-image.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
