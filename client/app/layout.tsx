import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Intaleks - Professional Business Valuation Calculator",
    template: "%s | Intaleks",
  },
  description: "Calculate your business value in minutes with our advanced valuation engine. Get professional valuation reports using Asset, Profit, and DCF methods. Trusted by companies worldwide.",
  keywords: ["business valuation", "company valuation calculator", "business worth calculator", "DCF valuation", "asset valuation", "profit valuation", "EBIT calculator", "business appraisal", "company value", "valuation report", "small business valuation", "enterprise value calculator"],
  authors: [{ name: "Intaleks" }],
  creator: "Intaleks",
  publisher: "Intaleks",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://intaleks.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "Intaleks",
    title: "Intaleks - Professional Business Valuation Calculator",
    description: "Calculate your business value in minutes. Get professional valuation reports using Asset, Profit, and DCF methods.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Intaleks - Business Valuation Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intaleks - Professional Business Valuation Calculator",
    description: "Calculate your business value in minutes. Get professional valuation reports using Asset, Profit, and DCF methods.",
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
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
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
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Intaleks",
    description: "Professional business valuation calculator and services",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://intaleks.com",
    telephone: "+61-8-6144-4723",
    email: "admin@intaleks.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Level 25,1 Spring Street, Capital Square Tower 3",
      addressLocality: "Perth",
      addressRegion: "WA",
      postalCode: "6000",
      addressCountry: "AU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-31.9523",
      longitude: "115.8613",
    },
    openingHours: "Mo-Su 00:00-23:59",
    priceRange: "$$",
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      </head>
      <body className={`${inter.variable} font-inter antialiased`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
