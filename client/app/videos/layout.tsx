import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Video Lessons | Intaleks" },
  description: "Watch clear video lessons on business valuation. Learn Asset-Based, Profit-Based, and DCF valuation methods with practical, real-world examples.",
  alternates: { canonical: "https://www.intaleks.com/videos" },
  keywords: ["business valuation videos", "valuation lessons", "DCF tutorial", "asset valuation video", "profit valuation tutorial", "business value education"],
  openGraph: {
    title: "Video Lessons | Intaleks",
    description: "Clear video lessons that break down business valuation and the numbers behind company value.",
    url: "/videos",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Intaleks Video Lessons" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Lessons | Intaleks",
    description: "Clear video lessons that break down business valuation and the numbers behind company value.",
    images: ["/og-image.png"],
  },
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
