"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/home";
import { cn } from "@/lib/utils";
import { FileText, Monitor, UserCheck, Users, AlertTriangle, Database, Copyright, Link2, ShieldAlert, XCircle, RefreshCw, Scale, Phone } from "lucide-react";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: FileText,
    category: "core",
    content: "Welcome to TheBizEvaluator. These Terms and Conditions govern your access to and use of our website, application, and services. By accessing or using TheBizEvaluator, you agree to be bound by these Terms. If you do not agree, please do not use our services.",
  },
  {
    id: "use-of-platform",
    title: "Use of the Platform",
    icon: Monitor,
    category: "core",
    content: "You agree to use TheBizEvaluator only for lawful purposes and in a manner that does not violate any applicable laws or regulations. You must not misuse the platform, attempt unauthorized access, interfere with system security, or use the service in a way that could harm the platform or other users.",
  },
  {
    id: "eligibility",
    title: "Eligibility",
    icon: UserCheck,
    category: "core",
    content: "You must be at least 18 years old or have legal capacity under applicable law to use TheBizEvaluator. By using the platform, you confirm that you meet this requirement.",
  },
  {
    id: "accounts",
    title: "Accounts & User Responsibilities",
    icon: Users,
    category: "core",
    content: "To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your login details and for all activities carried out under your account. You agree to provide accurate and up-to-date information and to notify us immediately of any unauthorized use of your account.",
  },
  {
    id: "disclaimer",
    title: "Business Valuation Disclaimer",
    icon: AlertTriangle,
    category: "others",
    content: "TheBizEvaluator provides valuation tools and insights for informational and educational purposes only. Valuation results are estimates and should not be considered financial, investment, legal, or tax advice. We do not guarantee the accuracy, completeness, or suitability of valuation outputs for any specific purpose. You are solely responsible for decisions made based on the information provided.",
  },
  {
    id: "user-content",
    title: "User Content and Business Data",
    icon: Database,
    category: "others",
    content: "You retain ownership of all business data and information you submit to the platform. By using TheBizEvaluator, you grant us a limited right to process this data solely for the purpose of providing valuation services, improving the platform, and maintaining system functionality. We do not claim ownership of your content.",
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    icon: Copyright,
    category: "others",
    content: "All content, features, designs, trademarks, logos, and software used on TheBizEvaluator are owned by or licensed to us and are protected by intellectual property laws. You may not copy, modify, distribute, or reproduce any part of the platform without prior written permission.",
  },
  {
    id: "third-party",
    title: "Third-party Services",
    icon: Link2,
    category: "others",
    content: "The platform may include links to or integrations with third-party services. We are not responsible for the content, policies, or practices of third-party platforms. Your use of third-party services is governed by their respective terms and policies.",
  },
  {
    id: "limitation",
    title: "Limitation of Liabilities",
    icon: ShieldAlert,
    category: "others",
    content: "To the maximum extent permitted by law, TheBizEvaluator shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from your use of or inability to use the platform, including reliance on valuation results.",
  },
  {
    id: "termination",
    title: "Termination",
    icon: XCircle,
    category: "others",
    content: "We reserve the right to suspend or terminate your access to TheBizEvaluator at any time, with or without notice, if you violate these Terms or misuse the platform. You may stop using the service at any time.",
  },
  {
    id: "changes",
    title: "Changes to the Terms",
    icon: RefreshCw,
    category: "others",
    content: 'We may update these Terms and Conditions from time to time. When changes are made, the "Last updated" date will be revised. Continued use of the platform after changes indicates acceptance of the updated Terms.',
  },
  {
    id: "governing-law",
    title: "Governing Law",
    icon: Scale,
    category: "others",
    content: "These Terms and Conditions shall be governed by and interpreted in accordance with the laws applicable in the jurisdiction where TheBizEvaluator operates, without regard to conflict of law principles.",
  },
  {
    id: "contact",
    title: "Contact Info",
    icon: Phone,
    category: "others",
    content: "If you have any questions about these Terms and Conditions, please contact us at admin@intaleks.com.",
  },
];

export default function TermsPage() {
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
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">Terms and Condition</h1>
            <p className="text-gray-500 text-sm mb-8">Last update: DEC 23, 2025</p>

            {/* Core Section */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-6">Core</h2>
              <div className="space-y-8">
                {coreSections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    <h3 className="font-semibold mb-3">{section.title}</h3>
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
                    <h3 className="font-semibold mb-3">{section.title}</h3>
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
