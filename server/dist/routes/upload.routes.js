"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload_controller_1 = require("../controllers/upload.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max (for videos)
    },
});
// All upload routes require authentication and email verification
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requireEmailVerified);
// Get storage status
router.get("/status", upload_controller_1.UploadController.getStatus);
// Delete a file from storage
router.delete("/", upload_controller_1.UploadController.deleteFile);
// Feature-specific upload endpoints
// Each stores files in its respective folder in R2
// Events - images only (thumbnails, banners)
// Stores in: events/
router.post("/events", upload.single("file"), upload_controller_1.UploadController.uploadEventImage);
// Videos - video files only
// Stores in: videos/
router.post("/videos", upload.single("file"), upload_controller_1.UploadController.uploadVideo);
// Video thumbnails - images only
// Stores in: videos/
router.post("/videos/thumbnail", upload.single("file"), upload_controller_1.UploadController.uploadVideoThumbnail);
// Users - images only (avatars, profile pictures)
// Stores in: users/
router.post("/users", upload.single("file"), upload_controller_1.UploadController.uploadUserImage);
// Forum - images and videos
// Stores in: forum/
router.post("/forum", upload.single("file"), upload_controller_1.UploadController.uploadForumMedia);
// Generic upload to specific folder (for flexibility)
// Stores in: {folder}/
router.post("/:folder", upload.single("file"), upload_controller_1.UploadController.uploadToFolder);
exports.default = router;
