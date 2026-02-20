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
