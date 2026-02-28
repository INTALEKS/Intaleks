import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller";
import { authenticateToken, requireEmailVerified } from "../middleware/authMiddleware";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max (for videos)
  },
});

// All upload routes require authentication and email verification
router.use(authenticateToken);
router.use(requireEmailVerified);

// Get storage status
router.get("/status", UploadController.getStatus);

// Delete a file from storage
router.delete("/", UploadController.deleteFile);

// Feature-specific upload endpoints
// Each stores files in its respective folder in R2

// Events - images only (thumbnails, banners)
// Stores in: events/
router.post("/events", upload.single("file"), UploadController.uploadEventImage);

// Videos - video files only
// Stores in: videos/
router.post("/videos", upload.single("file"), UploadController.uploadVideo);

// Video thumbnails - images only
// Stores in: videos/
router.post("/videos/thumbnail", upload.single("file"), UploadController.uploadVideoThumbnail);

// Users - images only (avatars, profile pictures)
// Stores in: users/
router.post("/users", upload.single("file"), UploadController.uploadUserImage);

// Forum - images and videos
// Stores in: forum/
router.post("/forum", upload.single("file"), UploadController.uploadForumMedia);

// Generic upload to specific folder (for flexibility)
// Stores in: {folder}/
router.post("/:folder", upload.single("file"), UploadController.uploadToFolder);

export default router;
