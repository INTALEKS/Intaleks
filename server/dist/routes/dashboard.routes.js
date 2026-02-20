"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
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
 * Dashboard Routes
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1
 */
// GET /api/admin/dashboard - Get combined dashboard data
router.get("/", dashboard_controller_1.DashboardController.getDashboardData);
// GET /api/admin/dashboard/stats - Get aggregated statistics
router.get("/stats", dashboard_controller_1.DashboardController.getStats);
// GET /api/admin/dashboard/user-growth - Get user growth time-series
router.get("/user-growth", dashboard_controller_1.DashboardController.getUserGrowth);
// GET /api/admin/dashboard/plan-popularity - Get subscription plan popularity
router.get("/plan-popularity", dashboard_controller_1.DashboardController.getPlanPopularity);
exports.default = router;
