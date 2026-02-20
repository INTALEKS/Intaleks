"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const cookieUtils_1 = require("../utils/cookieUtils");
const auth_1 = require("../services/auth");
const db_1 = require("../config/db");
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
