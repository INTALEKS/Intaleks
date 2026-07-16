"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const db_1 = require("../config/db");
const stripe_1 = require("../config/stripe");
const errors_1 = require("../errors");
const webhook_logger_1 = require("./webhook-logger");
const invoice_1 = require("./invoice");
const stripe_2 = __importDefault(require("stripe"));
const SubscriptionStatusValues = {
    NONE: "NONE",
    ACTIVE: "ACTIVE",
    PAST_DUE: "PAST_DUE",
    CANCELED: "CANCELED",
    INCOMPLETE: "INCOMPLETE",
};
// Payment status values matching Prisma enum
const PaymentStatusValues = {
    PENDING: "PENDING",
    SUCCEEDED: "SUCCEEDED",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
};
/**
 * In-memory store for processed event IDs (for idempotency)
 * In production, this should be stored in Redis or database
 */
const processedEventIds = new Set();
/**
 * Webhook Handler Service - Processes incoming Stripe webhook events
 */
class WebhookService {
    /**
     * Validate webhook signature and parse event
     * - Verifies webhook signature using Stripe signing secret
     * - Parses event payload
     * - Returns 400 for invalid signatures
     */
    static validateAndParseEvent(payload, signature, skipVerification = false) {
        // Skip verification in development so CLI secret doesn't need to match container
        if (skipVerification || !stripe_1.stripeConfig.webhookSecret) {
            if (process.env.NODE_ENV === "development") {
                console.warn("⚠️  Skipping webhook signature verification (development mode)");
                return JSON.parse(payload.toString());
            }
            throw new errors_1.StripeError("Webhook secret is not configured", errors_1.STRIPE_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID, 500);
        }
        try {
            const event = (0, stripe_1.getStripe)().webhooks.constructEvent(payload, signature, stripe_1.stripeConfig.webhookSecret);
            return event;
        }
        catch (error) {
            if (error instanceof stripe_2.default.errors.StripeSignatureVerificationError) {
                throw new errors_1.StripeError("Invalid webhook signature", errors_1.STRIPE_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID, 400, error);
            }
            throw error;
        }
    }
    /**
     * Handle incoming webhook event
     * - Validates signature
     * - Checks for idempotency
     * - Routes to appropriate handler
     * - Logs errors for manual review
     * Requirements: 3.1-3.7, 10.4, 10.5
     */
    static async handleEvent(payload, signature, skipVerification = false) {
        let event;
        try {
            event = this.validateAndParseEvent(payload, signature, skipVerification);
        }
        catch (error) {
            // Log signature validation errors (Requirement 10.4)
            await webhook_logger_1.WebhookErrorLogger.logError({
                eventId: "unknown",
                eventType: "signature_validation",
                error: error instanceof Error ? error : String(error),
                errorCode: errors_1.STRIPE_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
                payload: payload.toString().substring(0, 500), // Truncate for safety
            });
            throw error;
        }
        // Check for idempotency - skip duplicate events (Requirement 10.5)
        if (processedEventIds.has(event.id)) {
            return {
                success: true,
                eventType: event.type,
                message: "Event already processed (idempotent)",
            };
        }
        // Process the event based on type
        let result;
        try {
            switch (event.type) {
                case "checkout.session.completed":
                    result = await this.handleCheckoutSessionCompleted(event);
                    break;
                case "invoice.payment_succeeded":
                    result = await this.handleInvoicePaymentSucceeded(event);
                    break;
                case "invoice.payment_failed":
                    result = await this.handleInvoicePaymentFailed(event);
                    break;
                case "customer.subscription.deleted":
                    result = await this.handleSubscriptionDeleted(event);
                    break;
                case "customer.subscription.updated":
                    result = await this.handleSubscriptionUpdated(event);
                    break;
                default:
                    // Acknowledge unhandled events
                    result = {
                        success: true,
                        eventType: event.type,
                        message: "Event type not handled",
                    };
            }
            // Log failed webhook processing for manual review (Requirement 10.4)
            if (!result.success) {
                await webhook_logger_1.WebhookErrorLogger.logError({
                    eventId: event.id,
                    eventType: event.type,
                    error: result.message || "Unknown error during webhook processing",
                    payload: JSON.stringify(event.data.object),
                });
            }
        }
        catch (error) {
            // Log unexpected errors for manual review (Requirement 10.4)
            await webhook_logger_1.WebhookErrorLogger.logError({
                eventId: event.id,
                eventType: event.type,
                error: error instanceof Error ? error : String(error),
                payload: JSON.stringify(event.data.object),
            });
            result = {
                success: false,
                eventType: event.type,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
        // Mark event as processed for idempotency (Requirement 10.5)
        processedEventIds.add(event.id);
        // Clean up old event IDs to prevent memory leak (keep last 10000)
        if (processedEventIds.size > 10000) {
            const iterator = processedEventIds.values();
            for (let i = 0; i < 1000; i++) {
                const value = iterator.next().value;
                if (value) {
                    processedEventIds.delete(value);
                }
            }
        }
        return result;
    }
    /**
     * Handle checkout.session.completed event
     * - Extract userId and planId from metadata
     * - Update user subscription status to active
     * - Create payment record
     * Requirements: 3.2, 4.2
     */
    static async handleCheckoutSessionCompleted(event) {
        const session = event.data.object;
        // Extract userId and planId from metadata (Requirement 3.2)
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (!userId) {
            console.error("Webhook: checkout.session.completed missing userId in metadata");
            return {
                success: false,
                eventType: event.type,
                message: "Missing userId in session metadata",
            };
        }
        try {
            // Get the subscription ID if this was a subscription checkout
            const stripeSubscriptionId = session.subscription;
            // Extract Stripe customer ID from checkout session (critical for subsequent webhooks)
            const stripeCustomerId = session.customer;
            // Retrieve full session details with expanded discounts and promotion codes
            const stripe = (0, stripe_1.getStripe)();
            const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ["discounts", "discounts.promotion_code"],
            });
            let referralCodeUsed = null;
            let referredById = null;
            if (expandedSession.discounts && expandedSession.discounts.length > 0) {
                for (const discount of expandedSession.discounts) {
                    const promo = discount.promotion_code;
                    if (promo && promo.code) {
                        referralCodeUsed = promo.code;
                        break;
                    }
                }
            }
            if (referralCodeUsed) {
                const referralProfile = await db_1.prisma.professionalReferralProfile.findFirst({
                    where: {
                        code: referralCodeUsed.trim().toUpperCase(),
                        status: "ACTIVE",
                    },
                });
                if (referralProfile) {
                    referredById = referralProfile.userId;
                    console.log(`[WEBHOOK] User ${userId} used referral code ${referralCodeUsed}. Linking referredById = ${referredById}`);
                }
            }
            // Get subscription details if available
            let currentPeriodEnd = null;
            if (stripeSubscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                // Access current_period_end from the subscription object
                const periodEnd = subscription.current_period_end;
                if (periodEnd) {
                    currentPeriodEnd = new Date(periodEnd * 1000);
                }
            }
            // Update user subscription status to active (Requirement 4.2)
            // Include stripeCustomerId so subsequent webhooks can find the user
            await db_1.prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: SubscriptionStatusValues.ACTIVE,
                    stripeSubscriptionId: stripeSubscriptionId,
                    stripeCustomerId: stripeCustomerId,
                    subscriptionId: planId,
                    currentPeriodEnd: currentPeriodEnd,
                    cancelAtPeriodEnd: false,
                    ...(referredById ? { referredById } : {}),
                },
            });
            // Create payment record (Requirement 3.2)
            const amountTotal = session.amount_total || 0;
            const paymentIntentId = session.payment_intent;
            const payment = await db_1.prisma.payment.create({
                data: {
                    userId,
                    planId: planId || null,
                    amount: amountTotal,
                    currency: session.currency || "usd",
                    status: PaymentStatusValues.SUCCEEDED,
                    stripePaymentId: paymentIntentId || session.id, // Use session ID as fallback
                    description: `Subscription payment for plan`,
                },
            });
            // Generate and send invoice
            try {
                const invoice = await invoice_1.invoiceService.createInvoice(payment.id);
                await invoice_1.invoiceService.sendInvoiceEmail(invoice.id);
                console.log(`✅ Invoice ${invoice.invoiceNumber} generated and sent for payment ${payment.id}`);
            }
            catch (invoiceError) {
                console.error("Failed to generate/send invoice:", invoiceError);
                // Don't fail the webhook for invoice errors
            }
            return {
                success: true,
                eventType: event.type,
                message: "Checkout session completed successfully",
            };
        }
        catch (error) {
            console.error("Webhook: Error processing checkout.session.completed:", error);
            return {
                success: false,
                eventType: event.type,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Handle invoice.payment_succeeded event
     * - Update subscription period end date
     * - Create payment record for renewal
     * Requirements: 3.3
     */
    static async handleInvoicePaymentSucceeded(event) {
        const invoice = event.data.object;
        // Skip if this is not a subscription invoice
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) {
            return {
                success: true,
                eventType: event.type,
                message: "Not a subscription invoice, skipping",
            };
        }
        const stripeSubscriptionId = subscriptionId;
        const stripeCustomerId = invoice.customer;
        try {
            // Find user by Stripe customer ID
            const user = await db_1.prisma.user.findFirst({
                where: { stripeCustomerId },
            });
            if (!user) {
                console.error(`Webhook: No user found for Stripe customer ${stripeCustomerId}`);
                return {
                    success: false,
                    eventType: event.type,
                    message: "User not found for customer",
                };
            }
            // Get subscription details to update period end
            const subscription = await (0, stripe_1.getStripe)().subscriptions.retrieve(stripeSubscriptionId);
            const periodEnd = subscription.current_period_end;
            const currentPeriodEnd = new Date(periodEnd * 1000);
            // Update user subscription period end date (Requirement 3.3)
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus: SubscriptionStatusValues.ACTIVE,
                    currentPeriodEnd: currentPeriodEnd,
                    stripeSubscriptionId: stripeSubscriptionId,
                },
            });
            // Create payment record for renewal (Requirement 3.3)
            // Only create if this is a renewal (not the first payment)
            const existingPayments = await db_1.prisma.payment.count({
                where: { userId: user.id },
            });
            if (existingPayments > 0 || invoice.billing_reason === "subscription_cycle") {
                const payment = await db_1.prisma.payment.create({
                    data: {
                        userId: user.id,
                        planId: user.subscriptionId,
                        amount: invoice.amount_paid,
                        currency: invoice.currency,
                        status: PaymentStatusValues.SUCCEEDED,
                        stripeInvoiceId: invoice.id,
                        description: "Subscription renewal",
                    },
                });
                // Generate and send invoice for renewal
                try {
                    const invoiceRecord = await invoice_1.invoiceService.createInvoice(payment.id);
                    await invoice_1.invoiceService.sendInvoiceEmail(invoiceRecord.id);
                    console.log(`✅ Renewal invoice ${invoiceRecord.invoiceNumber} generated and sent for payment ${payment.id}`);
                }
                catch (invoiceError) {
                    console.error("Failed to generate/send renewal invoice:", invoiceError);
                    // Don't fail the webhook for invoice errors
                }
            }
            return {
                success: true,
                eventType: event.type,
                message: "Invoice payment succeeded processed",
            };
        }
        catch (error) {
            console.error("Webhook: Error processing invoice.payment_succeeded:", error);
            return {
                success: false,
                eventType: event.type,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Handle invoice.payment_failed event
     * - Update subscription status to past_due
     * Requirements: 3.4, 4.3
     */
    static async handleInvoicePaymentFailed(event) {
        const invoice = event.data.object;
        // Skip if this is not a subscription invoice
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) {
            return {
                success: true,
                eventType: event.type,
                message: "Not a subscription invoice, skipping",
            };
        }
        const stripeCustomerId = invoice.customer;
        try {
            // Find user by Stripe customer ID
            const user = await db_1.prisma.user.findFirst({
                where: { stripeCustomerId },
            });
            if (!user) {
                console.error(`Webhook: No user found for Stripe customer ${stripeCustomerId}`);
                return {
                    success: false,
                    eventType: event.type,
                    message: "User not found for customer",
                };
            }
            // Update subscription status to past_due (Requirements 3.4, 4.3)
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus: SubscriptionStatusValues.PAST_DUE,
                },
            });
            // Create failed payment record
            const payment = await db_1.prisma.payment.create({
                data: {
                    userId: user.id,
                    planId: user.subscriptionId,
                    amount: invoice.amount_due,
                    currency: invoice.currency,
                    status: PaymentStatusValues.FAILED,
                    stripeInvoiceId: invoice.id,
                    description: "Payment failed",
                },
            });
            // Generate and send failed payment notification email
            try {
                const invoiceRecord = await invoice_1.invoiceService.createInvoice(payment.id);
                await invoice_1.invoiceService.sendInvoiceEmail(invoiceRecord.id);
                console.log(`✅ Failed payment invoice ${invoiceRecord.invoiceNumber} sent for payment ${payment.id}`);
            }
            catch (invoiceError) {
                console.error("Failed to generate/send failed payment invoice:", invoiceError);
            }
            return {
                success: true,
                eventType: event.type,
                message: "Invoice payment failed processed",
            };
        }
        catch (error) {
            console.error("Webhook: Error processing invoice.payment_failed:", error);
            return {
                success: false,
                eventType: event.type,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Handle customer.subscription.deleted event
     * - Update subscription status to canceled
     * - Revoke access
     * Requirements: 3.5, 4.4
     */
    static async handleSubscriptionDeleted(event) {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        try {
            // Find user by Stripe customer ID
            const user = await db_1.prisma.user.findFirst({
                where: { stripeCustomerId },
            });
            if (!user) {
                console.error(`Webhook: No user found for Stripe customer ${stripeCustomerId}`);
                return {
                    success: false,
                    eventType: event.type,
                    message: "User not found for customer",
                };
            }
            // Update subscription status to canceled and revoke access (Requirements 3.5, 4.4)
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus: SubscriptionStatusValues.CANCELED,
                    stripeSubscriptionId: null,
                    currentPeriodEnd: null,
                    cancelAtPeriodEnd: false,
                },
            });
            return {
                success: true,
                eventType: event.type,
                message: "Subscription deleted processed",
            };
        }
        catch (error) {
            console.error("Webhook: Error processing customer.subscription.deleted:", error);
            return {
                success: false,
                eventType: event.type,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Handle customer.subscription.updated event
     * - Update subscription status based on Stripe status
     * - Update period end and cancel flags
     */
    static async handleSubscriptionUpdated(event) {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        try {
            // Find user by Stripe customer ID
            const user = await db_1.prisma.user.findFirst({
                where: { stripeCustomerId },
            });
            if (!user) {
                console.error(`Webhook: No user found for Stripe customer ${stripeCustomerId}`);
                return {
                    success: false,
                    eventType: event.type,
                    message: "User not found for customer",
                };
            }
            // Map Stripe subscription status to our status
            let subscriptionStatus;
            switch (subscription.status) {
                case "active":
                case "trialing":
                    subscriptionStatus = SubscriptionStatusValues.ACTIVE;
                    break;
                case "past_due":
                    subscriptionStatus = SubscriptionStatusValues.PAST_DUE;
                    break;
                case "canceled":
                case "unpaid":
                    subscriptionStatus = SubscriptionStatusValues.CANCELED;
                    break;
                case "incomplete":
                case "incomplete_expired":
                    subscriptionStatus = SubscriptionStatusValues.INCOMPLETE;
                    break;
                default:
                    subscriptionStatus = user.subscriptionStatus;
            }
            // Update user subscription data
            const periodEnd = subscription.current_period_end;
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus,
                    currentPeriodEnd: new Date(periodEnd * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
            });
            return {
                success: true,
                eventType: event.type,
                message: "Subscription updated processed",
            };
        }
        catch (error) {
            console.error("Webhook: Error processing customer.subscription.updated:", error);
            return {
                success: false,
                eventType: event.type,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Check if an event has already been processed (for external use)
     * Requirements: 10.5
     */
    static isEventProcessed(eventId) {
        return processedEventIds.has(eventId);
    }
    /**
     * Clear processed events (for testing purposes)
     */
    static clearProcessedEvents() {
        processedEventIds.clear();
    }
}
exports.WebhookService = WebhookService;
