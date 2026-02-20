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
