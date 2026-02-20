"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const storage_1 = require("../services/storage");
/**
 * Upload Controller
 * Handles file upload endpoints
 */
class UploadController {
    /**
     * Upload event image (thumbnail/banner)
     * POST /api/admin/upload/events
     * Stores in: events/
     */
    static async uploadEventImage(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "No file provided" },
                });
                return;
            }
            const result = await storage_1.StorageService.uploadEventImage(req.file);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Event image upload error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: error instanceof Error ? error.message : "Failed to upload file",
                },
            });
        }
    }
    /**
     * Upload video
     * POST /api/admin/upload/videos
     * Stores in: videos/
     */
    static async uploadVideo(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "No file provided" },
                });
                return;
            }
            const result = await storage_1.StorageService.uploadVideo(req.file);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Video upload error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: error instanceof Error ? error.message : "Failed to upload file",
                },
            });
        }
    }
    /**
     * Upload video thumbnail
     * POST /api/admin/upload/videos/thumbnail
     * Stores in: videos/
     */
    static async uploadVideoThumbnail(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "No file provided" },
                });
                return;
            }
            const result = await storage_1.StorageService.uploadVideoThumbnail(req.file);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Video thumbnail upload error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: error instanceof Error ? error.message : "Failed to upload file",
                },
            });
        }
    }
    /**
     * Upload user image (avatar)
     * POST /api/admin/upload/users
     * Stores in: users/
     */
    static async uploadUserImage(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "No file provided" },
                });
                return;
            }
            const result = await storage_1.StorageService.uploadUserImage(req.file);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("User image upload error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: error instanceof Error ? error.message : "Failed to upload file",
                },
            });
        }
    }
    /**
     * Upload forum media (images or videos)
     * POST /api/admin/upload/forum
     * Stores in: forum/
     */
    static async uploadForumMedia(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "No file provided" },
                });
                return;
            }
            const result = await storage_1.StorageService.uploadForumMedia(req.file);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Forum media upload error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: error instanceof Error ? error.message : "Failed to upload file",
                },
            });
        }
    }
    /**
     * Generic upload with folder parameter
     * POST /api/admin/upload/:folder
     * Stores in: {folder}/
     */
    static async uploadToFolder(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "No file provided" },
                });
                return;
            }
            const folder = req.params.folder;
            const validFolders = Object.values(storage_1.StorageFolders);
            if (!validFolders.includes(folder)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: `Invalid folder. Allowed: ${validFolders.join(", ")}`,
                    },
                });
                return;
            }
            const result = await storage_1.StorageService.upload(req.file, folder);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Upload error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: error instanceof Error ? error.message : "Failed to upload file",
                },
            });
        }
    }
    /**
     * Delete a file from storage
     * DELETE /api/admin/upload
     * Body: { url: string } or { key: string }
     */
    static async deleteFile(req, res) {
        try {
            const { url, key } = req.body;
            if (!url && !key) {
                res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "Provide either 'url' or 'key' to delete" },
                });
                return;
            }
            // Extract key from URL if provided
            const fileKey = key || storage_1.StorageService.getKeyFromUrl(url);
            if (!fileKey) {
                res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "Invalid URL or key provided" },
                });
                return;
            }
            await storage_1.StorageService.deleteFile(fileKey);
            res.status(200).json({
                success: true,
                message: "File deleted successfully",
            });
        }
        catch (error) {
            console.error("Delete file error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "DELETE_ERROR",
                    message: error instanceof Error ? error.message : "Failed to delete file",
                },
            });
        }
    }
    /**
     * Check storage configuration status
     * GET /api/admin/upload/status
     */
    static async getStatus(req, res) {
        res.status(200).json({
            success: true,
            data: {
                configured: storage_1.StorageService.isConfigured(),
                provider: "cloudflare-r2",
                folders: Object.values(storage_1.StorageFolders),
            },
        });
    }
}
exports.UploadController = UploadController;
