import { prisma } from "../config/db";
import { getStripe } from "../config/stripe";
import { SubscriptionPlan, BillingPeriod } from "@prisma/client";
import { StripeError, STRIPE_ERROR_CODES, createStripeErrorFromApiError, isStripeApiError } from "../errors";
import Stripe from "stripe";

/**
 * Stripe IDs returned after product/price creation
 * Requirements: 8.1, 8.3
 */
export interface StripeIds {
  productId: string;
  priceId: string;
}

/**
 * Stripe Sync Service - Handles synchronization between subscription plans and Stripe products/prices
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export class StripeSyncService {
  /**
   * Convert billing period to Stripe recurring interval
   */
  private static getStripeInterval(billingPeriod: BillingPeriod): Stripe.PriceCreateParams.Recurring.Interval | null {
    switch (billingPeriod) {
      case BillingPeriod.MONTHLY:
        return "month";
      case BillingPeriod.YEARLY:
        return "year";
      case BillingPeriod.ONE_TIME:
        return null;
      default:
        return "month";
    }
  }

  /**
   * Create a Stripe product and price for a subscription plan
   * - Creates a new Stripe product with plan details
   * - Creates a corresponding price (recurring or one-time based on billing period)
   * - Returns the Stripe product and price IDs
   * Requirements: 8.1, 8.3
   */
  static async createProductAndPrice(plan: SubscriptionPlan): Promise<StripeIds> {
    try {
      // Create Stripe product
      const product = await getStripe().products.create({
        name: plan.name,
        metadata: {
          planId: plan.id,
        },
        active: plan.active,
      });

      // Determine if this is a recurring or one-time price
      const interval = this.getStripeInterval(plan.billingPeriod);

      // Create Stripe price
      const priceParams: Stripe.PriceCreateParams = {
        product: product.id,
        unit_amount: plan.price, // Price is already in cents
        currency: "usd",
        metadata: {
          planId: plan.id,
        },
      };

      // Add recurring interval for subscription plans
      if (interval) {
        priceParams.recurring = {
          interval,
        };
      }

      const price = await getStripe().prices.create(priceParams);

      return {
        productId: product.id,
        priceId: price.id,
      };
    } catch (error) {
      if (isStripeApiError(error)) {
        throw createStripeErrorFromApiError(error, STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
      }
      throw error;
    }
  }

  /**
   * Create a new Stripe price for an existing product (prices are immutable in Stripe)
   * - Archives the old price
   * - Creates a new price with updated amount
   * - Returns the new price ID
   * Requirements: 8.2
   */
  static async updatePrice(productId: string, oldPriceId: string, newAmount: number, billingPeriod: BillingPeriod, planId: string): Promise<string> {
    try {
      // Archive the old price (prices are immutable, so we archive instead of update)
      await getStripe().prices.update(oldPriceId, {
        active: false,
      });

      // Determine if this is a recurring or one-time price
      const interval = this.getStripeInterval(billingPeriod);

      // Create new price with updated amount
      const priceParams: Stripe.PriceCreateParams = {
        product: productId,
        unit_amount: newAmount,
        currency: "usd",
        metadata: {
          planId,
        },
      };

      // Add recurring interval for subscription plans
      if (interval) {
        priceParams.recurring = {
          interval,
        };
      }

      const newPrice = await getStripe().prices.create(priceParams);

      return newPrice.id;
    } catch (error) {
      if (isStripeApiError(error)) {
        throw createStripeErrorFromApiError(error, STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
      }
      throw error;
    }
  }

  /**
   * Update a Stripe product's metadata and active status
   * Requirements: 8.1
   */
  static async updateProduct(productId: string, name: string, active: boolean): Promise<void> {
    try {
      await getStripe().products.update(productId, {
        name,
        active,
      });
    } catch (error) {
      if (isStripeApiError(error)) {
        throw createStripeErrorFromApiError(error, STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
      }
      throw error;
    }
  }

  /**
   * Archive a Stripe product when a plan is deactivated
   * - Sets the product to inactive in Stripe
   * - Also archives the associated price
   * Requirements: 8.4
   */
  static async archiveProduct(productId: string, priceId?: string): Promise<void> {
    try {
      // Archive the price if provided
      if (priceId) {
        await getStripe().prices.update(priceId, {
          active: false,
        });
      }

      // Archive the product
      await getStripe().products.update(productId, {
        active: false,
      });
    } catch (error) {
      if (isStripeApiError(error)) {
        throw createStripeErrorFromApiError(error, STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
      }
      throw error;
    }
  }

  /**
   * Reactivate a Stripe product when a plan is reactivated
   * Requirements: 8.4
   */
  static async reactivateProduct(productId: string, priceId?: string): Promise<void> {
    try {
      // Reactivate the product
      await getStripe().products.update(productId, {
        active: true,
      });

      // Reactivate the price if provided
      if (priceId) {
        await getStripe().prices.update(priceId, {
          active: true,
        });
      }
    } catch (error) {
      if (isStripeApiError(error)) {
        throw createStripeErrorFromApiError(error, STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
      }
      throw error;
    }
  }

  /**
   * Store Stripe IDs in the subscription plan record
   * Requirements: 8.3
   */
  static async storeStripeIds(planId: string, stripeIds: StripeIds): Promise<void> {
    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        stripeProductId: stripeIds.productId,
        stripePriceId: stripeIds.priceId,
      },
    });
  }

  /**
   * Update the Stripe price ID in the subscription plan record
   * Requirements: 8.2
   */
  static async updateStripePriceId(planId: string, priceId: string): Promise<void> {
    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        stripePriceId: priceId,
      },
    });
  }
}
