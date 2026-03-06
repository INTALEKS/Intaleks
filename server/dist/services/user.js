"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
class UserService {
    static SALT_ROUNDS = 10;
    static DEFAULT_LIMIT = 10;
    /**
     * Find all users with filtering and pagination
     * Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4
     */
    static async findAll(filters) {
        const { search, subscriptionPlanId, month, day, year, planType, status, page, limit = this.DEFAULT_LIMIT } = filters;
        const skip = (page - 1) * limit;
        // Build where clause with AND logic for all filters
        const where = {
            deletedAt: null, // Exclude soft-deleted users by default
        };
        // Search filter on firstName, lastName or email
        if (search) {
            where.OR = [{ firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
        }
        // Subscription plan ID filter
        if (subscriptionPlanId) {
            where.subscriptionId = subscriptionPlanId;
        }
        // Date filter on subscriptionDate
        if (month || day || year) {
            const dateConditions = {};
            if (year && month && day) {
                // Exact date match
                const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
                const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
                dateConditions.gte = startDate;
                dateConditions.lte = endDate;
            }
            else if (year && month) {
                // Month and year match
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59, 999);
                dateConditions.gte = startDate;
                dateConditions.lte = endDate;
            }
            else if (year) {
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
        const users = await db_1.prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                subscription: true,
            },
        });
        const total = await db_1.prisma.user.count({ where });
        // Remove password from response
        const sanitizedUsers = users.map((user) => {
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
    static async findById(id) {
        const user = await db_1.prisma.user.findUnique({
            where: { id },
            include: {
                subscription: true,
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError(`User with ID ${id} not found`);
        }
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /**
     * Create a new user
     * Requirements: 4.1, 4.2, 4.4
     */
    static async create(data) {
        // Check for duplicate email
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase().trim() },
        });
        if (existingUser) {
            throw new errors_1.ConflictError(`User with email ${data.email} already exists`);
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(data.password, this.SALT_ROUNDS);
        // Create user
        const user = await db_1.prisma.user.create({
            data: {
                email: data.email.toLowerCase().trim(),
                password: hashedPassword,
                firstName: data.firstName || null,
                lastName: data.lastName || null,
                role: data.role || "USER",
                status: data.status || client_1.UserStatus.ACTIVE,
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
    static async update(id, data) {
        // Check if user exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${id} not found`);
        }
        // Check for duplicate email if email is being updated
        if (data.email && data.email.toLowerCase().trim() !== existingUser.email) {
            const emailExists = await db_1.prisma.user.findUnique({
                where: { email: data.email.toLowerCase().trim() },
            });
            if (emailExists) {
                throw new errors_1.ConflictError(`User with email ${data.email} already exists`);
            }
        }
        // Build update data
        const updateData = {};
        if (data.email !== undefined)
            updateData.email = data.email.toLowerCase().trim();
        if (data.firstName !== undefined)
            updateData.firstName = data.firstName;
        if (data.lastName !== undefined)
            updateData.lastName = data.lastName;
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.planType !== undefined)
            updateData.planType = data.planType;
        // Hash password if being updated
        if (data.password) {
            updateData.password = await bcrypt_1.default.hash(data.password, this.SALT_ROUNDS);
        }
        const user = await db_1.prisma.user.update({
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
    static async suspend(id) {
        // Check if user exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${id} not found`);
        }
        const user = await db_1.prisma.user.update({
            where: { id },
            data: { status: client_1.UserStatus.SUSPENDED },
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
    static async reactivate(id) {
        // Check if user exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${id} not found`);
        }
        const user = await db_1.prisma.user.update({
            where: { id },
            data: { status: client_1.UserStatus.ACTIVE },
            include: {
                subscription: true,
            },
        });
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /**
     * Soft delete a user (sets deletedAt timestamp)
     * Requirements: 7.1, 7.2, 7.3
     */
    static async delete(id) {
        // Check if user exists and is not already deleted
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${id} not found`);
        }
        if (existingUser.deletedAt) {
            throw new errors_1.ConflictError(`User with ID ${id} is already deleted`);
        }
        // Soft delete user by setting deletedAt timestamp
        await db_1.prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.UserStatus.SUSPENDED, // Also suspend the account
            },
        });
    }
    /**
     * Permanently delete a user (hard delete)
     * Only for SUPER_ADMIN use
     */
    static async permanentDelete(id) {
        // Check if user exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${id} not found`);
        }
        // Permanently delete user (cascade deletes related records via Prisma schema)
        await db_1.prisma.user.delete({
            where: { id },
        });
    }
    /**
     * Restore a soft-deleted user
     */
    static async restore(id) {
        // Check if user exists and is deleted
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${id} not found`);
        }
        if (!existingUser.deletedAt) {
            throw new errors_1.ConflictError(`User with ID ${id} is not deleted`);
        }
        // Restore user by clearing deletedAt and reactivating
        const user = await db_1.prisma.user.update({
            where: { id },
            data: {
                deletedAt: null,
                status: client_1.UserStatus.ACTIVE,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                planType: true,
                subscriptionStatus: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });
        return user;
    }
    /**
     * Reset a user's password
     * Requirements: 8.1, 8.2, 8.3, 8.4
     */
    static async resetPassword(id) {
        // Check if user exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${id} not found`);
        }
        // Generate random temporary password (12 characters)
        const temporaryPassword = crypto_1.default.randomBytes(8).toString("hex").slice(0, 12);
        // Hash the temporary password
        const hashedPassword = await bcrypt_1.default.hash(temporaryPassword, this.SALT_ROUNDS);
        // Update user with new password
        const user = await db_1.prisma.user.update({
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
    static async getStats(timeRange) {
        // Calculate the current period date range
        let currentStart;
        let currentEnd;
        let previousStart;
        let previousEnd;
        if (timeRange) {
            currentStart = new Date(timeRange.start);
            currentEnd = new Date(timeRange.end);
            // Calculate the duration of the current period
            const periodDuration = currentEnd.getTime() - currentStart.getTime();
            // Previous period is the same duration immediately before the current period
            previousEnd = new Date(currentStart.getTime() - 1); // 1ms before current start
            previousStart = new Date(previousEnd.getTime() - periodDuration);
        }
        else {
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
            db_1.prisma.user.count({
                where: {
                    createdAt: {
                        gte: currentStart,
                        lte: currentEnd,
                    },
                },
            }),
            // Active users in current period
            db_1.prisma.user.count({
                where: {
                    status: client_1.UserStatus.ACTIVE,
                    createdAt: {
                        gte: currentStart,
                        lte: currentEnd,
                    },
                },
            }),
            // Subscribed users (users with a subscription) in current period
            db_1.prisma.user.count({
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
            db_1.prisma.user.count({
                where: {
                    createdAt: {
                        gte: previousStart,
                        lte: previousEnd,
                    },
                },
            }),
            db_1.prisma.user.count({
                where: {
                    status: client_1.UserStatus.ACTIVE,
                    createdAt: {
                        gte: previousStart,
                        lte: previousEnd,
                    },
                },
            }),
            db_1.prisma.user.count({
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
        const calculateChange = (current, previous) => {
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
    static async assignSubscription(userId, planId) {
        // Check if user exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // Check if plan exists
        const plan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new errors_1.NotFoundError(`Subscription plan with ID ${planId} not found`);
        }
        // Determine planType based on plan name (simple mapping)
        let planType = client_1.PlanType.VISITOR;
        const planNameLower = plan.name.toLowerCase();
        if (planNameLower.includes("monthly")) {
            planType = client_1.PlanType.MONTHLY;
        }
        else if (planNameLower.includes("one-off") || planNameLower.includes("oneoff") || planNameLower.includes("one off")) {
            planType = client_1.PlanType.ONE_OFF;
        }
        // Update user with subscription
        const user = await db_1.prisma.user.update({
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
    static async acceptTerms(userId) {
        // Check if user exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // Update user with terms acceptance
        const user = await db_1.prisma.user.update({
            where: { id: userId },
            data: {
                termsAccepted: true,
                termsAcceptedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                termsAccepted: true,
                termsAcceptedAt: true,
            },
        });
        return user;
    }
    /**
     * Change user role
     */
    static async changeRole(userId, role) {
        // Check if user exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            throw new errors_1.NotFoundError(`User with ID ${userId} not found`);
        }
        // Update user role
        const user = await db_1.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                subscriptionStatus: true,
            },
        });
        return user;
    }
}
exports.UserService = UserService;
