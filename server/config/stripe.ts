import Stripe from "stripe";
import { config } from "./environment";

/**
 * Stripe client singleton
 * Uses HTTPS for all API communications (handled by Stripe SDK)
 * Validates: Requirements 9.4
 */

let stripe: Stripe | null = null;

if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
} else {
  console.warn("Warning: STRIPE_SECRET_KEY is not set. Stripe functionality will not work.");
}

export { stripe };

export const stripeConfig = {
  webhookSecret: config.stripe.webhookSecret,
  publishableKey: config.stripe.publishableKey,
};

/**
 * Helper to get stripe instance with null check
 * Throws if stripe is not configured
 */
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }
  return stripe;
}
