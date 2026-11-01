export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Intaleks",
    url: "https://www.intaleks.com/",
    logo: "https://www.intaleks.com/intaleks-footer-logo.png",
    description: "Online business valuation guidance for Australian business owners.",
    sameAs: ["https://twitter.com/intaleks", "https://linkedin.com/company/intaleks"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function WebApplicationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Intaleks Business Valuation Calculator",
    url: "https://www.intaleks.com/calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "495",
      priceCurrency: "AUD",
    },
    description: "Compare Asset and Profit valuation methods for an Australian business and download a PDF estimate for guidance.",
    featureList: ["Asset Valuation", "Profit Valuation", "PDF Valuation Report"],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function FAQJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is business valuation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Business valuation is the process of determining the economic value of a business or company. It's used for various purposes including selling a business, seeking investment, or financial reporting.",
        },
      },
      {
        "@type": "Question",
        name: "What valuation methods does Intaleks support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Intaleks calculator compares Asset and Profit valuation methods. Its report is an automated estimate for guidance only, not a certified valuation or legal, financial, or tax advice.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate is the business valuation calculator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our calculator uses industry-standard formulas and methodologies. The accuracy depends on the quality of financial data you input. For official valuations, we recommend consulting with a professional valuator.",
        },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
