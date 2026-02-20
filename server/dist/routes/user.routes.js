"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
/**
 * Admin authorization middleware
 * Ensures the authenticated user has ADMIN role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            },
        });
        return;
    }
    if (req.user.role !== client_1.UserRole.ADMIN) {
        res.status(403).json({
            success: false,
            error: {
                code: "FORBIDDEN",
                message: "Admin access required",
            },
        });
        return;
    }
    next();
};
// Apply authentication and admin authorization to all routes
router.use(authMiddleware_1.authenticateToken);
router.use(requireAdmin);
/**
 * User Management Routes
 * Requirements: 1.1-8.4, 14.1-14.3, 15.1-15.3
 */
// GET /api/admin/users/stats - Get user statistics (must be before /:id to avoid conflict)
// Requirements: 15.1, 15.2, 15.3
router.get("/stats", user_controller_1.UserController.getUserStats);
// GET /api/admin/users - List users with pagination and filters
// Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4
router.get("/", user_controller_1.UserController.getUsers);
// GET /api/admin/users/:id - Get user by ID
// Requirements: 3.1, 3.2
router.get("/:id", user_controller_1.UserController.getUserById);
// POST /api/admin/users - Create new user
// Requirements: 4.1, 4.2, 4.3, 4.4
router.post("/", user_controller_1.UserController.createUser);
// PUT /api/admin/users/:id - Update user
// Requirements: 5.1, 5.2, 5.3
router.put("/:id", user_controller_1.UserController.updateUser);
// DELETE /api/admin/users/:id - Delete user
// Requirements: 7.1, 7.2, 7.3
router.delete("/:id", user_controller_1.UserController.deleteUser);
// PATCH /api/admin/users/:id/suspend - Suspend user
// Requirements: 6.1, 6.3
router.patch("/:id/suspend", user_controller_1.UserController.suspendUser);
// PATCH /api/admin/users/:id/reactivate - Reactivate user
// Requirements: 6.2, 6.3
router.patch("/:id/reactivate", user_controller_1.UserController.reactivateUser);
// POST /api/admin/users/:id/reset-password - Reset user password
// Requirements: 8.1, 8.2, 8.3, 8.4
router.post("/:id/reset-password", user_controller_1.UserController.resetPassword);
// POST /api/admin/users/:userId/subscription - Assign subscription plan to user
// Requirements: 14.1, 14.2, 14.3
router.post("/:userId/subscription", user_controller_1.UserController.assignSubscription);
exports.default = router;
