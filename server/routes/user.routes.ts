import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/authMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

/**
 * Admin authorization middleware
 * Ensures the authenticated user has ADMIN role
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

  if (req.user.role !== UserRole.ADMIN) {
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
 * User Management Routes
 * Requirements: 1.1-8.4, 14.1-14.3, 15.1-15.3
 */

// GET /api/admin/users/stats - Get user statistics (must be before /:id to avoid conflict)
// Requirements: 15.1, 15.2, 15.3
router.get("/stats", UserController.getUserStats);

// GET /api/admin/users - List users with pagination and filters
// Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4
router.get("/", UserController.getUsers);

// GET /api/admin/users/:id - Get user by ID
// Requirements: 3.1, 3.2
router.get("/:id", UserController.getUserById);

// POST /api/admin/users - Create new user
// Requirements: 4.1, 4.2, 4.3, 4.4
router.post("/", UserController.createUser);

// PUT /api/admin/users/:id - Update user
// Requirements: 5.1, 5.2, 5.3
router.put("/:id", UserController.updateUser);

// DELETE /api/admin/users/:id - Delete user
// Requirements: 7.1, 7.2, 7.3
router.delete("/:id", UserController.deleteUser);

// PATCH /api/admin/users/:id/suspend - Suspend user
// Requirements: 6.1, 6.3
router.patch("/:id/suspend", UserController.suspendUser);

// PATCH /api/admin/users/:id/reactivate - Reactivate user
// Requirements: 6.2, 6.3
router.patch("/:id/reactivate", UserController.reactivateUser);

// POST /api/admin/users/:id/reset-password - Reset user password
// Requirements: 8.1, 8.2, 8.3, 8.4
router.post("/:id/reset-password", UserController.resetPassword);

// POST /api/admin/users/:userId/subscription - Assign subscription plan to user
// Requirements: 14.1, 14.2, 14.3
router.post("/:userId/subscription", UserController.assignSubscription);

// PATCH /api/admin/users/:userId/role - Change user role
router.patch("/:userId/role", UserController.changeRole);

export default router;
