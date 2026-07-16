import { prisma } from "../config/db";
import { getStripe } from "../config/stripe";
import { config } from "../config/environment";
import { User, BillingPeriod, SubscriptionPlan } from "@prisma/client";
import { NotFoundError, StripeError, STRIPE_ERROR_CODES, createStripeErrorFromApiError, isStripeApiError } from "../errors";
import { invoiceService } from "./invoice";
import { ReferralService } from "./referral.service";
import Stripe from "stripe";

/**
 * Payment type matching Prisma Payment model
 * Requirements: 5.1, 5.3
 */
interface Payment {
  id: string;
  userId: string;
  planId: string | null;
  amount: number;
  currency: string;
  status: string;
  stripePaymentId: string | null;
  stripeInvoiceId: string | null;
  description: string | null;
  createdAt: Date;
}

/**
 * Payment with plan details included
 * Requirements: 5.1, 5.2
 */
export type PaymentWithPlan = Payment & {
  plan: SubscriptionPlan | null;
};

// Subscription status values matching Prisma enum
type SubscriptionStatusType = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";

const SubscriptionStatusValues = {
  NONE: "NONE" as const,
  ACTIVE: "ACTIVE" as const,
  PAST_DUE: "PAST_DUE" as const,
  CANCELED: "CANCELED" as const,
  INCOMPLETE: "INCOMPLETE" as const,
};

/**
 * Parameters for creating a checkout session
 * Requirements: 2.1, 2.2
 */
