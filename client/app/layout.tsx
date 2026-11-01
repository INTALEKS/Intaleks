import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Intaleks | Business Valuation Australia",
    template: "%s | Intaleks",
  },
  description: "Online business valuation guidance for Australian business owners, with a detailed PDF report.",
  keywords: ["business valuation", "company valuation calculator", "business worth calculator", "asset valuation", "profit valuation", "EBIT calculator", "business appraisal", "company value", "valuation report", "small business valuation", "enterprise value calculator"],
  authors: [{ name: "Intaleks" }],
  creator: "Intaleks",
  publisher: "Intaleks",
  metadataBase: new URL("https://www.intaleks.com"),
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://www.intaleks.com/",
    siteName: "Intaleks",
    title: "Intaleks | Business Valuation Australia",
    description: "Online business valuation guidance for Australian business owners, with a detailed PDF report.",
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
    title: "Intaleks | Business Valuation Australia",
    description: "Online business valuation guidance for Australian business owners, with a detailed PDF report.",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-HJL49ST9QR" strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-HJL49ST9QR');`}</Script>
      <body className="font-inter antialiased" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
