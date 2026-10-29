import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";
import { getStripe, stripeConfig } from "../config/stripe";
import { StripeError, STRIPE_ERROR_CODES } from "../errors";
import { WebhookErrorLogger } from "./webhook-logger";
import { PartnerService } from "./partner.service";
import { invoiceService } from "./invoice";
import { emailService } from "./email";
import Stripe from "stripe";
import { hasUnexpiredSubscription } from "../utils/subscriptionAccess";

// Subscription status values matching Prisma enum
type SubscriptionStatusType = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";

const SubscriptionStatusValues = {
  NONE: "NONE" as const,
  ACTIVE: "ACTIVE" as const,
  PAST_DUE: "PAST_DUE" as const,
  CANCELED: "CANCELED" as const,
  INCOMPLETE: "INCOMPLETE" as const,
};

// Payment status values matching Prisma enum
const PaymentStatusValues = {
  PENDING: "PENDING" as const,
  SUCCEEDED: "SUCCEEDED" as const,
  FAILED: "FAILED" as const,
  REFUNDED: "REFUNDED" as const,
};

/**
 * Result of processing a webhook event
 * Requirements: 3.7
 */
export interface WebhookResult {
  success: boolean;
  eventType: string;
  message?: string;
}

/**
 * Supported webhook event types
 * Requirements: 3.2, 3.3, 3.4, 3.5
 */
export type SupportedWebhookEvent = "checkout.session.completed" | "invoice.payment_succeeded" | "invoice.payment_failed" | "customer.subscription.deleted" | "customer.subscription.updated";

/**
 * In-memory store for processed event IDs (for idempotency)
 * In production, this should be stored in Redis or database
 */
const processedEventIds = new Set<string>();

/**
 * Webhook Handler Service - Processes incoming Stripe webhook events
 */
