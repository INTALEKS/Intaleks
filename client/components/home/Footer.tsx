"use client";

import Image from "next/image";
import Link from "next/link";

const navigateLinks = [
  { label: "Home", href: "/" },
  // { label: "Subscriptions", href: "/#pricing" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/contact" },
];

const premiumLinks = [
  { label: "Calculator", href: "/calculator" },
  { label: "Forum", href: "/forum" },
  // { label: "Videos", href: "/videos" },
];

const startLinks = [
  { label: "Sign in", href: "/login" },
  { label: "Create Account", href: "/signup" },
  { label: "Valuation Sample", href: "/valuation-sample.pdf" },
];

const socialLinks: Array<{ icon: string; href: string; label: string }> = [
  // { icon: "facebook", href: "https://facebook.com", label: "Facebook" },
  // { icon: "linkedin", href: "https://linkedin.com", label: "LinkedIn" },
  // { icon: "instagram", href: "https://instagram.com", label: "Instagram" },
  // { icon: "x", href: "https://x.com", label: "X" },
];

const officeLocations = [
  {
    city: "Sydney Office",
    address: "Level 35, 100 Barangaroo Ave. Sydney NSW 2000",
    phone: "(02) 8088 0798",
    mapUrl: "https://maps.app.goo.gl/Zpw7GSjc2VhfrgaNA",
  },

  // {
  //   city: "Perth Office",
  //   address: "Level 25,1 Spring Street, Capital Square Tower 3, Perth, 6000",
  //   phone: "(08) 6144 4723",
  //   mapUrl: "https://maps.app.goo.gl/t2BXpv3n3SVscVgw5",
  // },
  // {
  //   city: "Melbourne Office",
  //   address: "Level 27, 101 Collins Street, Melbourne VIC 3000",
  //   phone: "(03) 7046 1243",
  //   mapUrl: "https://maps.app.goo.gl/xoJ4Kmb3JL42fYs67",
  // },
  // {
  //   city: "Brisbane Office",
  //   address: "Level 29, 97 Creek St, Brisbane City QLD 4000",
  //   phone: "(07) 3535 1238",
  //   mapUrl: "https://maps.app.goo.gl/QX4bsmdj3oSBEY1N6",
  // },
];

export function Footer() {
  return (
    <footer className="pb-6 px-4 mt-20">
      <div className="w-full md:w-[90%] p-6 md:p-8 rounded-md bg-(--sky-light-blue)/20 mx-auto">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8 md:mb-12">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <Image src="/intaleks.png" alt="Intaleks" width={150} height={40} className="mb-4" />
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              Accurate, investor-ready business valuations.
              <br />
              Built for clarity, speed, and confidence.
            </p>

            {/* Contact Email */}
            <p className="text-gray-600 text-sm mb-2">
              <a href="mailto:admin@intaleks.com" className="hover:text-gray-900 transition-colors">
                admin@intaleks.com
              </a>
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a key={social.icon} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="text-gray-700 hover:text-gray-900 transition-colors">
                  <SocialIcon name={social.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">Main</h3>
            <ul className="space-y-2">
              {navigateLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium/Upgrade */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-sm md:text-base">
              Premium Features{" "}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="#F4B400" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14z" />
              </svg>
            </h3>
            <ul className="space-y-2">
              {premiumLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex gap-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Started */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">Get Started</h3>
            <ul className="space-y-2">
              {startLinks.map((link) => (
                <li key={link.href}>
                  <Link target="_blank" href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center gap-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">Location</h3>
            {officeLocations.map((office) => (
              <div key={office.city}>
                <address className="not-italic text-gray-700 text-sm leading-relaxed">
                  <a href={office.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
                    {office.address}
                  </a>
                </address>
                <p className="text-gray-700 text-xs mt-1">{office.phone}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-200 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <p className="text-gray-600 text-xs md:text-sm order-2 md:order-1">© intaleks. All rights reserved 2026</p>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 order-1 md:order-2 w-full md:w-auto">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-xs md:text-sm underline transition-colors">
              Privacy & Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-xs md:text-sm underline transition-colors">
              Terms and Condition
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case "facebook":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      );
    case "x":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return null;
  }
}
