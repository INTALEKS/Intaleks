"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicVideoRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const video_controller_1 = require("../controllers/video.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const storage_1 = require("../services/storage");
const router = (0, express_1.Router)();
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
    // Check for active subscription (only ACTIVE status allows access)
    if (req.user.subscriptionStatus !== client_1.SubscriptionStatus.ACTIVE) {
        res.status(403).json({
            success: false,
            error: {
                code: "SUBSCRIPTION_REQUIRED",
                message: "An active subscription is required to access video content",
            },
        });
        return;
    }
    next();
};
/**
 * Public Video Router
 * Accessible by subscribed users or admins
 * GET /api/videos - List videos for subscribed users
 * GET /api/videos/:id - Get video details
 */
exports.publicVideoRouter = (0, express_1.Router)();
// Apply authentication to public routes (users must be logged in)
exports.publicVideoRouter.use(authMiddleware_1.authenticateToken);
// Apply email verification check
exports.publicVideoRouter.use(authMiddleware_1.requireEmailVerified);
// Apply subscription check (must be subscribed or admin)
exports.publicVideoRouter.use(requireSubscriptionOrAdmin);
// GET /api/videos - List videos (for subscribed users)
exports.publicVideoRouter.get("/", video_controller_1.VideoController.getVideos);
// GET /api/videos/:id - Get video details
exports.publicVideoRouter.get("/:id", video_controller_1.VideoController.getVideoById);
// POST /api/videos/:id/view - Increment video view count
exports.publicVideoRouter.post("/:id/view", video_controller_1.VideoController.incrementVideoViews);
/**
 * Configure multer for video file uploads
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
const videoUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: storage_1.VIDEO_UPLOAD_MAX_SIZE, // 100MB for video files
    },
});
const thumbnailUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: storage_1.THUMBNAIL_UPLOAD_MAX_SIZE, // 5MB for thumbnails
    },
});
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
 * Video CRUD Routes
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.1
 */
// GET /api/admin/videos/stats - Get video statistics (must be before /:id to avoid conflict)
// Requirements: 7.1
router.get("/stats", video_controller_1.VideoController.getVideoStats);
// GET /api/admin/videos - List videos with filters and pagination
// Requirements: 2.1, 2.2, 2.3
router.get("/", video_controller_1.VideoController.getVideos);
// GET /api/admin/videos/:id - Get video details
// Requirements: 3.1
router.get("/:id", video_controller_1.VideoController.getVideoById);
// POST /api/admin/videos - Create new video
// Requirements: 1.1
router.post("/", video_controller_1.VideoController.createVideo);
// PUT /api/admin/videos/:id - Update video
// Requirements: 4.1
router.put("/:id", video_controller_1.VideoController.updateVideo);
// DELETE /api/admin/videos/:id - Delete video
// Requirements: 5.1
router.delete("/:id", video_controller_1.VideoController.deleteVideo);
/**
 * File Upload Routes
 * Requirements: 6.1, 6.4
 */
// POST /api/admin/videos/upload - Upload video file
// Requirements: 6.1, 6.2, 6.3
router.post("/upload", videoUpload.single("file"), video_controller_1.VideoController.uploadVideo);
// POST /api/admin/videos/upload/thumbnail - Upload thumbnail image
// Requirements: 6.4
router.post("/upload/thumbnail", thumbnailUpload.single("file"), video_controller_1.VideoController.uploadThumbnail);
exports.default = router;
