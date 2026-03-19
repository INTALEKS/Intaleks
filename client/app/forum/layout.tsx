import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Forum",
  description: "Join the Intaleks community forum. Discuss business valuation, share insights, and learn from founders, investors, and valuation professionals.",
  keywords: ["business valuation forum", "valuation community", "business value discussion", "investor insights", "founder community"],
  openGraph: {
    title: "Community Forum | Intaleks",
    description: "Discuss business valuation with founders, investors, and professionals. Get clarity on valuation challenges and stay ahead of market trends.",
    url: "/forum",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Intaleks Community Forum" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Forum | Intaleks",
    description: "Discuss business valuation with founders, investors, and professionals.",
    images: ["/og-image.png"],
  },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
