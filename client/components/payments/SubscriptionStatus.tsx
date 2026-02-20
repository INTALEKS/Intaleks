"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionStatus } from "@/app/hooks/usePayments";
import type { SubscriptionStatusType } from "@/app/services/payments";

interface SubscriptionStatusProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Get badge variant based on subscription status
 */
function getStatusVariant(status: SubscriptionStatusType): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "PAST_DUE":
      return "destructive";
    case "CANCELED":
      return "secondary";
    case "INCOMPLETE":
      return "outline";
    case "NONE":
    default:
      return "outline";
  }
}

/**
 * Get human-readable status label
 */
function getStatusLabel(status: SubscriptionStatusType): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PAST_DUE":
      return "Past Due";
    case "CANCELED":
      return "Canceled";
    case "INCOMPLETE":
      return "Incomplete";
    case "NONE":
    default:
      return "No Subscription";
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Subscription Status Component
 * Displays current subscription status with renewal/cancellation info
 * Requirements: 4.5, 4.6
 */
export function SubscriptionStatus({ className, showDetails = true }: SubscriptionStatusProps) {
  const { data: subscription, isLoading, error } = useSubscriptionStatus();

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-6 w-24" />
        {showDetails && <Skeleton className="h-4 w-48 mt-2" />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Badge variant="destructive">Error loading status</Badge>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className={className}>
        <Badge variant="outline">No Subscription</Badge>
      </div>
    );
  }

  const { status, currentPeriodEnd, cancelAtPeriodEnd } = subscription;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
        {cancelAtPeriodEnd && status === "ACTIVE" && <Badge variant="secondary">Canceling</Badge>}
      </div>

      {showDetails && (
        <div className="mt-2 text-sm text-muted-foreground">
          {status === "ACTIVE" && !cancelAtPeriodEnd && currentPeriodEnd && <p>Renews on {formatDate(currentPeriodEnd)}</p>}
          {status === "ACTIVE" && cancelAtPeriodEnd && currentPeriodEnd && <p>Access until {formatDate(currentPeriodEnd)}</p>}
          {status === "PAST_DUE" && <p className="text-destructive">Please update your payment method</p>}
          {status === "CANCELED" && <p>Your subscription has been canceled</p>}
          {status === "INCOMPLETE" && <p>Complete your payment to activate subscription</p>}
        </div>
      )}
    </div>
  );
}
