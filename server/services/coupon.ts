import crypto from "crypto";
import { prisma } from "../config/db";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { CouponCode } from "@prisma/client";

export interface CreateCouponOptions {
  code?: string;
  expiresAt?: Date;
  count?: number;
  createdBy: string;
}

export interface CouponWithUser extends CouponCode {
  user: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
}

/**
 * Generate a random uppercase alphanumeric coupon code
 */
function generateCode(): string {
  return crypto.randomBytes(5).toString("hex").toUpperCase();
}

export class CouponService {
  /**
   * Create one or more coupon codes (Super Admin only)
   */
  static async create(options: CreateCouponOptions): Promise<CouponCode[]> {
    const { code, expiresAt, count = 1, createdBy } = options;

    if (code && count > 1) {
      throw new ValidationError("Cannot specify a custom code when generating multiple coupons");
    }

    if (code) {
      const existing = await prisma.couponCode.findUnique({ where: { code } });
      if (existing) {
        throw new ConflictError(`Coupon code "${code}" already exists`);
      }

      const created = await prisma.couponCode.create({
        data: { code, expiresAt: expiresAt ?? null, createdBy },
      });
      return [created];
    }

    // Bulk generate unique codes
    const codes: string[] = [];
    while (codes.length < count) {
      const candidate = generateCode();
      // eslint-disable-next-line no-await-in-loop
      const exists = await prisma.couponCode.findUnique({ where: { code: candidate } });
      if (!exists) codes.push(candidate);
    }

    const created = await prisma.couponCode.createManyAndReturn({
      data: codes.map((c) => ({ code: c, expiresAt: expiresAt ?? null, createdBy })),
    });

    return created;
  }

  /**
   * Redeem a coupon code for a user — grants coupon access on the user record
   */
  static async redeem(userId: string, rawCode: string): Promise<void> {
    const code = rawCode.trim().toUpperCase();

    const coupon = await prisma.couponCode.findUnique({ where: { code } });

    if (!coupon) {
      throw new NotFoundError("Invalid coupon code");
    }

    if (coupon.usedBy) {
      throw new ValidationError("This coupon code has already been used");
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new ValidationError("This coupon code has expired");
    }

    // Check user doesn't already have access
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, couponAccess: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.subscriptionStatus === "ACTIVE") {
      throw new ValidationError("You already have an active subscription");
    }

    if (user.couponAccess) {
      throw new ValidationError("You already have coupon access");
    }

    // Mark coupon as used and grant access atomically
    await prisma.$transaction([
      prisma.couponCode.update({
        where: { code },
        data: { usedBy: userId, usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { couponAccess: true },
      }),
    ]);
  }

  /**
   * List all coupon codes with optional filtering
   */
  static async findAll(filter?: { used?: boolean }): Promise<CouponWithUser[]> {
    const where: Record<string, unknown> = {};

    if (filter?.used === true) where.usedBy = { not: null };
    if (filter?.used === false) where.usedBy = null;

    return prisma.couponCode.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Delete a coupon code (only if unused)
   */
  static async delete(id: string): Promise<void> {
    const coupon = await prisma.couponCode.findUnique({ where: { id } });

    if (!coupon) {
      throw new NotFoundError("Coupon code not found");
    }

    if (coupon.usedBy) {
      throw new ValidationError("Cannot delete a coupon that has already been redeemed");
    }

    await prisma.couponCode.delete({ where: { id } });
  }

  /**
   * Revoke coupon access from a user (admin action)
   */
  static async revokeAccess(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { couponAccess: true },
    });

    if (!user) throw new NotFoundError("User not found");
    if (!user.couponAccess) throw new ValidationError("User does not have coupon access");

    await prisma.user.update({
      where: { id: userId },
      data: { couponAccess: false },
    });
  }
}
