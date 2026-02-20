const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

// Subscription status types
export type SubscriptionStatusType = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";

// Payment status types
export type PaymentStatusType = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

// Billing period types
export type BillingPeriod = "MONTHLY" | "YEARLY" | "ONE_TIME";

/**
 * Subscription plan interface
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  features: string[];
  active: boolean;
}

/**
 * Payment record interface
 * Requirements: 5.1, 5.3
 */
export interface Payment {
  id: string;
  userId: string;
  planId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  stripePaymentId: string | null;
  stripeInvoiceId: string | null;
  description: string | null;
  createdAt: string;
  plan: SubscriptionPlan | null;
}

/**
 * Checkout session request
 * Requirements: 2.1
 */
export interface CreateCheckoutRequest {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Checkout session response
 * Requirements: 2.5
 */
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Subscription status response
 * Requirements: 4.1, 4.5
 */
export interface SubscriptionStatus {
  status: SubscriptionStatusType;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Helper function to format price from cents to display string
 */
export function formatPaymentAmount(cents: number, currency: string = "usd"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(dollars);
}

/**
 * Helper function to format date for display
 */
export function formatPaymentDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Payment with user details for admin views
 * Requirements: 7.1
 */
export interface PaymentWithUser extends Payment {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

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

/**
 * Paginated payments response
 * Requirements: 7.1, 7.2
 */
export interface PaginatedPaymentsResponse {
  payments: PaymentWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parameters for listing payments with filtering
 * Requirements: 7.2
 */
export interface ListPaymentsParams {
  status?: PaymentStatusType;
  planId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Payment API Service
 * Handles all client-side payment API interactions
 * Requirements: 2.1, 5.2, 6.1, 7.1, 7.2
 */
export class PaymentsApi {
  /**
   * Create a checkout session for a subscription plan
   * Requirements: 2.1
   */
  static async createCheckout(request: CreateCheckoutRequest): Promise<CheckoutSessionResponse> {
    const response = await fetch(`${BASE_URL}/payments/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(request),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to create checkout session");
    }
    return data.data;
  }

  /**
   * Get payment history for the authenticated user
   * Requirements: 5.2
   */
  static async getPaymentHistory(): Promise<Payment[]> {
    const response = await fetch(`${BASE_URL}/payments/history`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch payment history");
    }
    return data.data;
  }

  /**
   * Get subscription status for the authenticated user
   * Requirements: 4.5
   */
  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await fetch(`${BASE_URL}/payments/subscription`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch subscription status");
    }
    return data.data;
  }

  /**
   * Cancel subscription for the authenticated user
   * Requirements: 6.1
   */
  static async cancelSubscription(): Promise<void> {
    const response = await fetch(`${BASE_URL}/payments/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to cancel subscription");
    }
  }

  // ============================================
  // Admin API Methods
  // ============================================

  /**
   * Get all payments with filtering (admin only)
   * Requirements: 7.1, 7.2
   */
  static async getAllPayments(params: ListPaymentsParams = {}): Promise<PaginatedPaymentsResponse> {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.planId) queryParams.append("planId", params.planId);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${BASE_URL}/admin/payments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch payments");
    }
    return {
      payments: data.data,
      pagination: data.pagination,
    };
  }

  /**
   * Get payment statistics (admin only)
   * Requirements: 7.1
   */
  static async getPaymentStats(): Promise<PaymentStats> {
    const response = await fetch(`${BASE_URL}/admin/payments/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch payment statistics");
    }
    return data.data;
  }

  /**
   * Grant subscription access to a user (admin only)
   * Requirements: 7.4
   */
  static async grantSubscription(userId: string, planId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/grant-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ planId }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to grant subscription");
    }
  }

  /**
   * Revoke subscription access from a user (admin only)
   * Requirements: 7.4
   */
  static async revokeSubscription(userId: string, reason?: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/revoke-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to revoke subscription");
    }
  }
}
