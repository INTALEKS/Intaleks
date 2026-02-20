"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_1 = require("../services/dashboard");
const dashboardValidation_1 = require("../validation/dashboardValidation");
/**
 * Dashboard Controller
 * Handles all HTTP request/response logic for dashboard analytics endpoints
 */
class DashboardController {
    /**
     * Get aggregated dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    static async getStats(req, res) {
        try {
            const stats = await dashboard_1.DashboardService.getStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Get dashboard stats error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving dashboard statistics",
                },
            });
        }
    }
    /**
     * Get user growth time-series data
     * GET /api/admin/dashboard/user-growth
     * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
     */
    static async getUserGrowth(req, res) {
        try {
            // Validate query parameters
            const { error, value } = dashboardValidation_1.timeRangeSchema.validate(req.query, {
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
                        message: error.details[0]?.message ?? "Invalid time range parameters",
                        details,
                    },
                });
                return;
            }
            // Build time range if dates provided
            let timeRange;
            if (value.startDate && value.endDate) {
                timeRange = {
                    startDate: new Date(value.startDate),
                    endDate: new Date(value.endDate),
                };
            }
            const userGrowth = await dashboard_1.DashboardService.getUserGrowth(timeRange);
            res.status(200).json({
                success: true,
                data: userGrowth,
            });
        }
        catch (error) {
            console.error("Get user growth error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving user growth data",
                },
            });
        }
    }
    /**
     * Get subscription plan popularity data
     * GET /api/admin/dashboard/plan-popularity
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
     */
    static async getPlanPopularity(req, res) {
        try {
            const planPopularity = await dashboard_1.DashboardService.getPlanPopularity();
            res.status(200).json({
                success: true,
                data: planPopularity,
            });
        }
        catch (error) {
            console.error("Get plan popularity error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving plan popularity data",
                },
            });
        }
    }
    /**
     * Get combined dashboard data with all metrics
     * GET /api/admin/dashboard
     * Requirements: 5.1, 5.2, 5.3, 5.4
     */
    static async getDashboardData(req, res) {
        try {
            // Validate query parameters
            const { error, value } = dashboardValidation_1.dashboardQuerySchema.validate(req.query, {
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
                        message: error.details[0]?.message ?? "Invalid query parameters",
                        details,
                    },
                });
                return;
            }
            // Build time range if dates provided
            let timeRange;
            if (value.startDate && value.endDate) {
                timeRange = {
                    startDate: new Date(value.startDate),
                    endDate: new Date(value.endDate),
                };
            }
            const dashboardData = await dashboard_1.DashboardService.getDashboardData(timeRange);
            res.status(200).json({
                success: true,
                data: dashboardData,
            });
        }
        catch (error) {
            console.error("Get dashboard data error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving dashboard data",
                },
            });
        }
    }
}
exports.DashboardController = DashboardController;
