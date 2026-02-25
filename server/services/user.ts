import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/db";
import { PlanType, UserStatus, Prisma, User, SubscriptionPlan } from "@prisma/client";
import { NotFoundError, ConflictError } from "../errors";

// User with subscription relation type
type UserWithSubscription = User & { subscription: SubscriptionPlan | null };

/**
 * User Service - Handles all user management operations
 * Requirements: 1.1-8.4, 14.1-14.3, 15.1-15.3
 */

// Type definitions
export interface UserFilters {
  search?: string;
  subscriptionPlanId?: string;
  month?: number;
  day?: number;
  year?: number;
  planType?: PlanType;
  status?: UserStatus;
  page: number;
  limit: number;
}

export interface PaginatedUsers {
  users: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string | null;
  role?: "USER" | "ADMIN";
  status?: UserStatus;
  planType?: PlanType | null;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string | null;
  role?: "USER" | "ADMIN";
  status?: UserStatus;
  planType?: PlanType | null;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  subscribedUsers: number;
  userChange: number;
  activeChange: number;
  subscribedChange: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export class UserService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly DEFAULT_LIMIT = 10;

  /**
   * Find all users with filtering and pagination
   * Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4
   */
  static async findAll(filters: UserFilters): Promise<PaginatedUsers> {
    const { search, subscriptionPlanId, month, day, year, planType, status, page, limit = this.DEFAULT_LIMIT } = filters;
    const skip = (page - 1) * limit;

    // Build where clause with AND logic for all filters
    const where: Prisma.UserWhereInput = {};

    // Search filter on name or email
    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
    }

    // Subscription plan ID filter
    if (subscriptionPlanId) {
      where.subscriptionId = subscriptionPlanId;
    }

    // Date filter on subscriptionDate
    if (month || day || year) {
      const dateConditions: Prisma.DateTimeFilter = {};

      if (year && month && day) {
        // Exact date match
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
        dateConditions.gte = startDate;
        dateConditions.lte = endDate;
      } else if (year && month) {
        // Month and year match
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        dateConditions.gte = startDate;
        dateConditions.lte = endDate;
      } else if (year) {
        // Year only match
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        dateConditions.gte = startDate;
        dateConditions.lte = endDate;
      }

      where.subscriptionDate = dateConditions;
    }

    // Plan type filter
    if (planType) {
      where.planType = planType;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Execute queries
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: true,
      },
    });
    const total = await prisma.user.count({ where });

    // Remove password from response
    const sanitizedUsers = users.map((user: UserWithSubscription) => {
      const { password: _pwd, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      users: sanitizedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find user by ID with subscription details
   * Requirements: 3.1, 3.2
   */
  static async findById(id: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Create a new user
   * Requirements: 4.1, 4.2, 4.4
   */
  static async create(data: CreateUserInput): Promise<any> {
    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictError(`User with email ${data.email} already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        name: data.name || null,
        role: data.role || "USER",
        status: data.status || UserStatus.ACTIVE,
        planType: data.planType || null,
      },
      include: {
        subscription: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update an existing user
   * Requirements: 5.1, 5.2, 5.3
   */
  static async update(id: string, data: UpdateUserInput): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Check for duplicate email if email is being updated
    if (data.email && data.email.toLowerCase().trim() !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      });

      if (emailExists) {
        throw new ConflictError(`User with email ${data.email} already exists`);
      }
    }

    // Build update data
    const updateData: Prisma.UserUpdateInput = {};

    if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.planType !== undefined) updateData.planType = data.planType;

    // Hash password if being updated
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        subscription: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Suspend a user account
   * Requirements: 6.1, 6.3
   */
  static async suspend(id: string): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: UserStatus.SUSPENDED },
      include: {
        subscription: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Reactivate a suspended user account
   * Requirements: 6.2, 6.3
   */
  static async reactivate(id: string): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: UserStatus.ACTIVE },
      include: {
        subscription: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Delete a user (cascade deletes related records via Prisma)
   * Requirements: 7.1, 7.2, 7.3
   */
  static async delete(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Delete user (cascade deletes event participations and forum posts via Prisma schema)
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Reset a user's password
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  static async resetPassword(id: string): Promise<{ user: any; temporaryPassword: string }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Generate random temporary password (12 characters)
    const temporaryPassword = crypto.randomBytes(8).toString("hex").slice(0, 12);

    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(temporaryPassword, this.SALT_ROUNDS);

    // Update user with new password
    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      include: {
        subscription: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      temporaryPassword,
    };
  }

  /**
   * Get user statistics with optional time range filtering
   * Requirements: 15.1, 15.2, 15.3
   */
  static async getStats(timeRange?: TimeRange): Promise<UserStats> {
    // Calculate the current period date range
    let currentStart: Date;
    let currentEnd: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (timeRange) {
      currentStart = new Date(timeRange.start);
      currentEnd = new Date(timeRange.end);

      // Calculate the duration of the current period
      const periodDuration = currentEnd.getTime() - currentStart.getTime();

      // Previous period is the same duration immediately before the current period
      previousEnd = new Date(currentStart.getTime() - 1); // 1ms before current start
      previousStart = new Date(previousEnd.getTime() - periodDuration);
    } else {
      // Default to current month if no time range specified
      const now = new Date();
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Previous month
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    // Get current period stats
    const [currentTotal, currentActive, currentSubscribed] = await Promise.all([
      // Total users created in current period
      prisma.user.count({
        where: {
          createdAt: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
      }),
      // Active users in current period
      prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
          createdAt: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
      }),
      // Subscribed users (users with a subscription) in current period
      prisma.user.count({
        where: {
          subscriptionId: { not: null },
          createdAt: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
      }),
    ]);

    // Get previous period stats for change calculation
    const [previousTotal, previousActive, previousSubscribed] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
      prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
      prisma.user.count({
        where: {
          subscriptionId: { not: null },
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
    ]);

    // Calculate percentage change
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      totalUsers: currentTotal,
      activeUsers: currentActive,
      subscribedUsers: currentSubscribed,
      userChange: calculateChange(currentTotal, previousTotal),
      activeChange: calculateChange(currentActive, previousActive),
      subscribedChange: calculateChange(currentSubscribed, previousSubscribed),
    };
  }

  /**
   * Assign a subscription plan to a user
   * Requirements: 14.1, 14.2, 14.3
   */
  static async assignSubscription(userId: string, planId: string): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundError(`Subscription plan with ID ${planId} not found`);
    }

    // Determine planType based on plan name (simple mapping)
    let planType: PlanType = PlanType.VISITOR;
    const planNameLower = plan.name.toLowerCase();
    if (planNameLower.includes("monthly")) {
      planType = PlanType.MONTHLY;
    } else if (planNameLower.includes("one-off") || planNameLower.includes("oneoff") || planNameLower.includes("one off")) {
      planType = PlanType.ONE_OFF;
    }

    // Update user with subscription
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId: planId,
        planType: planType,
        subscriptionDate: new Date(),
      },
      include: {
        subscription: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Accept terms and conditions for a user
   */
  static async acceptTerms(userId: string): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Update user with terms acceptance
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        termsAccepted: true,
        termsAcceptedAt: true,
      },
    });

    return user;
  }

  /**
   * Change user role
   */
  static async changeRole(userId: string, role: "USER" | "ADMIN"): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        subscriptionStatus: true,
      },
    });

    return user;
  }
}
