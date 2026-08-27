export interface loginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Keep for backward compatibility
  referralCode?: string;
}

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type SubscriptionStatus = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INCOMPLETE";
export type BillingPeriod = "MONTHLY" | "YEARLY" | "ONE_TIME";

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null; // Keep for backward compatibility
  role: UserRole;
  avatar?: string | null;
  subscriptionStatus?: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  couponAccess?: boolean;
  couponUsed?: boolean;
  termsAccepted?: boolean;
  termsAcceptedAt?: string | null;
  subscription?: {
    id: string;
    name: string;
    price: number;
    billingPeriod: BillingPeriod;
    features: string[];
  } | null;
  affiliateProfile?: {
    id: string;
    status: string;
    code?: string | null;
    company?: string | null;
  } | null;
  referredById?: string | null;
  professionalReferralProfile?: {
    id: string;
    code: string;
    status: string;
  } | null;
  professionalReferralApplication?: {
    id: string;
    status: string;
    feedback?: string | null;
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
  static async register(email: string, password: string, firstName?: string, lastName?: string, referralCode?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, firstName, lastName, referralCode }),
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
  static async updateProfile(firstName: string, lastName: string, avatar?: string): Promise<{ success: boolean; data: User }> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ firstName, lastName, avatar }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to update profile");
      }

      return { success: data.success, data: data.user };
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

  /**
   * Get user invoices
   */
  static async getInvoices(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await fetch(`${this.BASE_URL}/invoices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch invoices");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get specific invoice
   */
  static async getInvoice(invoiceId: string): Promise<{ success: boolean; data: any }> {
    try {
      const response = await fetch(`${this.BASE_URL}/invoices/${invoiceId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch invoice");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Resend invoice email
   */
  static async resendInvoiceEmail(invoiceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/invoices/${invoiceId}/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to resend invoice email");
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Submit application to join the professional referral program
   */
  static async applyForProfessionalReferral(data: { professionalType: string; companyName: string; website?: string }) {
    try {
      const response = await fetch(`${this.BASE_URL}/users/referral/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.message || "Failed to submit referral application");
      }
      return resData;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get professional referral profile and application status
   */
  static async getProfessionalReferralProfile() {
    try {
      const response = await fetch(`${this.BASE_URL}/users/referral/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.message || "Failed to retrieve referral profile");
      }
      return resData;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get referred clients list with their data
   */
  static async getReferredClients() {
    try {
      const response = await fetch(`${this.BASE_URL}/users/referral/clients`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.message || "Failed to retrieve referred clients");
      }
      return resData;
    } catch (err) {
      throw err;
    }
  }

  static async getPartnerFirmDashboard() {
    const response = await fetch(`${this.BASE_URL}/users/referral/firm`, { credentials: "include" });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data?.message || "Failed to retrieve firm dashboard");
    return data;
  }

  static async addPartnerFirmMember(email: string) {
    const response = await fetch(`${this.BASE_URL}/users/referral/firm/members`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data?.message || "Failed to add firm member");
    return data;
  }

  static async removePartnerFirmMember(memberId: string) {
    const response = await fetch(`${this.BASE_URL}/users/referral/firm/members/${memberId}`, {
      method: "DELETE", credentials: "include",
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data?.message || "Failed to remove firm member");
    return data;
  }

  static async createPartnerCheckout(planType: "PARTNER" | "PARTNER_UNLIMITED", successUrl: string, cancelUrl: string) {
    const response = await fetch(`${this.BASE_URL}/users/referral/firm/checkout`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ planType, successUrl, cancelUrl }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data?.message || "Unable to start Partner checkout");
    return data;
  }

  static async acceptPartnerInvitation(token: string) {
    const response = await fetch(`${this.BASE_URL}/users/referral/firm/invitations/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ token }) });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data?.message || "Unable to accept invitation");
    return data;
  }

  /**
   * Get referral applications list (Admin only)
   */
  static async getReferralApplicationsAdmin(status?: string) {
    try {
      const url = status 
        ? `${this.BASE_URL}/admin/referrals/applications?status=${status}`
        : `${this.BASE_URL}/admin/referrals/applications`;
        
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.message || "Failed to retrieve referral applications");
      }
      return resData;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Approve or decline a referral application (Admin only)
   */
  static async updateReferralApplicationAdmin(id: string, status: string, feedback?: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/admin/referrals/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status, feedback }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.message || "Failed to update referral application");
      }
      return resData;
    } catch (err) {
      throw err;
    }
  }

}
