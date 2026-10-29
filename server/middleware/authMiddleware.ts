import { Request, Response, NextFunction } from "express";
import { CookieUtils } from "../utils/cookieUtils";
import { AuthService } from "../services/auth";
import { prisma } from "../config/db";
import { PartnerService } from "../services/partner.service";
import { UserRole, SubscriptionStatus } from "@prisma/client";
import { hasUnexpiredSubscription } from "../utils/subscriptionAccess";

// Define user type without password
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  couponAccess: boolean;
  couponUsed: boolean;
  retailValuationEnabled: boolean;
  retailValuationCredits: number;
  retailValuationDocumentId: string | null;
  termsAccepted: boolean;
  termsAcceptedAt: Date | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    let token = CookieUtils.getAuthToken(req);

    if (!token) {
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    }

    if (!token) {
      res.status(401).json({ error: "Access denied", message: "No token provided" });
      return;
    }

    // Verify token and get user
    const Payload = AuthService.verifyToken(token);

    if (!Payload) {
      res.status(401).json({
        error: "Access denied",
        message: "Invalid or expired token",
      });
      return;
    }

    const { email, role, userId } = Payload;

    const user = await prisma.user.findUnique({
      where: { id: userId, email, role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        couponAccess: true,
        couponUsed: true,
        retailValuationEnabled: true,
        retailValuationCredits: true,
        retailValuationDocumentId: true,
        emailVerified: true,
        termsAccepted: true,
        termsAcceptedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Access denied", message: "User not found" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Authentication failed",
    });
  }
};

/**
 * Middleware to check if user has required role or higher
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
      return;
    }

    const { hasRole } = require("../utils/roleHierarchy");

    if (!hasRole(req.user.role, requiredRole)) {
      res.status(403).json({
        error: "Forbidden",
        message: `This action requires ${requiredRole} role or higher`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin or higher
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

/**
 * Middleware to check if user has verified their email
 * Use this on routes that require email verification
 */
export const requireEmailVerified = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  // Admin users bypass email verification requirement
  if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  if (!req.user.emailVerified) {
    res.status(403).json({
      error: "Email verification required",
      message: "Please verify your email address to access this feature. Check your inbox for the verification link.",
      emailVerified: false,
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has an active subscription or valid coupon access
 * Use this on routes that require a paid subscription
 */
export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  // Admin users bypass subscription requirement
  if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  const now = new Date();
  const subscriptionIsMarkedActive = req.user.subscriptionStatus === SubscriptionStatus.ACTIVE;
  const hasSubscription = hasUnexpiredSubscription(req.user.subscriptionStatus, req.user.currentPeriodEnd, now);

  // Fail closed when an active entitlement has no expiry. All supported paid
  // plans have a bounded access period; a missing date must not grant forever.
  if (subscriptionIsMarkedActive && !hasSubscription) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { subscriptionStatus: SubscriptionStatus.CANCELED, currentPeriodEnd: null, cancelAtPeriodEnd: false },
    });
  }
  const partnerFirm = await PartnerService.getActiveFirmForUser(req.user.id);
  const hasPartnerAccess = Boolean(partnerFirm);
  const hasCouponAccess = req.user.couponAccess === true;
  const couponAlreadyUsed = req.user.couponUsed === true;
  const hasRetailValuationAccess = req.user.retailValuationEnabled &&
    (req.user.retailValuationCredits > 0 || Boolean(req.user.retailValuationDocumentId));

  if (!hasSubscription && !hasCouponAccess && !hasPartnerAccess && !hasRetailValuationAccess) {
    res.status(403).json({
      error: "Active subscription required",
      message: "A paid valuation, active subscription, or unused coupon is required to continue.",
      subscriptionStatus: req.user.subscriptionStatus,
    });
    return;
  }

  // Coupon users get exactly one use — block if already consumed
  if (!hasSubscription && !hasPartnerAccess && !hasRetailValuationAccess && hasCouponAccess && couponAlreadyUsed) {
    res.status(403).json({
      error: "Coupon access expired",
      message: "Your one-time coupon access has already been used. Please subscribe to continue.",
      couponUsed: true,
    });
    return;
  }

  next();
};

/**
 * Require a paid subscription for saved valuation history. Coupon and partner
 * access can create reports, but do not grant ongoing access to report history.
 */
export const requirePaidSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  if (req.user.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
    res.status(403).json({
      error: "Active subscription required",
      message: "Saved valuation history is available to subscribers. Please subscribe to access your previous reports.",
      subscriptionStatus: req.user.subscriptionStatus,
    });
    return;
  }

  if (!hasUnexpiredSubscription(req.user.subscriptionStatus, req.user.currentPeriodEnd)) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { subscriptionStatus: SubscriptionStatus.CANCELED, currentPeriodEnd: null, cancelAtPeriodEnd: false },
    });
    res.status(403).json({
      error: "Access period expired",
      message: "Your Valuator access period has ended or is not configured. Renew to access your previous reports.",
    });
    return;
  }

  next();
};

/**
 * Allow active subscribers to browse their report history and retail buyers
 * to access only reports created from their paid valuation credits.
 */
export const requireValuationHistoryAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  const hasSubscriptionAccess = hasUnexpiredSubscription(
    req.user.subscriptionStatus,
    req.user.currentPeriodEnd,
  );
  const hasRetailReportAccess = req.user.retailValuationEnabled &&
    (req.user.retailValuationCredits > 0 || Boolean(req.user.retailValuationDocumentId));

  if (!hasSubscriptionAccess && !hasRetailReportAccess) {
    res.status(403).json({
      error: "Paid valuation access required",
      message: "Your previous valuation reports are available to the account that purchased them.",
      subscriptionStatus: req.user.subscriptionStatus,
    });
    return;
  }

  next();
};
