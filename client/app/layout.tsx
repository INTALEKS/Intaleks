import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

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
  verification: {
    google: "wqjz8ylaUI7409XbB9xXX-sfUHFmYnwLJEFAJRk3eow",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      </head>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-HJL49ST9QR" strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-HJL49ST9QR');`}</Script>
      <body className="font-inter antialiased" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
