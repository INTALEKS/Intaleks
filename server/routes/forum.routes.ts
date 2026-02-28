import { Router, Request, Response, NextFunction } from "express";
import { ForumController } from "../controllers/forum.controller";
import { authenticateToken, requireEmailVerified } from "../middleware/authMiddleware";
import { UserRole, SubscriptionStatus } from "@prisma/client";
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

/**
 * Subscription check middleware
 * Ensures the authenticated user has an active subscription or is an admin
 */
const requireSubscriptionOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
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

  // Admins can always access
  if (req.user.role === UserRole.ADMIN) {
    next();
    return;
  }

  // Check for active subscription
  if (req.user.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
    res.status(403).json({
      success: false,
      error: {
        code: "SUBSCRIPTION_REQUIRED",
        message: "An active subscription is required to access forum content",
      },
    });
    return;
  }

  next();
};

/**
 * Authenticated User Routes (requires subscription or admin)
 */

// Public forum routes for subscribed users
export const publicForumRouter = Router();
publicForumRouter.use(authenticateToken);
publicForumRouter.use(requireEmailVerified);
publicForumRouter.use(requireSubscriptionOrAdmin);

// GET /api/forum - List forum posts (for subscribed users)
publicForumRouter.get("/", ForumController.getForumPosts);

// GET /api/forum/:id - Get forum post details
publicForumRouter.get("/:id", ForumController.getForumPostById);

// POST /api/forum - Create new forum post (authenticated users)
// Requirements: 8.1, 8.2, 8.3
publicForumRouter.post("/", ForumController.createForumPost);

// POST /api/forum/:id/replies - Add reply to a post
publicForumRouter.post("/:id/replies", ForumController.addReply);

// POST /api/forum/:id/react - Toggle reaction on a post
publicForumRouter.post("/:id/react", ForumController.togglePostReaction);

// POST /api/forum/replies/:id/react - Toggle reaction on a reply
publicForumRouter.post("/replies/:id/react", ForumController.toggleReplyReaction);

/**
 * Admin Routes
 * All routes below require authentication and admin role
 */

// Apply authentication and admin authorization to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/forum - List forum posts with filters
// Requirements: 4.1, 4.3, 4.4
router.get("/", ForumController.getForumPosts);

// GET /api/admin/forum/:id - Get forum post details with replies and author
// Requirements: 4.2
router.get("/:id", ForumController.getForumPostById);

// POST /api/admin/forum/:id/replies - Add admin reply
// Requirements: 5.1, 5.2, 5.3
router.post("/:id/replies", ForumController.addReply);

// PATCH /api/admin/forum/:id/star - Toggle starred status
// Requirements: 6.1
router.patch("/:id/star", ForumController.toggleStar);

// DELETE /api/admin/forum/:id - Delete forum post
// Requirements: 6.2, 6.3
router.delete("/:id", ForumController.deleteForumPost);

export default router;
