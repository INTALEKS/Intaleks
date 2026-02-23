"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeSyncService = void 0;
const db_1 = require("../config/db");
const stripe_1 = require("../config/stripe");
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
/**
 * Stripe Sync Service - Handles synchronization between subscription plans and Stripe products/prices
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
class StripeSyncService {
    /**
     * Convert billing period to Stripe recurring interval
     */
    static getStripeInterval(billingPeriod) {
        switch (billingPeriod) {
            case client_1.BillingPeriod.MONTHLY:
                return "month";
            case client_1.BillingPeriod.YEARLY:
                return "year";
            case client_1.BillingPeriod.ONE_TIME:
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
    static async createProductAndPrice(plan) {
        try {
            // Create Stripe product
            const product = await (0, stripe_1.getStripe)().products.create({
                name: plan.name,
                metadata: {
                    planId: plan.id,
                },
                active: plan.active,
            });
            // Determine if this is a recurring or one-time price
            const interval = this.getStripeInterval(plan.billingPeriod);
            // Create Stripe price
            const priceParams = {
                product: product.id,
                unit_amount: Math.round(plan.price * 100), // Convert dollars to cents
                currency: "aud", // Australian Dollars
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
            const price = await (0, stripe_1.getStripe)().prices.create(priceParams);
            return {
                productId: product.id,
                priceId: price.id,
            };
        }
        catch (error) {
            if ((0, errors_1.isStripeApiError)(error)) {
                throw (0, errors_1.createStripeErrorFromApiError)(error, errors_1.STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
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
    static async updatePrice(productId, oldPriceId, newAmount, billingPeriod, planId) {
        try {
            // Archive the old price (prices are immutable, so we archive instead of update)
            await (0, stripe_1.getStripe)().prices.update(oldPriceId, {
                active: false,
            });
            // Determine if this is a recurring or one-time price
            const interval = this.getStripeInterval(billingPeriod);
            // Create new price with updated amount
            const priceParams = {
                product: productId,
                unit_amount: Math.round(newAmount * 100), // Convert dollars to cents
                currency: "aud", // Australian Dollars
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
            const newPrice = await (0, stripe_1.getStripe)().prices.create(priceParams);
            return newPrice.id;
        }
        catch (error) {
            if ((0, errors_1.isStripeApiError)(error)) {
                throw (0, errors_1.createStripeErrorFromApiError)(error, errors_1.STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
            }
            throw error;
        }
    }
    /**
     * Update a Stripe product's metadata and active status
     * Requirements: 8.1
     */
    static async updateProduct(productId, name, active) {
        try {
            await (0, stripe_1.getStripe)().products.update(productId, {
                name,
                active,
            });
        }
        catch (error) {
            if ((0, errors_1.isStripeApiError)(error)) {
                throw (0, errors_1.createStripeErrorFromApiError)(error, errors_1.STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
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
    static async archiveProduct(productId, priceId) {
        try {
            // Archive the price if provided
            if (priceId) {
                await (0, stripe_1.getStripe)().prices.update(priceId, {
                    active: false,
                });
            }
            // Archive the product
            await (0, stripe_1.getStripe)().products.update(productId, {
                active: false,
            });
        }
        catch (error) {
            if ((0, errors_1.isStripeApiError)(error)) {
                throw (0, errors_1.createStripeErrorFromApiError)(error, errors_1.STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
            }
            throw error;
        }
    }
    /**
     * Reactivate a Stripe product when a plan is reactivated
     * Requirements: 8.4
     */
    static async reactivateProduct(productId, priceId) {
        try {
            // Reactivate the product
            await (0, stripe_1.getStripe)().products.update(productId, {
                active: true,
            });
            // Reactivate the price if provided
            if (priceId) {
                await (0, stripe_1.getStripe)().prices.update(priceId, {
                    active: true,
                });
            }
        }
        catch (error) {
            if ((0, errors_1.isStripeApiError)(error)) {
                throw (0, errors_1.createStripeErrorFromApiError)(error, errors_1.STRIPE_ERROR_CODES.PRODUCT_SYNC_FAILED);
            }
            throw error;
        }
    }
    /**
     * Store Stripe IDs in the subscription plan record
     * Requirements: 8.3
     */
    static async storeStripeIds(planId, stripeIds) {
        await db_1.prisma.subscriptionPlan.update({
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
    static async updateStripePriceId(planId, priceId) {
        await db_1.prisma.subscriptionPlan.update({
            where: { id: planId },
            data: {
                stripePriceId: priceId,
            },
        });
    }
}
exports.StripeSyncService = StripeSyncService;
