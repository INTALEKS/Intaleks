"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmailVerified = exports.requireSuperAdmin = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const cookieUtils_1 = require("../utils/cookieUtils");
const auth_1 = require("../services/auth");
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Try to get token from cookie first, then fallback to Authorization header
        let token = cookieUtils_1.CookieUtils.getAuthToken(req);
        if (!token) {
            const authHeader = req.headers.authorization;
            token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        }
        if (!token) {
            res.status(401).json({ error: "Access denied", message: "No token provided" });
            return;
        }
        // Verify token and get user
        const Payload = auth_1.AuthService.verifyToken(token);
        if (!Payload) {
            res.status(401).json({
                error: "Access denied",
                message: "Invalid or expired token",
            });
            return;
        }
        const { email, role, userId } = Payload;
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId, email, role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                subscriptionStatus: true,
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
    }
    catch (error) {
        console.error("Authentication middleware error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: "Authentication failed",
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware to check if user has required role or higher
 */
const requireRole = (requiredRole) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
/**
 * Middleware to check if user is admin or higher
 */
exports.requireAdmin = (0, exports.requireRole)(client_1.UserRole.ADMIN);
/**
 * Middleware to check if user is super admin
 */
exports.requireSuperAdmin = (0, exports.requireRole)(client_1.UserRole.SUPER_ADMIN);
/**
 * Middleware to check if user has verified their email
 * Use this on routes that require email verification
 */
const requireEmailVerified = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
        return;
    }
    // Admin users bypass email verification requirement
    if (req.user.role === client_1.UserRole.ADMIN || req.user.role === client_1.UserRole.SUPER_ADMIN) {
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
exports.requireEmailVerified = requireEmailVerified;
