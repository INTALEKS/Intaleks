import { Router, Request, Response, NextFunction } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticateToken } from "../middleware/authMiddleware";
import { UserRole } from "@prisma/client";
import { isAdminOrHigher } from "../utils/roleHierarchy";

const router = Router();

/**
 * Admin authorization middleware
 * Ensures the authenticated user has ADMIN or SUPER_ADMIN role
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
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

  if (!isAdminOrHigher(req.user.role)) {
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
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * Dashboard Routes
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1
 */

// GET /api/admin/dashboard - Get combined dashboard data
router.get("/", DashboardController.getDashboardData);

// GET /api/admin/dashboard/stats - Get aggregated statistics
router.get("/stats", DashboardController.getStats);

// GET /api/admin/dashboard/user-growth - Get user growth time-series
router.get("/user-growth", DashboardController.getUserGrowth);

// GET /api/admin/dashboard/plan-popularity - Get subscription plan popularity
router.get("/plan-popularity", DashboardController.getPlanPopularity);

export default router;
