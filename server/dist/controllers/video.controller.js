"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const video_1 = require("../services/video");
const storage_1 = require("../services/storage");
const videoValidation_1 = require("../validation/videoValidation");
/**
 * Video Controller
 * Handles all HTTP request/response logic for video management endpoints
 */
class VideoController {
    /**
     * Get all videos with optional filtering and pagination
     * GET /api/admin/videos
     */
    static async getVideos(req, res) {
        try {
            // Validate and parse query parameters
            const { error, value } = videoValidation_1.videoFiltersSchema.validate(req.query, {
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
                        message: "Invalid filter parameters",
                        details,
                    },
                });
                return;
            }
            const result = await video_1.VideoService.findAll(value);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Get videos error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving videos",
                },
            });
        }
    }
    /**
     * Get a single video by ID
     * GET /api/admin/videos/:id
     * Requirements: 3.1, 3.2
     */
    static async getVideoById(req, res) {
        try {
            const { id } = req.params;
            const video = await video_1.VideoService.findById(id);
            res.status(200).json({
                success: true,
                data: video,
            });
        }
        catch (error) {
            if (error instanceof video_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Get video by ID error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving the video",
                },
            });
        }
    }
    /**
     * Create a new video
     * POST /api/admin/videos
     */
    static async createVideo(req, res) {
        try {
            // Validate request body
            const { error, value } = videoValidation_1.createVideoSchema.validate(req.body, {
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
                        message: "Invalid video data",
                        details,
                    },
                });
                return;
            }
            const video = await video_1.VideoService.create(value);
            res.status(201).json({
                success: true,
                message: "Video created successfully",
                data: video,
            });
        }
        catch (error) {
            console.error("Create video error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while creating the video",
                },
            });
        }
    }
    /**
     * Update an existing video
     * PUT /api/admin/videos/:id
     * Requirements: 4.1, 4.2, 4.3
     */
    static async updateVideo(req, res) {
        try {
            const { id } = req.params;
            // Validate request body
            const { error, value } = videoValidation_1.updateVideoSchema.validate(req.body, {
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
                        message: "Invalid update data",
                        details,
                    },
                });
                return;
            }
            const video = await video_1.VideoService.update(id, value);
            res.status(200).json({
                success: true,
                message: "Video updated successfully",
                data: video,
            });
        }
        catch (error) {
            if (error instanceof video_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Update video error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while updating the video",
                },
            });
        }
    }
    /**
     * Delete a video
     * DELETE /api/admin/videos/:id
     * Requirements: 5.1, 5.2, 5.3
     */
    static async deleteVideo(req, res) {
        try {
            const { id } = req.params;
            await video_1.VideoService.delete(id);
            res.status(200).json({
                success: true,
                message: "Video deleted successfully",
            });
        }
        catch (error) {
            if (error instanceof video_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Delete video error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while deleting the video",
                },
            });
        }
    }
    /**
     * Get video statistics
     * GET /api/admin/videos/stats
     * Requirements: 7.1, 7.2
     */
    static async getVideoStats(req, res) {
        try {
            const stats = await video_1.VideoService.getStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Get video stats error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving video statistics",
                },
            });
        }
    }
    /**
     * Upload a video file
     * POST /api/admin/videos/upload
     * Requirements: 6.1, 6.2, 6.3
     */
    static async uploadVideo(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "No file provided",
                    },
                });
                return;
            }
            // Validate file format
            if (!storage_1.ALLOWED_VIDEO_FORMATS.includes(req.file.mimetype)) {
                res.status(415).json({
                    success: false,
                    error: {
                        code: "UNSUPPORTED_MEDIA_TYPE",
                        message: `Invalid video format. Allowed formats: MP4, WebM, OGG, MOV`,
                    },
                });
                return;
            }
            // Validate file size
            if (req.file.size > storage_1.VIDEO_UPLOAD_MAX_SIZE) {
                res.status(413).json({
                    success: false,
                    error: {
                        code: "FILE_TOO_LARGE",
                        message: `Video size exceeds ${storage_1.VIDEO_UPLOAD_MAX_SIZE / 1024 / 1024}MB limit`,
                    },
                });
                return;
            }
            const result = await storage_1.StorageService.uploadVideo(req.file);
            res.status(200).json({
                success: true,
                data: {
                    url: result.url,
                    key: result.key,
                    size: result.size,
                    contentType: result.contentType,
                },
            });
        }
        catch (error) {
            console.error("Video upload error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: error instanceof Error ? error.message : "Failed to upload video",
                },
            });
        }
    }
    /**
     * Upload a video thumbnail
     * POST /api/admin/videos/upload/thumbnail
     * Requirements: 6.4
     */
    static async uploadThumbnail(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "No file provided",
                    },
                });
                return;
            }
            // Validate file format
            if (!storage_1.ALLOWED_THUMBNAIL_FORMATS.includes(req.file.mimetype)) {
                res.status(415).json({
                    success: false,
                    error: {
                        code: "UNSUPPORTED_MEDIA_TYPE",
                        message: `Invalid thumbnail format. Allowed formats: JPEG, PNG, WebP`,
                    },
                });
                return;
            }
            // Validate file size
            if (req.file.size > storage_1.THUMBNAIL_UPLOAD_MAX_SIZE) {
                res.status(413).json({
                    success: false,
                    error: {
                        code: "FILE_TOO_LARGE",
                        message: `Thumbnail size exceeds ${storage_1.THUMBNAIL_UPLOAD_MAX_SIZE / 1024 / 1024}MB limit`,
                    },
                });
                return;
            }
            const result = await storage_1.StorageService.uploadVideoThumbnail(req.file);
            res.status(200).json({
                success: true,
                data: {
                    url: result.url,
                    key: result.key,
                    size: result.size,
                    contentType: result.contentType,
                },
            });
        }
        catch (error) {
            console.error("Thumbnail upload error:", error);
            res.status(400).json({
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: error instanceof Error ? error.message : "Failed to upload thumbnail",
                },
            });
        }
    }
    /**
     * Increment video view count
     * POST /api/videos/:id/view
     */
    static async incrementVideoViews(req, res) {
        try {
            const { id } = req.params;
            await video_1.VideoService.incrementViews(id);
            res.status(200).json({
                success: true,
                message: "View count incremented",
            });
        }
        catch (error) {
            if (error instanceof video_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Increment video views error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while incrementing video views",
                },
            });
        }
    }
}
exports.VideoController = VideoController;