export class WebhookService {
  /**
   * Validate webhook signature and parse event
   * - Verifies webhook signature using Stripe signing secret
   * - Parses event payload
   * - Returns 400 for invalid signatures
   */
  static validateAndParseEvent(payload: Buffer, signature: string, skipVerification = false): Stripe.Event {
    // Skip verification in development so CLI secret doesn't need to match container
    if (skipVerification || !stripeConfig.webhookSecret) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️  Skipping webhook signature verification (development mode)");
        return JSON.parse(payload.toString()) as Stripe.Event;
      }
      throw new StripeError("Webhook secret is not configured", STRIPE_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID, 500);
    }

    try {
      const event = getStripe().webhooks.constructEvent(payload, signature, stripeConfig.webhookSecret);
      return event;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        throw new StripeError("Invalid webhook signature", STRIPE_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID, 400, error);
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
  static async handleEvent(payload: Buffer, signature: string, skipVerification = false): Promise<WebhookResult> {
    let event: Stripe.Event;

    try {
      event = this.validateAndParseEvent(payload, signature, skipVerification);
    } catch (error) {
      // Log signature validation errors (Requirement 10.4)
      await WebhookErrorLogger.logError({
        eventId: "unknown",
        eventType: "signature_validation",
        error: error instanceof Error ? error : String(error),
        errorCode: STRIPE_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
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
    let result: WebhookResult;

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
        await WebhookErrorLogger.logError({
          eventId: event.id,
          eventType: event.type,
          error: result.message || "Unknown error during webhook processing",
          payload: JSON.stringify(event.data.object),
        });
      }
    } catch (error) {
      // Log unexpected errors for manual review (Requirement 10.4)
      await WebhookErrorLogger.logError({
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
  private static async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<WebhookResult> {
    const session = event.data.object as Stripe.Checkout.Session;

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

    // Partner access is a separate one-off firm purchase. It never creates or
    // renews a Business Owner subscription.
    if (session.metadata?.checkoutType === "partner") {
      const firmId = session.metadata.partnerFirmId;
      const planType = session.metadata.partnerPlanType as "PARTNER" | "PARTNER_UNLIMITED";
      if (!firmId || (planType !== "PARTNER" && planType !== "PARTNER_UNLIMITED")) {
        return { success: false, eventType: event.type, message: "Partner checkout is missing firm or plan metadata" };
      }
      try {
        const paymentId = (session.payment_intent as string | null) || session.id;
        const existingPayment = await prisma.payment.findUnique({ where: { stripePaymentId: paymentId } });
        if (existingPayment) {
          return { success: true, eventType: event.type, message: "Partner checkout already processed" };
        }
        if (!existingPayment) {
          await prisma.payment.create({
            data: {
              userId,
              amount: session.amount_total || 0,
              currency: session.currency || "aud",
              status: PaymentStatusValues.SUCCEEDED,
              stripePaymentId: paymentId,
              description: `${planType === "PARTNER" ? "Partner" : "Partner Unlimited"} firm access — 30 days`,
            },
          });
        }
        await PartnerService.activateFirm(firmId, planType);
        return { success: true, eventType: event.type, message: "Partner firm activated for 30 days" };
      } catch (error) {
        return { success: false, eventType: event.type, message: error instanceof Error ? error.message : "Partner activation failed" };
      }
    }

    try {
      const paymentIntentId = session.payment_intent as string | null;
      const idempotencyPaymentId = paymentIntentId || session.id;
      const existingCheckoutPayment = await prisma.payment.findUnique({
        where: { stripePaymentId: idempotencyPaymentId },
        select: { id: true },
      });
      if (existingCheckoutPayment) {
        return { success: true, eventType: event.type, message: "Checkout already processed" };
      }

      // Get the subscription ID if this was a subscription checkout
      const stripeSubscriptionId = session.subscription as string | null;
      // Extract Stripe customer ID from checkout session (critical for subsequent webhooks)
      const stripeCustomerId = session.customer as string | null;

      // Retrieve full session details with expanded discounts and promotion codes
      const stripe = getStripe();
      const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["discounts", "discounts.promotion_code"],
      });

      let referralCodeUsed: string | null = null;
      let referredById: string | null = null;

      if (expandedSession.discounts && expandedSession.discounts.length > 0) {
        for (const discount of expandedSession.discounts) {
          const promo = (discount as any).promotion_code;
          if (promo && promo.code) {
            referralCodeUsed = promo.code;
            break;
          }
        }
      }

      if (referralCodeUsed) {
        const referralProfile = await prisma.professionalReferralProfile.findFirst({
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

      const isRetailValuationPurchase = session.metadata?.retailValuationLimit === "1";

      // Retail purchases buy valuation credits, not time-based subscription
      // access. Preserve a separate, still-active subscription if the user has one.
      let currentPeriodEnd: Date | null = null;
      if (stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        // Access current_period_end from the subscription object
        const periodEnd = (subscription as any).current_period_end;
        if (periodEnd) {
          currentPeriodEnd = new Date(periodEnd * 1000);
        }
      }
      if (!stripeSubscriptionId && planId && !isRetailValuationPurchase) {
        const accessPlan = await prisma.subscriptionPlan.findUnique({ where: { id: planId }, select: { name: true } });
        const months = accessPlan?.name.startsWith("12 Months") ? 12 : accessPlan?.name.startsWith("6 Months") ? 6 : 2;
        currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + months);
      }

      const existingUser = isRetailValuationPurchase
        ? await prisma.user.findUnique({
            where: { id: userId },
            select: {
              subscriptionStatus: true,
              currentPeriodEnd: true,
              cancelAtPeriodEnd: true,
              stripeSubscriptionId: true,
              subscriptionId: true,
            },
          })
        : null;
      const preserveExistingSubscription = Boolean(
        existingUser && hasUnexpiredSubscription(existingUser.subscriptionStatus, existingUser.currentPeriodEnd),
      );

      const amountTotal = session.amount_total || 0;
      // Record payment and grant any retail valuation credit atomically. The
      // unique Stripe payment ID prevents concurrent duplicate webhooks adding
      // extra credits before the payment idempotency check can observe the row.
      const payment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const createdPayment = await tx.payment.create({
          data: {
            userId,
            planId: planId || null,
            amount: amountTotal,
            currency: session.currency || "usd",
            status: PaymentStatusValues.SUCCEEDED,
            stripePaymentId: idempotencyPaymentId,
            description: isRetailValuationPurchase ? "One-time business valuation purchase" : "Subscription payment for plan",
          },
        });
        await tx.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: preserveExistingSubscription
              ? existingUser!.subscriptionStatus
              : isRetailValuationPurchase ? SubscriptionStatusValues.NONE : SubscriptionStatusValues.ACTIVE,
            stripeSubscriptionId: preserveExistingSubscription ? existingUser!.stripeSubscriptionId : stripeSubscriptionId,
            stripeCustomerId,
            subscriptionId: preserveExistingSubscription ? existingUser!.subscriptionId : planId,
            currentPeriodEnd: preserveExistingSubscription ? existingUser!.currentPeriodEnd : currentPeriodEnd,
            cancelAtPeriodEnd: preserveExistingSubscription ? existingUser!.cancelAtPeriodEnd : false,
            ...(referredById ? { referredById } : {}),
            ...(session.metadata?.retailValuationLimit === "1"
              ? { retailValuationEnabled: true, retailValuationCredits: { increment: 1 } }
              : {}),
          },
        });
        return createdPayment;
      });

      // Generate and send invoice
      try {
        const invoice = await invoiceService.createInvoice(payment.id);
        await invoiceService.sendInvoiceEmail(invoice.id);
        console.log(`✅ Invoice ${invoice.invoiceNumber} generated and sent for payment ${payment.id}`);
      } catch (invoiceError) {
        console.error("Failed to generate/send invoice:", invoiceError);
        // Don't fail the webhook for invoice errors
      }

      // Notify the referring professional if the user was referred
      try {
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { referredById: true, email: true, firstName: true, lastName: true },
        });

        if (updatedUser && updatedUser.referredById) {
          const professional = await prisma.user.findUnique({
            where: { id: updatedUser.referredById },
            select: { email: true, firstName: true, lastName: true },
          });

          if (professional) {
            const professionalName = `${professional.firstName || ""} ${professional.lastName || ""}`.trim() || "Professional Partner";
            const clientName = `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim() || "Client";

            await emailService.sendReferralNotificationToProfessional(
              professional.email,
              professionalName,
              updatedUser.email,
              clientName
            );
            console.log(`[WEBHOOK] Sent referral notification email to professional ${professional.email} for client ${updatedUser.email}`);
          }
        }
      } catch (referralEmailError) {
        console.error("[WEBHOOK] Failed to send referral notification email:", referralEmailError);
      }

      return {
        success: true,
        eventType: event.type,
        message: "Checkout session completed successfully",
      };
    } catch (error) {
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
  private static async handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;

    // Skip if this is not a subscription invoice
    const subscriptionId = (invoice as any).subscription;
    if (!subscriptionId) {
      return {
        success: true,
        eventType: event.type,
        message: "Not a subscription invoice, skipping",
      };
    }

    const stripeSubscriptionId = subscriptionId as string;
    const stripeCustomerId = invoice.customer as string;

    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
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
      const subscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
      const periodEnd = (subscription as any).current_period_end;
      const currentPeriodEnd = new Date(periodEnd * 1000);

      // Update user subscription period end date (Requirement 3.3)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: SubscriptionStatusValues.ACTIVE,
          currentPeriodEnd: currentPeriodEnd,
          stripeSubscriptionId: stripeSubscriptionId,
        },
      });

      // Create payment record for renewal (Requirement 3.3)
      // Only create if this is a renewal (not the first payment)
      const existingPayments = await prisma.payment.count({
        where: { userId: user.id },
      });

      if (existingPayments > 0 || invoice.billing_reason === "subscription_cycle") {
        const payment = await prisma.payment.create({
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
          const invoiceRecord = await invoiceService.createInvoice(payment.id);
          await invoiceService.sendInvoiceEmail(invoiceRecord.id);
          console.log(`✅ Renewal invoice ${invoiceRecord.invoiceNumber} generated and sent for payment ${payment.id}`);
        } catch (invoiceError) {
          console.error("Failed to generate/send renewal invoice:", invoiceError);
          // Don't fail the webhook for invoice errors
        }
      }

      return {
        success: true,
        eventType: event.type,
        message: "Invoice payment succeeded processed",
      };
    } catch (error) {
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
  private static async handleInvoicePaymentFailed(event: Stripe.Event): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;

    // Skip if this is not a subscription invoice
    const subscriptionId = (invoice as any).subscription;
    if (!subscriptionId) {
      return {
        success: true,
        eventType: event.type,
        message: "Not a subscription invoice, skipping",
      };
    }

    const stripeCustomerId = invoice.customer as string;

    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
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
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: SubscriptionStatusValues.PAST_DUE,
        },
      });

      // Create failed payment record
      const payment = await prisma.payment.create({
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
        const invoiceRecord = await invoiceService.createInvoice(payment.id);
        await invoiceService.sendInvoiceEmail(invoiceRecord.id);
        console.log(`✅ Failed payment invoice ${invoiceRecord.invoiceNumber} sent for payment ${payment.id}`);
      } catch (invoiceError) {
        console.error("Failed to generate/send failed payment invoice:", invoiceError);
      }

      return {
        success: true,
        eventType: event.type,
        message: "Invoice payment failed processed",
      };
    } catch (error) {
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
  private static async handleSubscriptionDeleted(event: Stripe.Event): Promise<WebhookResult> {
    const subscription = event.data.object as Stripe.Subscription;
    const stripeCustomerId = subscription.customer as string;

    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
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
      await prisma.user.update({
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
    } catch (error) {
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
  private static async handleSubscriptionUpdated(event: Stripe.Event): Promise<WebhookResult> {
    const subscription = event.data.object as Stripe.Subscription;
    const stripeCustomerId = subscription.customer as string;

    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
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
      let subscriptionStatus: SubscriptionStatusType;
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
      const periodEnd = (subscription as any).current_period_end;
      await prisma.user.update({
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
    } catch (error) {
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
  static isEventProcessed(eventId: string): boolean {
    return processedEventIds.has(eventId);
  }

  /**
   * Clear processed events (for testing purposes)
   */
  static clearProcessedEvents(): void {
    processedEventIds.clear();
  }
}
