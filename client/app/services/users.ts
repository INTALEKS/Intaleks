const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

// User Types
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type SubscriptionStatus = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
  active: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
  subscription?: SubscriptionPlan | null;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  subscriptionPlanId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersThisPeriod: number;
  usersBySubscription: Record<string, number>;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: UserRole;
}

export class UsersApi {
  static async getUsers(filters?: UserFilters): Promise<PaginatedUsers> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.subscriptionPlanId) params.append("subscriptionPlanId", filters.subscriptionPlanId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await fetch(`${BASE_URL}/admin/users?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch users");
    }
    return data.data;
  }

  static async getUserById(id: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch user");
    }
    return data.data;
  }

  static async createUser(input: CreateUserInput): Promise<User> {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to create user");
    }
    return data.data;
  }

  static async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to update user");
    }
    return data.data;
  }

  static async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to delete user");
    }
  }

  static async suspendUser(id: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/admin/users/${id}/suspend`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to suspend user");
    }
    return data.data;
  }

  static async reactivateUser(id: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/admin/users/${id}/reactivate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to reactivate user");
    }
    return data.data;
  }

  static async resetPassword(id: string): Promise<{ user: User; temporaryPassword: string }> {
    const response = await fetch(`${BASE_URL}/admin/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to reset password");
    }
    return data.data;
  }

  static async assignSubscription(userId: string, planId: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ planId }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to assign subscription");
    }
    return data.data;
  }

  static async getStats(startDate?: string, endDate?: string): Promise<UserStats> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await fetch(`${BASE_URL}/admin/users/stats?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch user stats");
    }
    return data.data;
  }

  static async changeRole(userId: string, role: UserRole): Promise<User> {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to change user role");
    }
    return data.data;
  }
}
