import type { Metadata, Viewport } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Intaleks Affiliate - Share & Earn Commissions",
    template: "%s | Intaleks Affiliate",
  },
  description: "Join the Intaleks Affiliate Program. Promote the world's most advanced business valuation calculator and earn high commissions for every successful referral.",
  keywords: ["affiliate program", "intaleks affiliate", "business valuation affiliate", "earn commissions", "referral program", "promote SaaS", "business calculator affiliate"],
  authors: [{ name: "Intaleks" }],
  creator: "Intaleks",
  publisher: "Intaleks",
  metadataBase: new URL(process.env.NEXT_PUBLIC_AFFILIATE_APP_URL || "https://affilliate.intaleks.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "Intaleks Affiliate",
    title: "Intaleks Affiliate - Share & Earn Commissions",
    description: "Join the Intaleks Affiliate Program. Promote the world's most advanced business valuation calculator and earn high commissions.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Intaleks Affiliate Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intaleks Affiliate - Share & Earn Commissions",
    description: "Join the Intaleks Affiliate Program. Promote the world's most advanced business valuation calculator and earn high commissions.",
    images: ["/og-image.png"],
    creator: "@intaleks",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/intaleks-fav.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  category: "business",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
