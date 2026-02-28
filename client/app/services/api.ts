export interface loginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type SubscriptionStatus = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INCOMPLETE";
export type BillingPeriod = "MONTHLY" | "YEARLY" | "ONE_TIME";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar?: string | null;
  subscriptionStatus?: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  termsAccepted?: boolean;
  termsAcceptedAt?: string | null;
  subscription?: {
    id: string;
    name: string;
    price: number;
    billingPeriod: BillingPeriod;
    features: string[];
  } | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in cents
  billingPeriod: BillingPeriod;
  features: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface PlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
}

export class ApiClient {
  static BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

  /**
   * Admin login
   */
  static async loginAdmin(authData: loginData) {
    try {
      const response = await fetch(`${this.BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(authData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Login failed");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * User registration
   */
  static async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Registration failed");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * User login
   * Requirements: 2.1
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Login failed");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * User logout
   * Requirements: 4.1
   */
  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Logout failed");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get current user profile
   * Requirements: 3.4
   */
  static async getProfile(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to get user profile");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get user profile (alias for backward compatibility)
   */
  static async getUserProfile() {
    return this.getProfile();
  }

  /**
   * Get all active subscription plans (public endpoint)
   * Requirements: 5.1
   */
  static async getPublicPlans(): Promise<PlansResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/subscriptions/plans`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch subscription plans");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Submit a contact message
   */
  static async submitContact(name: string, email: string, message: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to send message");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(name: string, avatar?: string): Promise<{ success: boolean; data: User }> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, avatar }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to update profile");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to update password");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Upload avatar image
   */
  static async uploadAvatar(file: File): Promise<{ success: boolean; data: { url: string } }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.BASE_URL}/users/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to upload avatar");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create checkout session for subscription
   */
  static async createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<{ success: boolean; data: { url: string } }> {
    try {
      const response = await fetch(`${this.BASE_URL}/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ planId, successUrl, cancelUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error?.message || data?.message || "Failed to create checkout session");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/payments/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error?.message || data?.message || "Failed to cancel subscription");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Accept terms and conditions
   */
  static async acceptTerms(): Promise<{ success: boolean; message: string; data: { termsAccepted: boolean; termsAcceptedAt: string } }> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/accept-terms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to accept terms");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }
}
