"use client";

import { useUser } from "@/components/auth/access-guard";
import { OnboardingView } from "@/components/affiliate/onboarding-view";

/**
 * Wraps portal children and intercepts users who do not have an
 * active AffiliateProfile. Shows the onboarding flow instead of
 * the dashboard content.
 */
export function AffiliateGate({ children }: { children: React.ReactNode }) {
  const user = useUser();

  // If the user already has an active affiliate profile, let them through
  if (user?.affiliateProfile) {
    return <>{children}</>;
  }

  // Otherwise show the onboarding / pending / rejected view
  return <OnboardingView />;
}
