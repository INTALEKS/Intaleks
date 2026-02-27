import { Request, Response, NextFunction } from "express";
import { CookieUtils } from "../utils/cookieUtils";
import { AuthService } from "../services/auth";
import { prisma } from "../config/db";
import { UserRole, SubscriptionStatus } from "@prisma/client";

// Define user type without password
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  termsAccepted: boolean;
  termsAcceptedAt: Date | null;
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
        name: true,
        role: true,
        subscriptionStatus: true,
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
