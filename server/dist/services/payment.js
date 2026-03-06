"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = exports.STRIPE_ERROR_CODES = exports.StripeError = void 0;
const db_1 = require("../config/db");
const stripe_1 = require("../config/stripe");
const environment_1 = require("../config/environment");
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
const stripe_2 = __importDefault(require("stripe"));
const SubscriptionStatusValues = {
    NONE: "NONE",
    ACTIVE: "ACTIVE",
    PAST_DUE: "PAST_DUE",
    CANCELED: "CANCELED",
    INCOMPLETE: "INCOMPLETE",
};
// Re-export StripeError and STRIPE_ERROR_CODES for backward compatibility
var errors_2 = require("../errors");
Object.defineProperty(exports, "StripeError", { enumerable: true, get: function () { return errors_2.StripeError; } });
Object.defineProperty(exports, "STRIPE_ERROR_CODES", { enumerable: true, get: function () { return errors_2.STRIPE_ERROR_CODES; } });
/**
 * Payment Service - Handles all Stripe payment interactions
 * Requirements: 1.1-1.4, 2.1-2.6, 3.1-3.7, 4.1-4.6, 5.1-5.4, 6.1-6.4
 */
class PaymentService {
    /**
     * Get or create a Stripe customer for a user
     * - Creates a new Stripe customer if user doesn't have one
     * - Returns existing customer ID if user already has one
     * - Syncs email with Stripe customer
     * Requirements: 1.1, 1.2, 1.3, 1.4
     */
    static async getOrCreateStripeCustomer(userId) {
        // Find user by ID
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // If user already has a Stripe customer ID, verify and return it
        if (user.stripeCustomerId) {
            try {
                // Retrieve the customer to verify it exists and sync email
                const existingCustomer = await (0, stripe_1.getStripe)().customers.retrieve(user.stripeCustomerId);
                // Check if customer was deleted in Stripe
                if (existingCustomer.deleted) {
                    // Customer was deleted, create a new one
                    return await this.createAndStoreStripeCustomer(user);
                }
                const customer = existingCustomer;
                // Sync email if it has changed (Requirement 1.3)
                if (customer.email !== user.email) {
                    await (0, stripe_1.getStripe)().customers.update(user.stripeCustomerId, {
                        email: user.email,
                    });
                }
                return user.stripeCustomerId;
            }
            catch (error) {
                // If customer doesn't exist in Stripe, create a new one
                if (error instanceof stripe_2.default.errors.StripeError && error.code === "resource_missing") {
                    return await this.createAndStoreStripeCustomer(user);
                }
                throw error;
            }
        }
        // Create new Stripe customer (Requirement 1.1)
        return await this.createAndStoreStripeCustomer(user);
    }
    /**
     * Create a new Stripe customer and store the ID in the user record
     * Private helper method
     */
    static async createAndStoreStripeCustomer(user) {
        try {
            // Create Stripe customer with user email and metadata
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;
            const customer = await (0, stripe_1.getStripe)().customers.create({
                email: user.email,
                metadata: {
                    userId: user.id,
                },
                name: fullName,
            });
            // Store customer ID in user record
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customer.id },
            });
            return customer.id;
        }
        catch (error) {
            // Handle Stripe API errors (Requirement 1.4)
            if ((0, errors_1.isStripeApiError)(error)) {
                throw (0, errors_1.createStripeErrorFromApiError)(error, errors_1.STRIPE_ERROR_CODES.CUSTOMER_CREATION_FAILED);
            }
            throw error;
        }
    }
    /**
     * Create a Stripe checkout session for a subscription plan
     * - Creates checkout session with correct mode based on billing period
     * - Includes userId and planId in metadata for webhook processing
     * - Sets success and cancel URLs
     * - Returns session URL for redirect
     * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
     */
    static async createCheckoutSession(params) {
        const { userId, planId, successUrl, cancelUrl } = params;
        // Find user
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // Find subscription plan
        const plan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new errors_1.NotFoundError(`Subscription plan with ID ${planId} not found`);
        }
        // Ensure plan has Stripe price ID
        if (!plan.stripePriceId) {
            throw new errors_1.StripeError(`This subscription plan (${plan.name}) is not yet configured with Stripe. Please contact support or link the plan to a Stripe product.`, errors_1.STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED, 400);
        }
        // Get or create Stripe customer for the user
        const customerId = await this.getOrCreateStripeCustomer(userId);
        // Determine checkout mode based on billing period (Requirements 2.3, 2.4)
        const mode = plan.billingPeriod === client_1.BillingPeriod.ONE_TIME ? "payment" : "subscription";
        // Build success and cancel URLs with defaults
        const baseUrl = environment_1.config.frontendUrl;
        const finalSuccessUrl = successUrl || `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
        const finalCancelUrl = cancelUrl || `${baseUrl}/payment/cancel`;
        try {
            // Create Stripe checkout session (Requirements 2.1, 2.2, 2.5)
            const session = await (0, stripe_1.getStripe)().checkout.sessions.create({
                customer: customerId,
                mode,
                line_items: [
                    {
                        price: plan.stripePriceId,
                        quantity: 1,
                    },
                ],
                // Include userId and planId in metadata for webhook processing (Requirement 2.2)
                metadata: {
                    userId,
                    planId,
                },
                success_url: finalSuccessUrl,
                cancel_url: finalCancelUrl,
                // For subscriptions, also add metadata to the subscription
                ...(mode === "subscription" && {
                    subscription_data: {
                        metadata: {
                            userId,
                            planId,
                        },
                    },
                }),
                // For one-time payments, add metadata to the payment intent
                ...(mode === "payment" && {
                    payment_intent_data: {
                        metadata: {
                            userId,
                            planId,
                        },
                    },
                }),
            });
            // Ensure we have a valid URL (Requirement 2.5)
            if (!session.url) {
                throw new errors_1.StripeError("Checkout session created but no URL was returned", errors_1.STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED, 500);
            }
            return {
                sessionId: session.id,
                url: session.url,
            };
        }
        catch (error) {
            // Handle Stripe API errors (Requirement 2.6)
            if (error instanceof errors_1.StripeError) {
                throw error;
            }
            if ((0, errors_1.isStripeApiError)(error)) {
                throw (0, errors_1.createStripeErrorFromApiError)(error, errors_1.STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED);
            }
            throw error;
        }
    }
    /**
     * Cancel a user's subscription at period end
     * - Cancels the subscription in Stripe at the end of the current billing period
     * - Updates local record with cancelAtPeriodEnd flag
     * Requirements: 6.1, 6.2
     */
    static async cancelSubscription(userId) {
        // Find user
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // Check if user has an active subscription
        if (!user.stripeSubscriptionId) {
            throw new errors_1.StripeError("User does not have an active subscription to cancel", errors_1.STRIPE_ERROR_CODES.SUBSCRIPTION_CANCEL_FAILED, 400);
        }
        try {
            // Cancel subscription at period end in Stripe (Requirement 6.1)
            await (0, stripe_1.getStripe)().subscriptions.update(user.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });
            // Update local record with cancelAtPeriodEnd flag (Requirement 6.2)
            await db_1.prisma.user.update({
                where: { id: userId },
                data: {
                    cancelAtPeriodEnd: true,
                },
            });
        }
        catch (error) {
            if (error instanceof errors_1.StripeError) {
                throw error;
            }
            if ((0, errors_1.isStripeApiError)(error)) {
                throw (0, errors_1.createStripeErrorFromApiError)(error, errors_1.STRIPE_ERROR_CODES.SUBSCRIPTION_CANCEL_FAILED);
            }
            throw error;
        }
    }
    /**
     * Get the subscription status for a user
     * - Returns current status, period end, and cancel flag
     * Requirements: 4.1, 4.5
     */
    static async getSubscriptionStatus(userId) {
        // Find user
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        return {
            status: user.subscriptionStatus,
            currentPeriodEnd: user.currentPeriodEnd,
            cancelAtPeriodEnd: user.cancelAtPeriodEnd,
        };
    }
    /**
     * Check if a user has active access to premium features
     * - Grants access for active subscriptions
     * - Grants access for canceled subscriptions until period end
     * Requirements: 4.5, 6.3, 6.4
     */
    static async hasActiveAccess(userId) {
        // Find user
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        const now = new Date();
        // Grant access for active subscriptions (Requirement 4.5)
        if (user.subscriptionStatus === SubscriptionStatusValues.ACTIVE) {
            return true;
        }
        // Grant access for canceled subscriptions until period end (Requirements 6.3, 6.4)
        if (user.subscriptionStatus === SubscriptionStatusValues.CANCELED && user.currentPeriodEnd) {
            // User still has access if current period hasn't ended
            if (user.currentPeriodEnd > now) {
                return true;
            }
        }
        // No access for other statuses (NONE, PAST_DUE, INCOMPLETE) or expired canceled subscriptions
        return false;
    }
    /**
     * Get payment history for a user
     * - Queries payments for the specified user
     * - Orders by createdAt descending (most recent first)
     * - Includes plan details for each payment
     * Requirements: 5.1, 5.2
     */
    static async getPaymentHistory(userId) {
        // Verify user exists
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // Query payments for user, ordered by createdAt descending (Requirement 5.2)
        // Include plan details (Requirement 5.1)
        const payments = await db_1.prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                plan: true,
            },
        });
        return payments;
    }
    /**
     * Get all payments with filtering for admin dashboard
     * - Supports filtering by status, planId, date range
     * - Supports pagination
     * Requirements: 7.1, 7.2
     */
    static async getAllPayments(params) {
        const { status, planId, startDate, endDate, page = 1, limit = 20 } = params;
        // Build where clause for filtering
        const where = {};
        if (status) {
            where.status = status;
        }
        if (planId) {
            where.planId = planId;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }
        // Get total count for pagination
        const total = await db_1.prisma.payment.count({ where });
        // Get paginated payments
        const payments = await db_1.prisma.payment.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                plan: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return {
            payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get payment statistics for admin dashboard
     * - Calculates total revenue
     * - Counts active subscriptions
     * - Gets recent transactions
     * Requirements: 7.1
     */
    static async getPaymentStats() {
        // Calculate total revenue from successful payments
        const revenueResult = await db_1.prisma.payment.aggregate({
            where: { status: "SUCCEEDED" },
            _sum: { amount: true },
        });
        const totalRevenue = revenueResult._sum.amount || 0;
        // Count active subscriptions
        const activeSubscriptions = await db_1.prisma.user.count({
            where: { subscriptionStatus: "ACTIVE" },
        });
        // Get recent payments (last 10)
        const recentPayments = await db_1.prisma.payment.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                plan: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        // Calculate revenue by plan
        const revenueByPlanResult = await db_1.prisma.payment.groupBy({
            by: ["planId"],
            where: { status: "SUCCEEDED", planId: { not: null } },
            _sum: { amount: true },
        });
        // Get plan names for revenue breakdown
        const planIds = revenueByPlanResult.map((r) => r.planId).filter((id) => id !== null);
        const plans = await db_1.prisma.subscriptionPlan.findMany({
            where: { id: { in: planIds } },
            select: { id: true, name: true },
        });
        const planNameMap = new Map(plans.map((p) => [p.id, p.name]));
        const revenueByPlan = revenueByPlanResult.map((r) => ({
            planName: r.planId ? planNameMap.get(r.planId) || "Unknown" : "Unknown",
            revenue: r._sum.amount || 0,
        }));
        return {
            totalRevenue,
            activeSubscriptions,
            recentPayments,
            revenueByPlan,
        };
    }
    /**
     * Grant subscription access to a user (admin action)
     * - Manually grants subscription access without payment
     * - Logs the admin action for audit
     * Requirements: 7.4, 7.5
     */
    static async grantSubscriptionAccess(userId, planId, adminId) {
        // Verify user exists
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // Verify plan exists
        const plan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new errors_1.NotFoundError(`Subscription plan with ID ${planId} not found`);
        }
        // Calculate period end based on billing period
        const now = new Date();
        let periodEnd;
        switch (plan.billingPeriod) {
            case client_1.BillingPeriod.MONTHLY:
                periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                break;
            case client_1.BillingPeriod.YEARLY:
                periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
                break;
            case client_1.BillingPeriod.ONE_TIME:
                // For one-time, set a far future date
                periodEnd = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        // Update user subscription status and log admin action in a transaction
        await db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: "ACTIVE",
                    subscriptionId: planId,
                    currentPeriodEnd: periodEnd,
                    cancelAtPeriodEnd: false,
                },
            }),
            db_1.prisma.adminAction.create({
                data: {
                    adminId,
                    targetUserId: userId,
                    action: "GRANT_SUBSCRIPTION",
                    details: {
                        planId,
                        planName: plan.name,
                        periodEnd: periodEnd.toISOString(),
                    },
                },
            }),
        ]);
    }
    /**
     * Revoke subscription access from a user (admin action)
     * - Manually revokes subscription access
     * - Logs the admin action for audit
     * Requirements: 7.4, 7.5
     */
    static async revokeSubscriptionAccess(userId, adminId, reason) {
        // Verify user exists
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // Update user subscription status and log admin action in a transaction
        await db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: "NONE",
                    subscriptionId: null,
                    stripeSubscriptionId: null,
                    currentPeriodEnd: null,
                    cancelAtPeriodEnd: false,
                },
            }),
            db_1.prisma.adminAction.create({
                data: {
                    adminId,
                    targetUserId: userId,
                    action: "REVOKE_SUBSCRIPTION",
                    details: {
                        reason: reason || "Admin revoked access",
                        previousStatus: user.subscriptionStatus,
                    },
                },
            }),
        ]);
        // If user has a Stripe subscription, cancel it immediately
        if (user.stripeSubscriptionId) {
            try {
                await (0, stripe_1.getStripe)().subscriptions.cancel(user.stripeSubscriptionId);
            }
            catch (error) {
                // Log but don't fail if Stripe cancellation fails
                console.error("Failed to cancel Stripe subscription:", error);
            }
        }
    }
}
exports.PaymentService = PaymentService;
