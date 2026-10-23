import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { VideoController } from "../controllers/video.controller";
import { authenticateToken, requireEmailVerified } from "../middleware/authMiddleware";
import { UserRole } from "@prisma/client";
import { VIDEO_UPLOAD_MAX_SIZE, THUMBNAIL_UPLOAD_MAX_SIZE } from "../services/storage";
import { isAdminOrHigher } from "../utils/roleHierarchy";
import { hasUnexpiredSubscription } from "../utils/subscriptionAccess";

const router = Router();

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
  if (isAdminOrHigher(req.user.role)) {
    next();
    return;
  }

  // Check for active subscription (only ACTIVE status allows access)
  if (!hasUnexpiredSubscription(req.user.subscriptionStatus, req.user.currentPeriodEnd)) {
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
export const publicVideoRouter = Router();

// Apply authentication to public routes (users must be logged in)
publicVideoRouter.use(authenticateToken);

// Apply email verification check
publicVideoRouter.use(requireEmailVerified);

// Apply subscription check (must be subscribed or admin)
publicVideoRouter.use(requireSubscriptionOrAdmin);

// GET /api/videos - List videos (for subscribed users)
publicVideoRouter.get("/", VideoController.getVideos);

// GET /api/videos/:id - Get video details
publicVideoRouter.get("/:id", VideoController.getVideoById);

// POST /api/videos/:id/view - Increment video view count
publicVideoRouter.post("/:id/view", VideoController.incrementVideoViews);

/**
 * Configure multer for video file uploads
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: VIDEO_UPLOAD_MAX_SIZE, // 100MB for video files
  },
});

const thumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: THUMBNAIL_UPLOAD_MAX_SIZE, // 5MB for thumbnails
  },
});

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
 * Video CRUD Routes
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.1
 */

// GET /api/admin/videos/stats - Get video statistics (must be before /:id to avoid conflict)
// Requirements: 7.1
router.get("/stats", VideoController.getVideoStats);

// GET /api/admin/videos - List videos with filters and pagination
// Requirements: 2.1, 2.2, 2.3
router.get("/", VideoController.getVideos);

// GET /api/admin/videos/:id - Get video details
// Requirements: 3.1
router.get("/:id", VideoController.getVideoById);

// POST /api/admin/videos - Create new video
// Requirements: 1.1
router.post("/", VideoController.createVideo);

// PUT /api/admin/videos/:id - Update video
// Requirements: 4.1
router.put("/:id", VideoController.updateVideo);

// DELETE /api/admin/videos/:id - Delete video
// Requirements: 5.1
router.delete("/:id", VideoController.deleteVideo);

/**
 * File Upload Routes
 * Requirements: 6.1, 6.4
 */

// POST /api/admin/videos/upload - Upload video file
// Requirements: 6.1, 6.2, 6.3
router.post("/upload", videoUpload.single("file"), VideoController.uploadVideo);

// POST /api/admin/videos/upload/thumbnail - Upload thumbnail image
// Requirements: 6.4
router.post("/upload/thumbnail", thumbnailUpload.single("file"), VideoController.uploadThumbnail);

export default router;