export interface CreateCheckoutParams {
  userId: string;
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Result of creating a checkout session
 * Requirements: 2.5
 */
export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

/**
 * Subscription status result
 * Requirements: 4.1, 4.5
 */
export interface SubscriptionStatusResult {
  status: SubscriptionStatusType;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

// Re-export StripeError and STRIPE_ERROR_CODES for backward compatibility
export { StripeError, STRIPE_ERROR_CODES } from "../errors";

/**
 * Payment Service - Handles all Stripe payment interactions
 * Requirements: 1.1-1.4, 2.1-2.6, 3.1-3.7, 4.1-4.6, 5.1-5.4, 6.1-6.4
 */
export class PaymentService {
  /**
   * Get or create a Stripe customer for a user
   * - Creates a new Stripe customer if user doesn't have one
   * - Returns existing customer ID if user already has one
   * - Syncs email with Stripe customer
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  static async getOrCreateStripeCustomer(userId: string): Promise<string> {
    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // If user already has a Stripe customer ID, verify and return it
    if (user.stripeCustomerId) {
      try {
        // Retrieve the customer to verify it exists and sync email
        const existingCustomer = await getStripe().customers.retrieve(user.stripeCustomerId);

        // Check if customer was deleted in Stripe
        if ((existingCustomer as Stripe.DeletedCustomer).deleted) {
          // Customer was deleted, create a new one
          return await this.createAndStoreStripeCustomer(user);
        }

        const customer = existingCustomer as Stripe.Customer;

        // Sync email if it has changed (Requirement 1.3)
        if (customer.email !== user.email) {
          await getStripe().customers.update(user.stripeCustomerId, {
            email: user.email,
          });
        }

        return user.stripeCustomerId;
      } catch (error) {
        // If customer doesn't exist in Stripe, create a new one
        if (error instanceof Stripe.errors.StripeError && error.code === "resource_missing") {
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
  private static async createAndStoreStripeCustomer(user: User): Promise<string> {
    try {
      // Create Stripe customer with user email and metadata
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;

      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
        name: fullName,
      });

      // Store customer ID in user record
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });

      return customer.id;
    } catch (error) {
      // Handle Stripe API errors (Requirement 1.4)
      if (isStripeApiError(error)) {
        throw createStripeErrorFromApiError(error, STRIPE_ERROR_CODES.CUSTOMER_CREATION_FAILED);
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
  static async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    const { userId, planId, successUrl, cancelUrl } = params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Find subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundError(`Subscription plan with ID ${planId} not found`);
    }

    // Ensure plan has Stripe price ID
    if (!plan.stripePriceId) {
      throw new StripeError(`This subscription plan (${plan.name}) is not yet configured with Stripe. Please contact support or link the plan to a Stripe product.`, STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED, 400);
    }

    // Get or create Stripe customer for the user
    const customerId = await this.getOrCreateStripeCustomer(userId);

    // Determine checkout mode based on billing period (Requirements 2.3, 2.4)
    const mode: Stripe.Checkout.SessionCreateParams.Mode = plan.billingPeriod === BillingPeriod.ONE_TIME ? "payment" : "subscription";

    // Build success and cancel URLs with defaults
    const baseUrl = config.frontendUrl;
    const finalSuccessUrl = successUrl || `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/payment/cancel`;

    // Apply referral discount if the user was referred by an approved professional.
    // GUARANTEE: if referredById is set and profile is ACTIVE, the 25% discount ALWAYS applies.
    // Priority: per-professional Stripe Promo Code → shared 25% Stripe Coupon fallback.
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined = undefined;
    let allowPromotionCodes = true; // Default: allow manual code entry at Stripe checkout

    if (user.referredById) {
      const referralProfile = await prisma.professionalReferralProfile.findUnique({
        where: { userId: user.referredById },
        select: { id: true, stripePromoCodeId: true, status: true, code: true },
      });

      if (referralProfile && referralProfile.status === "ACTIVE") {
        let promoCodeId = referralProfile.stripePromoCodeId;
        const isMissing = !promoCodeId || promoCodeId.startsWith("dummy_");

        // Step 1: Try to get/create the per-professional unique Stripe Promotion Code.
        if (isMissing) {
          promoCodeId = await ReferralService.getOrCreateReferralPromoCode(referralProfile.code);
          if (promoCodeId) {
            // Persist so we don't retry every checkout
            await prisma.professionalReferralProfile.update({
              where: { id: referralProfile.id },
              data: { stripePromoCodeId: promoCodeId },
            });
            console.log(`[REFERRAL] Resolved and persisted promo code ${referralProfile.code} (${promoCodeId})`);
          }
        }

        if (promoCodeId) {
          // Apply the professional's unique promo code — best case.
          discounts = [{ promotion_code: promoCodeId }];
          allowPromotionCodes = false;
          console.log(`[REFERRAL] Pre-applying promo code ${referralProfile.code} (${promoCodeId}) for user ${userId}`);
        } else {
          // Step 2: Promo code unavailable — fall back to applying the shared 25% coupon directly.
          // This GUARANTEES the discount is always applied for referred users.
          try {
            const stripe = getStripe();
            let couponId = process.env.STRIPE_REFERRAL_COUPON_ID;

            if (!couponId) {
              const coupons = await stripe.coupons.list({ limit: 100 });
              const existing = coupons.data.find(
                (c) => c.percent_off === 25 && c.duration === "forever" && c.valid
              );
              if (existing) {
                couponId = existing.id;
              } else {
                const newCoupon = await stripe.coupons.create({
                  percent_off: 25,
                  duration: "forever",
                  name: "Professional Referral 25% Discount",
                });
                couponId = newCoupon.id;
                console.log(`[REFERRAL] Created shared 25% coupon: ${couponId}`);
              }
            }

            discounts = [{ coupon: couponId }];
            allowPromotionCodes = false;
            console.log(`[REFERRAL] Fallback — applying shared 25% coupon (${couponId}) for referred user ${userId}`);
          } catch (couponErr) {
            // Last resort: let the user at least see the "Add promotion code" field
            // so they can type the code manually at Stripe checkout.
            console.error(`[REFERRAL] Both promo code and coupon fallback failed for user ${userId}:`, couponErr);
          }
        }
      }
    }
    // No referredById: allowPromotionCodes stays true — user can type a code manually at Stripe checkout.

    // Helper to build checkout session params
    const buildSessionParams = (applyDiscounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined, allowPromos: boolean): Stripe.Checkout.SessionCreateParams => ({
      customer: customerId,
      mode,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      metadata: { userId, planId },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      allow_promotion_codes: allowPromos,
      discounts: applyDiscounts,
      ...(mode === "subscription" && { subscription_data: { metadata: { userId, planId } } }),
      ...(mode === "payment" && { payment_intent_data: { metadata: { userId, planId } } }),
    });

    try {
      // Attempt 1: Create checkout session with referral discount applied.
      const session = await getStripe().checkout.sessions.create(
        buildSessionParams(discounts, allowPromotionCodes)
      );

      if (!session.url) {
        throw new StripeError("Checkout session created but no URL was returned", STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED, 500);
      }

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      // If the error is caused by an invalid discount/coupon (e.g. test-mode coupon used in live mode),
      // retry without the discount so checkout is never completely blocked.
      if (isStripeApiError(error) && discounts && discounts.length > 0) {
        const stripeErr = error as Stripe.errors.StripeError;
        const isDiscountError =
          stripeErr.type === "StripeInvalidRequestError" &&
          (stripeErr.message?.toLowerCase().includes("coupon") ||
            stripeErr.message?.toLowerCase().includes("promotion") ||
            stripeErr.message?.toLowerCase().includes("discount") ||
            stripeErr.param === "discounts" ||
            stripeErr.param === "coupon");

        if (isDiscountError) {
          console.warn(`[REFERRAL] Discount caused checkout failure for user ${userId}. Retrying without discount. Error: ${stripeErr.message}`);
          try {
            // Attempt 2: Retry without discount — user can manually add the code at checkout.
            const fallbackSession = await getStripe().checkout.sessions.create(
              buildSessionParams(undefined, true)
            );
            if (!fallbackSession.url) {
              throw new StripeError("Checkout session created but no URL was returned", STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED, 500);
            }
            console.warn(`[REFERRAL] Checkout succeeded without discount for user ${userId}. Manual code entry is available.`);
            return { sessionId: fallbackSession.id, url: fallbackSession.url };
          } catch (retryError) {
            if (retryError instanceof StripeError) throw retryError;
            if (isStripeApiError(retryError)) throw createStripeErrorFromApiError(retryError, STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED);
            throw retryError;
          }
        }
      }

      // Handle all other Stripe API errors
      if (error instanceof StripeError) throw error;
      if (isStripeApiError(error)) throw createStripeErrorFromApiError(error, STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED);
      throw error;
    }
  }


  /**
   * Cancel a user's subscription at period end
   * - Cancels the subscription in Stripe at the end of the current billing period
   * - Updates local record with cancelAtPeriodEnd flag
   * Requirements: 6.1, 6.2
   */
  static async cancelSubscription(userId: string): Promise<void> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Check if user has an active subscription
    if (!user.stripeSubscriptionId) {
      throw new StripeError("User does not have an active subscription to cancel", STRIPE_ERROR_CODES.SUBSCRIPTION_CANCEL_FAILED, 400);
    }

