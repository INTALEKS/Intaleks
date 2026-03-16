import { ApiClient } from "./api";

const BASE_URL = ApiClient.BASE_URL;

export interface CouponCode {
  id: string;
  code: string;
  usedBy: string | null;
  usedAt: string | null;
  expiresAt: string | null;
  createdBy: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
}

export interface CreateCouponInput {
  code?: string;
  expiresAt?: string;
  count?: number;
}

export const CouponsApi = {
  async redeem(code: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/coupons/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to redeem coupon");
    return data;
  },

  async list(used?: boolean): Promise<CouponCode[]> {
    const params = used !== undefined ? `?used=${used}` : "";
    const res = await fetch(`${BASE_URL}/admin/coupons${params}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to fetch coupons");
    return data.data;
  },

  async create(input: CreateCouponInput): Promise<CouponCode[]> {
    const res = await fetch(`${BASE_URL}/admin/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to create coupon");
    return data.data;
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/admin/coupons/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to delete coupon");
  },

  async revokeAccess(userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/admin/coupons/users/${userId}/revoke-coupon`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to revoke coupon access");
  },
};
