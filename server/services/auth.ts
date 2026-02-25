import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

import { prisma } from "../config/db";
import { SubscriptionStatus, UserRole, UserStatus } from "@prisma/client";
import { config } from "../config/environment";
import { AuthenticatedUser } from "../middleware/authMiddleware";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    subscriptionStatus: SubscriptionStatus;
    termsAccepted: boolean;
    termsAcceptedAt: Date | null;
  };
}

export interface UserLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    subscriptionStatus: SubscriptionStatus;
    currentPeriodEnd: Date | null;
    termsAccepted: boolean;
    termsAcceptedAt: Date | null;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  private static readonly jwtSecret = config.jwt.secret || "some-random-string";
  private static readonly TOKEN_EXPIRATION = (config.jwt.expiresIn || "7d") as SignOptions["expiresIn"]; // defaults to 7 days
  private static readonly SALT_ROUNDS = 10;

  /**
   * Register a new user
   * Requirements: 1.1, 1.5, 1.6
   */
  static async registerUser(data: RegisterRequest): Promise<RegisterResponse> {
    const { email, password, name } = data;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return {
          success: false,
          message: "A user with this email already exists",
        };
      }

      // Hash password with bcrypt (Requirement 1.5)
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Create user with USER role and ACTIVE status (Requirement 1.1)
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name || null,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          subscriptionStatus: SubscriptionStatus.NONE,
        },
      });

      // Generate JWT token (Requirement 1.6)
      const tokenPayload: TokenPayload = {
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
    } catch (error) {
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
  static async loginUser(credentials: LoginCredentials): Promise<UserLoginResponse> {
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
      const user = await prisma.user.findUnique({
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
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Check user status - reject SUSPENDED users (Requirement 2.4)
      if (user.status === UserStatus.SUSPENDED) {
        return {
          success: false,
          message: "Your account has been suspended",
        };
      }

      // Generate JWT token (Requirement 2.1)
      const tokenPayload: TokenPayload = {
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
    } catch (error) {
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
  static logout(): LogoutResponse {
    return {
      success: true,
      message: "Logged out successfully",
    };
  }

  /**
   * Request password reset - generates token and returns it
   * In production, this would send an email instead
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; token?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
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
      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token,
          expiresAt,
        },
      });

      // In production, send email here
      // For now, return the token directly for testing
      return {
        success: true,
        message: "Password reset token generated successfully.",
        token, // Remove this in production
      };
    } catch (error) {
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
  static async resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find valid token
      const resetToken = await prisma.passwordResetToken.findUnique({
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
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Update user password and mark token as used
      await prisma.$transaction([
        prisma.user.update({
          where: { email: resetToken.email },
          data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.update({
          where: { token },
          data: { used: true },
        }),
      ]);

      return {
        success: true,
        message: "Password has been reset successfully.",
      };
    } catch (error) {
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
  private static generateResetToken(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  static async loginAdmin(credentials: LoginCredentials): Promise<LoginResponse> {
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
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

      if (!user) {
        return {
          success: false,
          message: "User does not exist",
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: "Invalid email or password" };
      }

      // Generate JWT token
      const tokenPayload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
      const token = this.generateToken(tokenPayload);

      return {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred during login",
      };
    }
  }

  /*** Get user profile by ID   ***/
  static async getUserProfile(userId: string): Promise<AuthenticatedUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /*** Generate JWT token ***/
  private static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.TOKEN_EXPIRATION });
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}
