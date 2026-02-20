"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SubscriptionStatusType = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";

export interface SubscriptionBadgeProps {
  subscriptionStatus: SubscriptionStatusType;
  className?: string;
}

/**
 * Derives the display text and styling based on subscription status.
 * - ACTIVE status → "Subscribed" with green styling
 * - Any other status → "Registered" with orange styling
 */
export function getSubscriptionBadgeInfo(status: SubscriptionStatusType): {
  text: string;
  variant: "subscribed" | "registered";
} {
  if (status === "ACTIVE") {
    return { text: "Subscribed", variant: "subscribed" };
  }
  return { text: "Registered", variant: "registered" };
}

/**
 * SubscriptionBadge component displays user subscription status.
 * Shows "Subscribed" (greeb) for ACTIVE users and "Registered" (orange) for others.
 */
export function SubscriptionBadge({ subscriptionStatus, className }: SubscriptionBadgeProps) {
  const { text, variant } = getSubscriptionBadgeInfo(subscriptionStatus);

  return <Badge className={cn("text-xs font-medium", variant === "subscribed" ? "bg-[#0FDA484D] text-[#004A15]" : "bg-[#EECA344D] text-[#5A1600]", className)}>{text}</Badge>;
}

export default SubscriptionBadge;
