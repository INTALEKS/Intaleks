export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Intaleks",
    url: "https://intaleks.com",
    logo: "https://intaleks.com/intaleks.jpg",
    description: "Professional business valuation calculator helping companies determine their worth using industry-standard methods.",
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
    url: "https://intaleks.com/calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "AUD",
    },
    description: "Calculate your business value using professional valuation methods including Asset-Based, Profit-Based, and DCF methods.",
    featureList: ["Asset-Based Valuation", "Profit-Based Valuation (Capitalization of Earnings)", "DCF (Discounted Cash Flow) Valuation", "Professional PDF Report Generation", "Multi-year Financial Analysis", "Industry-specific Multiples"],
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
          text: "Intaleks supports three main valuation methods: Asset-Based Valuation (calculates net asset value), Profit-Based Valuation (uses capitalization of earnings), and DCF Method (Discounted Cash Flow analysis).",
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
