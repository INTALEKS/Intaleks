"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/home";
import { cn } from "@/lib/utils";
import { FileText, Monitor, UserCheck, Users, AlertTriangle, Database, Copyright, Link2, ShieldAlert, XCircle, RefreshCw, Scale, Phone } from "lucide-react";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    icon: FileText,
    category: "core",
    content: 'These Terms and Conditions ("Terms") govern access to and use of the valuation software platform ("Platform") operated by Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832) trading as Intaleks ("Intaleks", "Company", "we", "our", "us"). By using the Platform, you ("User", "you") agree to be bound by these Terms. If you do not agree, you must not use the Platform.',
  },
  {
    id: "nature-of-service",
    title: "2. Nature of the Service",
    icon: Monitor,
    category: "core",
    content: "The Platform provides automated business valuation estimates generated using algorithms, data sources, and user inputs. Estimates are computer-generated, model-based, and dependent on input quality. The Platform does not provide certified valuations or legal, financial, taxation, accounting, or investment advice. All outputs are estimates only and must not be relied upon for legal, tax, court, compliance, or regulatory purposes.",
  },
  {
    id: "disclaimer",
    title: "3. Disclaimer – Guidance Only",
    icon: AlertTriangle,
    category: "core",
    content: "Valuation outputs are informational guides only and cannot be used for legal proceedings, tax matters, regulatory submissions, or as certified valuations. Users must obtain a qualified, independent valuation for legal or commercial purposes.",
  },
  {
    id: "user-responsibilities",
    title: "4. User Responsibilities",
    icon: UserCheck,
    category: "core",
    content: "Users agree to provide accurate information, have legal authority to provide data, use the Platform lawfully, and not misuse or reverse engineer the Platform.",
  },
  {
    id: "accuracy",
    title: "5. Accuracy and Limitations",
    icon: ShieldAlert,
    category: "others",
    content: "Valuations are estimates only. No guarantees are made regarding accuracy, completeness, reliability, or suitability. Results may be affected by market conditions, poor inputs, or model assumptions.",
  },
  {
    id: "limitation-liability",
    title: "6. Limitation of Liability",
    icon: Scale,
    category: "others",
    content: 'The Platform is provided "as is." The Company is not liable for financial losses, business interruptions, indirect damages, or decisions based on valuation outputs. Liability is limited to fees paid for relevant services.',
  },
  {
    id: "third-party-data",
    title: "7. Third-Party Data",
    icon: Link2,
    category: "others",
    content: "The Platform may rely on external data sources. The Company does not guarantee the accuracy or availability of third-party data.",
  },
  {
    id: "fees-payments",
    title: "8. Fees and Payments",
    icon: Copyright,
    category: "others",
    content: "Some features require payment. Payments are non-refundable except where required by law. Subscription services auto-renew unless cancelled.",
  },
  {
    id: "intellectual-property",
    title: "9. Intellectual Property",
    icon: Copyright,
    category: "others",
    content: "All software, algorithms, content, and branding are owned by the Company. Users receive a limited licence and may not copy, modify, or resell outputs.",
  },
  {
    id: "acceptable-use",
    title: "10. Acceptable Use",
    icon: Users,
    category: "others",
    content: "Users must not engage in unlawful use, security breaches, scraping, or misrepresentation of outputs as certified valuations.",
  },
  {
    id: "privacy",
    title: "11. Privacy",
    icon: Database,
    category: "others",
    content: "Personal data is handled under the Australian Privacy Act 1988 (Cth) and the Company's Privacy Policy.",
  },
  {
    id: "service-availability",
    title: "12. Service Availability",
    icon: Monitor,
    category: "others",
    content: "The Company does not guarantee uninterrupted access and may modify or discontinue features without notice.",
  },
  {
    id: "indemnification",
    title: "13. Indemnification",
    icon: ShieldAlert,
    category: "others",
    content: "Users agree to indemnify the Company for losses arising from misuse, breaches, or reliance on outputs.",
  },
  {
    id: "termination",
    title: "14. Termination",
    icon: XCircle,
    category: "others",
    content: "The Company may terminate access for breaches or suspected fraud. Users may request account termination.",
  },
  {
    id: "governing-law",
    title: "15. Governing Law",
    icon: Scale,
    category: "others",
    content: "These Terms are governed by Western Australian law.",
  },
  {
    id: "changes",
    title: "16. Changes to Terms",
    icon: RefreshCw,
    category: "others",
    content: "The Company may modify these Terms at any time. Continued use constitutes acceptance.",
  },
  {
    id: "contact",
    title: "Contact Information",
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
            <h1 className="text-3xl font-bold mb-2">Intaleks Terms and Conditions</h1>
            <p className="text-gray-500 text-sm mb-4">Last update: FEB 25, 2026</p>

            {/* Important Legal Notice */}
            <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
              <h2 className="font-semibold text-amber-900 mb-2">⚠️ Important Legal Notice</h2>
              <p className="text-sm text-amber-800">
                The Platform provides automated valuation estimates only and is <strong>not a certified valuation</strong> and cannot be used for legal, tax, court, or regulatory purposes.
              </p>
            </div>

            {/* Company Information */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Perth Business Evaluators Pty Ltd</strong>
                <br />
                ABN: 51 622 231 832
                <br />
                Trading as: Intaleks
              </p>
            </div>

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
