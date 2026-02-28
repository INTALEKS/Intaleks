"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicForumRouter = void 0;
const express_1 = require("express");
const forum_controller_1 = require("../controllers/forum.controller");
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
/**
 * Subscription check middleware
 * Ensures the authenticated user has an active subscription or is an admin
 */
const requireSubscriptionOrAdmin = (req, res, next) => {
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
    if (req.user.role === client_1.UserRole.ADMIN) {
        next();
        return;
    }
    // Check for active subscription
    if (req.user.subscriptionStatus !== client_1.SubscriptionStatus.ACTIVE) {
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
exports.publicForumRouter = (0, express_1.Router)();
exports.publicForumRouter.use(authMiddleware_1.authenticateToken);
exports.publicForumRouter.use(authMiddleware_1.requireEmailVerified);
exports.publicForumRouter.use(requireSubscriptionOrAdmin);
// GET /api/forum - List forum posts (for subscribed users)
exports.publicForumRouter.get("/", forum_controller_1.ForumController.getForumPosts);
// GET /api/forum/:id - Get forum post details
exports.publicForumRouter.get("/:id", forum_controller_1.ForumController.getForumPostById);
// POST /api/forum - Create new forum post (authenticated users)
// Requirements: 8.1, 8.2, 8.3
exports.publicForumRouter.post("/", forum_controller_1.ForumController.createForumPost);
// POST /api/forum/:id/replies - Add reply to a post
exports.publicForumRouter.post("/:id/replies", forum_controller_1.ForumController.addReply);
// POST /api/forum/:id/react - Toggle reaction on a post
exports.publicForumRouter.post("/:id/react", forum_controller_1.ForumController.togglePostReaction);
// POST /api/forum/replies/:id/react - Toggle reaction on a reply
exports.publicForumRouter.post("/replies/:id/react", forum_controller_1.ForumController.toggleReplyReaction);
/**
 * Admin Routes
 * All routes below require authentication and admin role
 */
// Apply authentication and admin authorization to all admin routes
router.use(authMiddleware_1.authenticateToken);
router.use(requireAdmin);
// GET /api/admin/forum - List forum posts with filters
// Requirements: 4.1, 4.3, 4.4
router.get("/", forum_controller_1.ForumController.getForumPosts);
// GET /api/admin/forum/:id - Get forum post details with replies and author
// Requirements: 4.2
router.get("/:id", forum_controller_1.ForumController.getForumPostById);
// POST /api/admin/forum/:id/replies - Add admin reply
// Requirements: 5.1, 5.2, 5.3
router.post("/:id/replies", forum_controller_1.ForumController.addReply);
// PATCH /api/admin/forum/:id/star - Toggle starred status
// Requirements: 6.1
router.patch("/:id/star", forum_controller_1.ForumController.toggleStar);
// DELETE /api/admin/forum/:id - Delete forum post
// Requirements: 6.2, 6.3
router.delete("/:id", forum_controller_1.ForumController.deleteForumPost);
exports.default = router;
