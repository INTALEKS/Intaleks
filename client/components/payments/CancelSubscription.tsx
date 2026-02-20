"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCancelSubscription, useSubscriptionStatus } from "@/app/hooks/usePayments";

interface CancelSubscriptionProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return "the end of your billing period";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Cancel Subscription Component
 * Provides confirmation dialog for subscription cancellation
 * Requirements: 6.1
 */
export function CancelSubscription({ className, variant = "destructive", size = "default" }: CancelSubscriptionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cancelSubscription = useCancelSubscription();
  const { data: subscription } = useSubscriptionStatus();

  const handleCancel = async () => {
    await cancelSubscription.mutateAsync();
    setIsOpen(false);
  };

  // Don't show if no active subscription or already canceling
  if (!subscription || subscription.status !== "ACTIVE" || subscription.cancelAtPeriodEnd) {
    return null;
  }

  const accessEndDate = formatDate(subscription.currentPeriodEnd);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>Are you sure you want to cancel your subscription? You will continue to have access until {accessEndDate}.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">After cancellation:</p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>You will retain access to premium features until {accessEndDate}</li>
            <li>No further charges will be made to your payment method</li>
            <li>You can resubscribe at any time</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Keep Subscription
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={cancelSubscription.isPending}>
            {cancelSubscription.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Canceling...
              </>
            ) : (
              "Yes, Cancel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
