import type { Metadata } from "next";
import HomeLandingPage from "./home/page";

const homepageTitle = "Business Valuation Australia | Online Valuation | Intaleks";
const homepageDescription =
  "Get a professional business valuation in Australia online. Enter your figures, choose a method and download a detailed PDF valuation report in minutes.";

export const metadata: Metadata = {
  title: { absolute: homepageTitle },
  description: homepageDescription,
  alternates: { canonical: "https://www.intaleks.com/" },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://www.intaleks.com/",
    siteName: "Intaleks",
    title: homepageTitle,
    description: homepageDescription,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Intaleks business valuation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: homepageDescription,
    images: ["/og-image.png"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Intaleks",
  url: "https://www.intaleks.com/",
  logo: "https://www.intaleks.com/intaleks-footer-logo.png",
  description: "Online business valuation guidance for Australian business owners.",
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <HomeLandingPage />
    </>
  );
}
