"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/app/hooks/useAuthState";
import { isAdminOrHigher } from "@/lib/role-utils";

interface PageHeaderProps {
  /** Main title with optional highlighted word */
  title: React.ReactNode;
  /** Subtitle/description text */
  subtitle: string;
  /** Primary CTA button text */
  ctaText: string;
  /** Primary CTA link (for subscribed users) */
  ctaHref?: string;
  /** Primary CTA click handler (alternative to href) */
  onCtaClick?: () => void;
  /** Alternative CTA text for non-subscribed users */
  altCtaText?: string;
  /** Alternative CTA link for non-subscribed users */
  altCtaHref?: string;
}

export function PageHeader({ title, subtitle, ctaText, ctaHref, onCtaClick, altCtaText, altCtaHref = "/pricing" }: PageHeaderProps) {
  const { isAuthenticated, hasActiveSubscription, isAuthentiating, user } = useAuthState();

  // Admins (including SUPER_ADMIN) or subscribed users can access content
  const canAccess = isAdminOrHigher(user?.role) || hasActiveSubscription;

  // Determine which CTA to show
  const showSubscribeCta = !isAuthentiating && (!isAuthenticated || !canAccess);
  const buttonText = showSubscribeCta && altCtaText ? altCtaText : ctaText;
  const buttonHref = showSubscribeCta ? altCtaHref : ctaHref;

  return (
    <section className="text-center py-16 px-4 bg-linear-to-b from-blue-50/80 via-blue-50/30 to-white">
      <h1 className="text-5xl font-medium md:text-5xl text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 max-w-2xl mx-auto mb-8">{subtitle}</p>
      {buttonHref ? (
        <Link href={buttonHref}>
          <Button className="bg-black hover:bg-gray-800 px-8 py-6 text-base">{buttonText}</Button>
        </Link>
      ) : (
        <Button className="bg-black hover:bg-gray-800 px-8 py-6 text-base" onClick={onCtaClick}>
          {buttonText}
        </Button>
      )}
    </section>
  );
}
