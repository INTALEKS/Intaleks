"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../services/auth");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authValidation_1 = require("../validation/authValidation");
const cookieUtils_1 = require("../utils/cookieUtils");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
/**
 * POST /api/auth/register - User registration
 * Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7
 */
router.post("/register", (0, authValidation_1.validateRequest)(authValidation_1.registerSchema), async (req, res) => {
    try {
        const { email, password, firstName, lastName, name } = req.body;
        const result = await auth_1.AuthService.registerUser({ email, password, firstName, lastName, name });
        if (!result.success) {
            // Check if it's a duplicate email error (Requirement 1.2)
            if (result.message === "A user with this email already exists") {
                return res.status(409).json({
                    success: false,
                    error: "Conflict",
                    message: result.message,
                });
            }
            return res.status(400).json({
                success: false,
                error: "Registration failed",
                message: result.message,
            });
        }
        // Don't set auth cookie - user must verify email first
        return res.status(201).json({
            success: true,
            message: result.message || "Registration successful. Please check your email to verify your account.",
            user: result.user,
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "An error occurred during registration",
        });
    }
});
/**
 * POST /api/auth/login - User login
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
router.post("/login", (0, authValidation_1.validateRequest)(authValidation_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await auth_1.AuthService.loginUser({ email, password });
        if (!result.success) {
            // Check for suspended account (Requirement 2.4)
            if (result.message === "Your account has been suspended") {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: result.message,
                });
            }
            // Return consistent error for invalid credentials (Requirements 2.2, 2.3)
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
                message: "Invalid email or password",
            });
        }
        // Set HTTP-only cookie with JWT token (Requirement 2.5)
        if (result.token) {
            cookieUtils_1.CookieUtils.setAuthToken(res, result.token);
        }
        // Return user profile with subscription status (Requirement 2.6)
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: result.user,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "An error occurred during login",
        });
    }
});
/**
 * POST /api/auth/logout - User logout
 * Requirements: 4.1, 4.2
 */
router.post("/logout", (req, res) => {
    try {
        // Clear the authentication cookie (Requirement 4.1)
        cookieUtils_1.CookieUtils.clearAuthToken(res);
        const result = auth_1.AuthService.logout();
        // Return success response (Requirement 4.2)
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "An error occurred during logout",
        });
    }
});
/**
 * POST /api/auth/forgot-password - Request password reset
 */
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Validation error",
                message: "Email is required",
            });
        }
        const result = await auth_1.AuthService.requestPasswordReset(email);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "An error occurred while processing your request",
        });
    }
});
/**
 * POST /api/auth/reset-password - Reset password with token
 */
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                error: "Validation error",
                message: "Token and password are required",
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: "Validation error",
                message: "Password must be at least 8 characters long",
            });
        }
        const result = await auth_1.AuthService.resetPasswordWithToken(token, password);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "An error occurred while resetting your password",
        });
    }
});
/**
 * GET /api/auth/me - Get current user profile (protected)
 * Requirements: 3.4
 */
router.get("/me", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
                message: "User not authenticated",
            });
        }
        // Fetch full user profile with subscription info
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                emailVerified: true,
                emailVerifiedAt: true,
                subscriptionStatus: true,
                currentPeriodEnd: true,
                termsAccepted: true,
                termsAcceptedAt: true,
                subscription: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        billingPeriod: true,
                        features: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Not found",
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            user,
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to retrieve profile",
            message: "An error occurred while retrieving profile",
        });
    }
});
/**
 * POST /api/auth/verify-email - Verify email with token
 */
router.post("/verify-email", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: "Validation error",
                message: "Verification token is required",
            });
        }
        const result = await auth_1.AuthService.verifyEmail(token);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: "Verification failed",
                message: result.message,
            });
        }
        return res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({
            success: false,
            error: "Verification failed",
            message: "An error occurred during email verification",
        });
    }
});
/**
 * POST /api/auth/resend-verification - Resend verification email
 */
router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Validation error",
                message: "Email is required",
            });
        }
        const result = await auth_1.AuthService.resendVerificationEmail(email);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: "Failed to resend verification email",
                message: result.message,
            });
        }
        return res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        console.error("Resend verification error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to resend verification email",
            message: "An error occurred while resending verification email",
        });
    }
});
exports.default = router;
