"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const errors_1 = require("../errors");
/**
 * Generate a random uppercase alphanumeric coupon code
 */
function generateCode() {
    return crypto_1.default.randomBytes(5).toString("hex").toUpperCase();
}
class CouponService {
    /**
     * Create one or more coupon codes (Super Admin only)
     */
    static async create(options) {
        const { code, expiresAt, count = 1, createdBy } = options;
        if (code && count > 1) {
            throw new errors_1.ValidationError("Cannot specify a custom code when generating multiple coupons");
        }
        if (code) {
            const existing = await db_1.prisma.couponCode.findUnique({ where: { code } });
            if (existing) {
                throw new errors_1.ConflictError(`Coupon code "${code}" already exists`);
            }
            const created = await db_1.prisma.couponCode.create({
                data: { code, expiresAt: expiresAt ?? null, createdBy },
            });
            return [created];
        }
        // Bulk generate unique codes
        const codes = [];
        while (codes.length < count) {
            const candidate = generateCode();
            // eslint-disable-next-line no-await-in-loop
            const exists = await db_1.prisma.couponCode.findUnique({ where: { code: candidate } });
            if (!exists)
                codes.push(candidate);
        }
        const created = await db_1.prisma.couponCode.createManyAndReturn({
            data: codes.map((c) => ({ code: c, expiresAt: expiresAt ?? null, createdBy })),
        });
        return created;
    }
    /**
     * Redeem a coupon code for a user — grants coupon access on the user record
     */
    static async redeem(userId, rawCode) {
        const code = rawCode.trim().toUpperCase();
        const coupon = await db_1.prisma.couponCode.findUnique({ where: { code } });
        if (!coupon) {
            throw new errors_1.NotFoundError("Invalid coupon code");
        }
        if (coupon.usedBy) {
            throw new errors_1.ValidationError("This coupon code has already been used");
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            throw new errors_1.ValidationError("This coupon code has expired");
        }
        // Check user doesn't already have access
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionStatus: true, couponAccess: true },
        });
        if (!user) {
            throw new errors_1.NotFoundError("User not found");
        }
        if (user.subscriptionStatus === "ACTIVE") {
            throw new errors_1.ValidationError("You already have an active subscription");
        }
        if (user.couponAccess) {
            throw new errors_1.ValidationError("You already have coupon access");
        }
        // Mark coupon as used and grant access atomically
        await db_1.prisma.$transaction([
            db_1.prisma.couponCode.update({
                where: { code },
                data: { usedBy: userId, usedAt: new Date() },
            }),
            db_1.prisma.user.update({
                where: { id: userId },
                data: { couponAccess: true },
            }),
        ]);
    }
    /**
     * List all coupon codes with optional filtering
     */
    static async findAll(filter) {
        const where = {};
        if (filter?.used === true)
            where.usedBy = { not: null };
        if (filter?.used === false)
            where.usedBy = null;
        return db_1.prisma.couponCode.findMany({
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
    static async delete(id) {
        const coupon = await db_1.prisma.couponCode.findUnique({ where: { id } });
        if (!coupon) {
            throw new errors_1.NotFoundError("Coupon code not found");
        }
        if (coupon.usedBy) {
            throw new errors_1.ValidationError("Cannot delete a coupon that has already been redeemed");
        }
        await db_1.prisma.couponCode.delete({ where: { id } });
    }
    /**
     * Revoke coupon access from a user (admin action)
     */
    static async revokeAccess(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { couponAccess: true },
        });
        if (!user)
            throw new errors_1.NotFoundError("User not found");
        if (!user.couponAccess)
            throw new errors_1.ValidationError("User does not have coupon access");
        await db_1.prisma.user.update({
            where: { id: userId },
            data: { couponAccess: false },
        });
    }
}
exports.CouponService = CouponService;
