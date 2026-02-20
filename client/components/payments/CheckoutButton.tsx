"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateCheckout } from "@/app/hooks/usePayments";

interface CheckoutButtonProps {
  planId: string;
  planName?: string;
  successUrl?: string;
  cancelUrl?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Checkout Button Component
 * Handles checkout session creation and redirects to Stripe checkout
 * Requirements: 2.5
 */
export function CheckoutButton({ planId, planName, successUrl, cancelUrl, variant = "default", size = "default", className, children }: CheckoutButtonProps) {
  const createCheckout = useCreateCheckout();

  const handleCheckout = () => {
    createCheckout.mutate({
      planId,
      successUrl,
      cancelUrl,
    });
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleCheckout} disabled={createCheckout.isPending}>
      {createCheckout.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || `Subscribe to ${planName || "Plan"}`
      )}
    </Button>
  );
}
