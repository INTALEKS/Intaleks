"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
const environment_1 = require("../config/environment");
const email_1 = __importDefault(require("./email"));
class AuthService {
    static jwtSecret = environment_1.config.jwt.secret || "some-random-string";
    static TOKEN_EXPIRATION = (environment_1.config.jwt.expiresIn || "7d"); // defaults to 7 days
    static SALT_ROUNDS = 10;
    /**
     * Register a new user
     * Requirements: 1.1, 1.5, 1.6
     */
    static async registerUser(data) {
        const { email, password, name } = data;
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        try {
            // Check if user already exists
            const existingUser = await db_1.prisma.user.findUnique({
                where: { email: normalizedEmail },
            });
            if (existingUser) {
                return {
                    success: false,
                    message: "A user with this email already exists",
                };
            }
            // Hash password with bcrypt (Requirement 1.5)
            const hashedPassword = await bcrypt_1.default.hash(password, this.SALT_ROUNDS);
            // Create user with USER role and ACTIVE status (Requirement 1.1)
            const user = await db_1.prisma.user.create({
                data: {
                    email: normalizedEmail,
                    password: hashedPassword,
                    name: name || null,
                    role: client_1.UserRole.USER,
                    status: client_1.UserStatus.ACTIVE,
                    subscriptionStatus: client_1.SubscriptionStatus.NONE,
                },
            });
            // Send welcome email (non-blocking)
            email_1.default
                .sendWelcomeEmail({
                name: user.name || "",
                email: user.email,
            })
                .catch((error) => {
                console.error("Failed to send welcome email:", error);
                // Don't fail registration if email fails
            });
            // Generate JWT token (Requirement 1.6)
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                role: user.role,
            };
            const token = this.generateToken(tokenPayload);
            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    subscriptionStatus: user.subscriptionStatus,
                    termsAccepted: user.termsAccepted,
                    termsAcceptedAt: user.termsAcceptedAt,
                },
            };
        }
        catch (error) {
            console.error("Registration error:", error);
            return {
                success: false,
                message: "An error occurred during registration",
            };
        }
    }
    /**
     * Login a user (normal user login)
     * Requirements: 2.1, 2.2, 2.3, 2.4, 2.6
     */
    static async loginUser(credentials) {
        const { email, password } = credentials;
        // Validate input
        if (!email || !password) {
            return {
                success: false,
                message: "Email and password are required",
            };
        }
        try {
            // Find user by email
            const user = await db_1.prisma.user.findUnique({
                where: { email: email.toLowerCase().trim() },
            });
            // Return consistent error message for security (Requirements 2.2, 2.3)
            // Same message whether email doesn't exist or password is wrong
            if (!user) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }
            // Verify password
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }
            // Check user status - reject SUSPENDED users (Requirement 2.4)
            if (user.status === client_1.UserStatus.SUSPENDED) {
                return {
                    success: false,
                    message: "Your account has been suspended",
                };
            }
            // Generate JWT token (Requirement 2.1)
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                role: user.role,
            };
            const token = this.generateToken(tokenPayload);
            // Return user profile with subscription status (Requirement 2.6)
            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    subscriptionStatus: user.subscriptionStatus,
                    currentPeriodEnd: user.currentPeriodEnd,
                    termsAccepted: user.termsAccepted,
                    termsAcceptedAt: user.termsAcceptedAt,
                },
            };
        }
        catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: "An error occurred during login",
            };
        }
    }
    /**
     * Logout - returns success response
     * Cookie clearing is handled by the route handler
     * Requirements: 4.1, 4.2
     */
    static logout() {
        return {
            success: true,
            message: "Logged out successfully",
        };
    }
    /**
     * Request password reset - generates token and sends email
     */
    static async requestPasswordReset(email) {
        const normalizedEmail = email.toLowerCase().trim();
        try {
            // Check if user exists
            const user = await db_1.prisma.user.findUnique({
                where: { email: normalizedEmail },
            });
            // For security, always return success even if user doesn't exist
            if (!user) {
                return {
                    success: true,
                    message: "If an account exists with this email, a password reset link has been sent.",
                };
            }
            // Generate random token
            const token = this.generateResetToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
            // Store token in database
            await db_1.prisma.passwordResetToken.create({
                data: {
                    email: normalizedEmail,
                    token,
                    expiresAt,
                },
            });
            // Send password reset email
            const emailSent = await email_1.default.sendPasswordResetEmail(normalizedEmail, token);
            if (!emailSent) {
                console.error("Failed to send password reset email to:", normalizedEmail);
                // Still return success for security (don't reveal if email exists)
                // But in development, you might want to return the token
                if (process.env.NODE_ENV === "development") {
                    return {
                        success: true,
                        message: "Password reset token generated (email service not configured).",
                        token, // Only in development
                    };
                }
            }
            return {
                success: true,
                message: "If an account exists with this email, a password reset link has been sent.",
            };
        }
        catch (error) {
            console.error("Password reset request error:", error);
            return {
                success: false,
                message: "An error occurred while processing your request.",
            };
        }
    }
    /**
     * Reset password using token
     */
    static async resetPasswordWithToken(token, newPassword) {
        try {
            // Find valid token
            const resetToken = await db_1.prisma.passwordResetToken.findUnique({
                where: { token },
            });
            if (!resetToken) {
                return {
                    success: false,
                    message: "Invalid or expired reset token.",
                };
            }
            // Check if token is expired
            if (resetToken.expiresAt < new Date()) {
                return {
                    success: false,
                    message: "Reset token has expired. Please request a new one.",
                };
            }
            // Check if token was already used
            if (resetToken.used) {
                return {
                    success: false,
                    message: "This reset token has already been used.",
                };
            }
            // Hash new password
            const hashedPassword = await bcrypt_1.default.hash(newPassword, this.SALT_ROUNDS);
            // Update user password and mark token as used
            await db_1.prisma.$transaction([
                db_1.prisma.user.update({
                    where: { email: resetToken.email },
                    data: { password: hashedPassword },
                }),
                db_1.prisma.passwordResetToken.update({
                    where: { token },
                    data: { used: true },
                }),
            ]);
            return {
                success: true,
                message: "Password has been reset successfully.",
            };
        }
        catch (error) {
            console.error("Password reset error:", error);
            return {
                success: false,
                message: "An error occurred while resetting your password.",
            };
        }
    }
    /**
     * Generate a random reset token
     */
    static generateResetToken() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let token = "";
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
    static async loginAdmin(credentials) {
        const { email, password } = credentials;
        // Validate input
        if (!email || !password) {
            return {
                success: false,
                message: "Email and password are required",
            };
        }
        try {
            // Find user by email
            const user = await db_1.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
            if (!user) {
                return {
                    success: false,
                    message: "User does not exist",
                };
            }
            // Verify password
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return { success: false, message: "Invalid email or password" };
            }
            // Generate JWT token
            const tokenPayload = { userId: user.id, email: user.email, role: user.role };
            const token = this.generateToken(tokenPayload);
            return {
                success: true,
                token,
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
            };
        }
        catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: "An error occurred during login",
            };
        }
    }
    /*** Get user profile by ID   ***/
    static async getUserProfile(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return null;
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /*** Generate JWT token ***/
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, { expiresIn: this.TOKEN_EXPIRATION });
    }
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthService = AuthService;