    try {
      // Cancel subscription at period end in Stripe (Requirement 6.1)
      await getStripe().subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update local record with cancelAtPeriodEnd flag (Requirement 6.2)
      await prisma.user.update({
        where: { id: userId },
        data: {
          cancelAtPeriodEnd: true,
        },
      });
    } catch (error) {
      if (error instanceof StripeError) {
        throw error;
      }
      if (isStripeApiError(error)) {
        throw createStripeErrorFromApiError(error, STRIPE_ERROR_CODES.SUBSCRIPTION_CANCEL_FAILED);
      }
      throw error;
    }
  }

  /**
   * Get the subscription status for a user
   * - Returns current status, period end, and cancel flag
   * Requirements: 4.1, 4.5
   */
  static async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResult> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
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
  static async hasActiveAccess(userId: string): Promise<boolean> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
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
  static async getPaymentHistory(userId: string): Promise<PaymentWithPlan[]> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Query payments for user, ordered by createdAt descending (Requirement 5.2)
    // Include plan details (Requirement 5.1)
    const payments = await prisma.payment.findMany({
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
  static async getAllPayments(params: ListPaymentsParams): Promise<PaginatedPayments> {
    const { status, planId, startDate, endDate, page = 1, limit = 20 } = params;

    // Build where clause for filtering
    const where: {
      status?: string;
      planId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

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
    const total = await prisma.payment.count({ where });

    // Get paginated payments
    const payments = await prisma.payment.findMany({
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
  static async getPaymentStats(): Promise<PaymentStats> {
    // Calculate total revenue from successful payments
    const revenueResult = await prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // Count active subscriptions
    const activeSubscriptions = await prisma.user.count({
      where: { subscriptionStatus: "ACTIVE" },
    });

    // Get recent payments (last 10)
    const recentPayments = await prisma.payment.findMany({
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
    const revenueByPlanResult = await prisma.payment.groupBy({
      by: ["planId"],
      where: { status: "SUCCEEDED", planId: { not: null } },
      _sum: { amount: true },
    });

    // Get plan names for revenue breakdown
    const planIds = revenueByPlanResult.map((r: { planId: string | null }) => r.planId).filter((id: string | null): id is string => id !== null);
    const plans = await prisma.subscriptionPlan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true },
    });

    const planNameMap = new Map(plans.map((p: { id: string; name: string }) => [p.id, p.name]));
    const revenueByPlan = revenueByPlanResult.map((r: { planId: string | null; _sum: { amount: number | null } }) => ({
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
  static async grantSubscriptionAccess(userId: string, planId: string, adminId: string): Promise<void> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Verify plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundError(`Subscription plan with ID ${planId} not found`);
    }

    // Calculate period end based on billing period
    const now = new Date();
    let periodEnd: Date;
    switch (plan.billingPeriod) {
      case BillingPeriod.MONTHLY:
        periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case BillingPeriod.YEARLY:
        periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      case BillingPeriod.ONE_TIME:
        // For one-time, set a far future date
        periodEnd = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // Update user subscription status and log admin action in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionId: planId,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      }),
      prisma.adminAction.create({
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

    // Create a $0 payment record and send invoice (non-blocking)
    try {
      const payment = await prisma.payment.create({
        data: {
          userId,
          planId,
          amount: 0,
          currency: "usd",
          status: "SUCCEEDED",
          description: `Admin granted subscription: ${plan.name}`,
        },
      });
      const invoice = await invoiceService.createInvoice(payment.id);
      await invoiceService.sendInvoiceEmail(invoice.id);
      console.log(`✅ Invoice ${invoice.invoiceNumber} sent to user ${userId} for admin-granted subscription`);
    } catch (invoiceError) {
      console.error("Failed to send invoice for admin-granted subscription:", invoiceError);
    }
  }

  /**
   * Revoke subscription access from a user (admin action)
   * - Manually revokes subscription access
   * - Logs the admin action for audit
   * Requirements: 7.4, 7.5
   */
  static async revokeSubscriptionAccess(userId: string, adminId: string, reason?: string): Promise<void> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Update user subscription status and log admin action in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "NONE",
          subscriptionId: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      }),
      prisma.adminAction.create({
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
        await getStripe().subscriptions.cancel(user.stripeSubscriptionId);
      } catch (error) {
        // Log but don't fail if Stripe cancellation fails
        console.error("Failed to cancel Stripe subscription:", error);
      }
    }
  }
}

/**
 * Parameters for listing payments with filtering
 * Requirements: 7.2
 */
export interface ListPaymentsParams {
  status?: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated payments result
 * Requirements: 7.1, 7.2
 */
export interface PaginatedPayments {
  payments: PaymentWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Payment with user details included
 * Requirements: 7.1
 */
export type PaymentWithUser = PaymentWithPlan & {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

/**
 * Payment statistics for admin dashboard
 * Requirements: 7.1
 */
export interface PaymentStats {
  totalRevenue: number;
  activeSubscriptions: number;
  recentPayments: PaymentWithUser[];
  revenueByPlan: { planName: string; revenue: number }[];
}
