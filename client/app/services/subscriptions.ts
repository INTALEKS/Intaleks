const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

// Billing period options
export type BillingPeriod = "MONTHLY" | "YEARLY" | "ONE_TIME";

// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // Price in cents
  billingPeriod: BillingPeriod;
  features: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface CreateSubscriptionPlanInput {
  name: string;
  price: number; // Price in cents
  billingPeriod?: BillingPeriod;
  features: string[];
  active?: boolean;
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  price?: number; // Price in cents
  billingPeriod?: BillingPeriod;
  features?: string[];
  active?: boolean;
}

// Helper function to format price from cents to display string
export function formatPrice(cents: number, billingPeriod?: BillingPeriod): string {
  const dollars = cents / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);

  if (!billingPeriod || billingPeriod === "ONE_TIME") {
    return formatted;
  }

  const periodLabel = billingPeriod === "MONTHLY" ? "/mo" : "/yr";
  return `${formatted}${periodLabel}`;
}

// Helper to convert dollars to cents
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

// Helper to convert cents to dollars
export function centsToDollars(cents: number): number {
  return cents / 100;
}

export class SubscriptionsApi {
  // Public endpoint - Get active subscription plans (for settings page, pricing page, etc.)
  static async getActivePlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${BASE_URL}/subscriptions/plans`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch subscription plans");
    }
    return data.data;
  }

  // Admin endpoint - Get all subscription plans (for admin panel)
  static async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${BASE_URL}/admin/subscriptions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch subscription plans");
    }
    return data.data;
  }

  static async getPlanById(id: string): Promise<SubscriptionPlan> {
    const response = await fetch(`${BASE_URL}/admin/subscriptions/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch subscription plan");
    }
    return data.data;
  }

  static async createPlan(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    const response = await fetch(`${BASE_URL}/admin/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to create subscription plan");
    }
    return data.data;
  }

  static async updatePlan(id: string, input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    const response = await fetch(`${BASE_URL}/admin/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to update subscription plan");
    }
    return data.data;
  }

  static async deletePlan(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/subscriptions/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to delete subscription plan");
    }
  }

  static async activatePlan(id: string): Promise<SubscriptionPlan> {
    const response = await fetch(`${BASE_URL}/admin/subscriptions/${id}/activate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to activate subscription plan");
    }
    return data.data;
  }

  static async deactivatePlan(id: string): Promise<SubscriptionPlan> {
    const response = await fetch(`${BASE_URL}/admin/subscriptions/${id}/deactivate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to deactivate subscription plan");
    }
    return data.data;
  }
}
