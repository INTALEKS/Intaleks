"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/home";
import { cn } from "@/lib/utils";
import { FileText, Database, Mail, Cookie, Share2, Shield, Scale, RefreshCw, Phone } from "lucide-react";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: FileText,
    category: "core",
    content: "Welcome to Intaleks. Your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, and how we protect it when you use our website, app, or services operated by Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832) trading as Intaleks. By using Intaleks, you agree to the practices described in this policy. Personal data is handled under the Australian Privacy Act 1988 (Cth).",
  },
  {
    id: "information-collect",
    title: "Information We Collect",
    icon: Database,
    category: "core",
    content: "We collect information that helps us provide and improve our services. This includes information you provide directly, such as your name, email address, account details, and any business information you enter for valuation purposes, including revenue, expenses, and growth data. We also collect certain information automatically, such as device and browser information, usage data like pages visited and features used, and IP addresses for security and analytics purposes.",
  },
  {
    id: "how-we-use",
    title: "How We Use Data",
    icon: Mail,
    category: "core",
    content: "We use the information we collect to provide business valuation services, generate reports and insights, improve product performance and user experience, communicate updates, support responses, and important notices, and to ensure security and prevent fraud. We do not sell your personal data.",
  },
  {
    id: "business-data",
    title: "Business Data",
    icon: FileText,
    category: "core",
    content: "Any business or financial data entered into Intaleks is used strictly for valuation and analysis purposes. This data remains confidential, is not shared with other users, and is not disclosed to third parties without your permission. You retain full ownership of your business data at all times.",
  },
  {
    id: "cookies",
    title: "Cookies",
    icon: Cookie,
    category: "others",
    content: "We use cookies and similar tracking technologies to keep you logged in, understand how users interact with the platform, and improve functionality and performance. You can manage or disable cookies through your browser settings if you prefer.",
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    icon: Share2,
    category: "others",
    content: "We may share limited data with trusted third-party service providers who help us operate the platform, such as hosting providers, analytics tools, and security services. These third parties are required to protect your data and use it only for the specific purposes agreed upon with us.",
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    category: "others",
    content: "We take reasonable technical and organizational measures to protect your information, including the use of secure servers, encryption, and access controls. However, no online system is completely secure, and we cannot guarantee absolute security of your data.",
  },
  {
    id: "your-rights",
    title: "Your Rights",
    icon: Scale,
    category: "others",
    content: "Depending on your location, you may have certain rights regarding your personal data, including the right to access your information, correct inaccurate data, request deletion, or withdraw consent. You can exercise these rights by contacting us directly.",
  },
  {
    id: "updates",
    title: "Updates",
    icon: RefreshCw,
    category: "others",
    content: 'We may update this Privacy Policy from time to time. When changes are made, we will update the "Last updated" date at the top of this page to reflect the revision.',
  },
  {
    id: "contact",
    title: "Contact",
    icon: Phone,
    category: "others",
    content: "If you have any questions or concerns about this Privacy Policy, you may contact us at admin@intaleks.com.",
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const coreSections = sections.filter((s) => s.category === "core");
  const otherSections = sections.filter((s) => s.category === "others");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Core</h3>
                <nav className="space-y-1">
                  {coreSections.map((section) => (
                    <button key={section.id} onClick={() => scrollToSection(section.id)} className={cn("flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors", activeSection === section.id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50")}>
                      <section.icon className="w-4 h-4" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Others</h3>
                <nav className="space-y-1">
                  {otherSections.map((section) => (
                    <button key={section.id} onClick={() => scrollToSection(section.id)} className={cn("flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors", activeSection === section.id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50")}>
                      <section.icon className="w-4 h-4" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">Intaleks Privacy Policy</h1>
            <p className="text-gray-500 text-sm mb-4">Last update: FEB 25, 2026</p>

            {/* Company Information */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Perth Business Evaluators Pty Ltd</strong>
                <br />
                ABN: 51 622 231 832
                <br />
                Trading as: Intaleks
                <br />
                <br />
                Personal data is handled under the Australian Privacy Act 1988 (Cth).
              </p>
            </div>

            {/* Core Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-6">Core</h2>
              <div className="space-y-8">
                {coreSections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    <div className="flex items-center gap-2 mb-3">
                      <section.icon className="w-5 h-5 text-gray-700" />
                      <h3 className="font-semibold">{section.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Others Section */}
            <section>
              <h2 className="text-lg font-semibold mb-6">Others</h2>
              <div className="space-y-8">
                {otherSections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    <div className="flex items-center gap-2 mb-3">
                      <section.icon className="w-5 h-5 text-gray-700" />
                      <h3 className="font-semibold">{section.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
