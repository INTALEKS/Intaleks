"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_1 = require("../services/user");
const errors_1 = require("../errors");
const userValidation_1 = require("../validation/userValidation");
/**
 * User Controller
 * Handles all HTTP request/response logic for user management endpoints
 */
class UserController {
    /**
     * Get all users with optional filtering and pagination
     * GET /api/admin/users
     */
    static async getUsers(req, res) {
        try {
            // Validate and parse query parameters
            const { error, value } = userValidation_1.userFiltersSchema.validate(req.query, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid filter parameters",
                        details,
                    },
                });
                return;
            }
            const result = await user_1.UserService.findAll(value);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Get users error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving users",
                },
            });
        }
    }
    /**
     * Get a single user by ID with subscription details
     * GET /api/admin/users/:id
     * Requirements: 3.1, 3.2
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await user_1.UserService.findById(id);
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Get user by ID error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving the user",
                },
            });
        }
    }
    /**
     * Create a new user
     * POST /api/admin/users
     * Requirements: 4.1, 4.2, 4.3, 4.4
     */
    static async createUser(req, res) {
        try {
            // Validate request body
            const { error, value } = userValidation_1.createUserSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid user data",
                        details,
                    },
                });
                return;
            }
            const user = await user_1.UserService.create(value);
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errors_1.ConflictError) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: "CONFLICT",
                        message: error.message,
                    },
                });
                return;
            }
            if (error instanceof errors_1.ValidationError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: error.message,
                        details: error.details,
                    },
                });
                return;
            }
            console.error("Create user error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while creating the user",
                },
            });
        }
    }
    /**
     * Update an existing user
     * PUT /api/admin/users/:id
     * Requirements: 5.1, 5.2, 5.3
     * ADMIN cannot modify other ADMIN or SUPER_ADMIN users
     */
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            // Validate request body
            const { error, value } = userValidation_1.updateUserSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid update data",
                        details,
                    },
                });
                return;
            }
            // Get target user to check permissions
            const targetUser = await user_1.UserService.findById(id);
            // Import role hierarchy utilities
            const { canManageUser } = require("../utils/roleHierarchy");
            // Check if current user can manage target user
            if (!canManageUser(currentUser.role, targetUser.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "You cannot modify users with equal or higher role than yours",
                    },
                });
                return;
            }
            const user = await user_1.UserService.update(id, value);
            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            if (error instanceof errors_1.ConflictError) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: "CONFLICT",
                        message: error.message,
                    },
                });
                return;
            }
            if (error instanceof errors_1.ValidationError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: error.message,
                        details: error.details,
                    },
                });
                return;
            }
            console.error("Update user error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while updating the user",
                },
            });
        }
    }
    /**
     * Delete a user
     * DELETE /api/admin/users/:id
     * Requirements: 7.1, 7.2, 7.3
     * ADMIN cannot delete other ADMIN or SUPER_ADMIN users
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            // Get target user to check permissions
            const targetUser = await user_1.UserService.findById(id);
            // Import role hierarchy utilities
            const { canManageUser } = require("../utils/roleHierarchy");
            // Check if current user can manage target user
            if (!canManageUser(currentUser.role, targetUser.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "You cannot delete users with equal or higher role than yours",
                    },
                });
                return;
            }
            await user_1.UserService.delete(id);
            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Delete user error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while deleting the user",
                },
            });
        }
    }
    /**
     * Suspend a user account
     * PATCH /api/admin/users/:id/suspend
     * Requirements: 6.1, 6.3
     * ADMIN cannot suspend other ADMIN or SUPER_ADMIN users
     */
    static async suspendUser(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            // Get target user to check permissions
            const targetUser = await user_1.UserService.findById(id);
            // Import role hierarchy utilities
            const { canManageUser } = require("../utils/roleHierarchy");
            // Check if current user can manage target user
            if (!canManageUser(currentUser.role, targetUser.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "You cannot suspend users with equal or higher role than yours",
                    },
                });
                return;
            }
            const user = await user_1.UserService.suspend(id);
            res.status(200).json({
                success: true,
                message: "User suspended successfully",
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Suspend user error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while suspending the user",
                },
            });
        }
    }
    /**
     * Reactivate a suspended user account
     * PATCH /api/admin/users/:id/reactivate
     * Requirements: 6.2, 6.3
     */
    static async reactivateUser(req, res) {
        try {
            const { id } = req.params;
            const user = await user_1.UserService.reactivate(id);
            res.status(200).json({
                success: true,
                message: "User reactivated successfully",
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Reactivate user error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while reactivating the user",
                },
            });
        }
    }
    /**
     * Reset a user's password
     * POST /api/admin/users/:id/reset-password
     * Requirements: 8.1, 8.2, 8.3, 8.4
     */
    static async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const result = await user_1.UserService.resetPassword(id);
            res.status(200).json({
                success: true,
                message: "Password reset successfully",
                data: {
                    user: result.user,
                    temporaryPassword: result.temporaryPassword,
                },
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Reset password error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while resetting the password",
                },
            });
        }
    }
    /**
     * Get user statistics
     * GET /api/admin/users/stats
     */
    static async getUserStats(req, res) {
        try {
            // Validate query parameters
            const { error, value } = userValidation_1.userStatsSchema.validate(req.query, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid date range parameters",
                        details,
                    },
                });
                return;
            }
            // Build time range if dates provided
            let timeRange;
            if (value.startDate && value.endDate) {
                timeRange = {
                    start: new Date(value.startDate),
                    end: new Date(value.endDate),
                };
            }
            const stats = await user_1.UserService.getStats(timeRange);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Get user stats error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving user statistics",
                },
            });
        }
    }
    /**
     * Assign a subscription plan to a user
     * POST /api/admin/users/:userId/subscription
     */
    static async assignSubscription(req, res) {
        try {
            const { userId } = req.params;
            // Validate request body
            const { error, value } = userValidation_1.assignSubscriptionSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid subscription data",
                        details,
                    },
                });
                return;
            }
            const user = await user_1.UserService.assignSubscription(userId, value.planId);
            res.status(200).json({
                success: true,
                message: "Subscription assigned successfully",
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Assign subscription error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while assigning the subscription",
                },
            });
        }
    }
    /**
     * Accept terms and conditions
     * POST /api/users/accept-terms
     */
    static async acceptTerms(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "User not authenticated",
                    },
                });
                return;
            }
            const user = await user_1.UserService.acceptTerms(userId);
            res.status(200).json({
                success: true,
                message: "Terms and conditions accepted successfully",
                data: {
                    termsAccepted: user.termsAccepted,
                    termsAcceptedAt: user.termsAcceptedAt,
                },
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Accept terms error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while accepting terms",
                },
            });
        }
    }
    /**
     * Change user role
     * PATCH /api/admin/users/:userId/role
     * Only SUPER_ADMIN can change roles to/from ADMIN or SUPER_ADMIN
     * ADMIN cannot modify other ADMIN or SUPER_ADMIN users
     */
    static async changeRole(req, res) {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const currentUser = req.user;
            if (!role || !["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid role. Must be USER, ADMIN, or SUPER_ADMIN",
                    },
                });
                return;
            }
            // Get target user
            const targetUser = await user_1.UserService.findById(userId);
            // Import role hierarchy utilities
            const { canManageUser, isSuperAdmin } = require("../utils/roleHierarchy");
            // Check if current user can manage target user
            if (!canManageUser(currentUser.role, targetUser.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "You cannot modify users with equal or higher role than yours",
                    },
                });
                return;
            }
            // Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles
            if ((role === "ADMIN" || role === "SUPER_ADMIN") && !isSuperAdmin(currentUser.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles",
                    },
                });
                return;
            }
            const user = await user_1.UserService.changeRole(userId, role);
            res.status(200).json({
                success: true,
                message: "User role updated successfully",
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Change role error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while changing user role",
                },
            });
        }
    }
    /**
     * Restore a soft-deleted user
     * POST /api/admin/users/:id/restore
     */
    static async restoreUser(req, res) {
        try {
            const { id } = req.params;
            const user = await user_1.UserService.restore(id);
            res.status(200).json({
                success: true,
                message: "User restored successfully",
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            if (error instanceof errors_1.ConflictError) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: "CONFLICT",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Restore user error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while restoring the user",
                },
            });
        }
    }
    /**
     * Permanently delete a user (hard delete)
     * DELETE /api/admin/users/:id/permanent
     * Only SUPER_ADMIN can permanently delete users
     */
    static async permanentDeleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            // Get target user to check permissions
            const targetUser = await user_1.UserService.findById(id);
            // Import role hierarchy utilities
            const { canManageUser, isSuperAdmin } = require("../utils/roleHierarchy");
            // Only SUPER_ADMIN can permanently delete
            if (!isSuperAdmin(currentUser.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "Only SUPER_ADMIN can permanently delete users",
                    },
                });
                return;
            }
            // Check if current user can manage target user
            if (!canManageUser(currentUser.role, targetUser.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "You cannot permanently delete users with equal or higher role than yours",
                    },
                });
                return;
            }
            await user_1.UserService.permanentDelete(id);
            res.status(200).json({
                success: true,
                message: "User permanently deleted successfully",
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Permanent delete user error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while permanently deleting the user",
                },
            });
        }
    }
}
exports.UserController = UserController;
exports.default = UserController;
