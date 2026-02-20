"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = exports.NotFoundError = void 0;
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return errors_1.NotFoundError; } });
const storage_1 = require("./storage");
// Helper functions to map between API and database enums
function mapCategoryToDb(category) {
    return category === "training" ? client_1.VideoCategory.TRAINING : client_1.VideoCategory.EDUCATIONAL;
}
function mapCategoryFromDb(category) {
    return category === client_1.VideoCategory.TRAINING ? "training" : "educational";
}
// Transform database video to API response format
function transformVideo(video) {
    return {
        ...video,
        category: mapCategoryFromDb(video.category),
    };
}
class VideoService {
    /**
     * Create a new video
     */
    static async create(data) {
        const video = await db_1.prisma.video.create({
            data: {
                title: data.title,
                description: data.description,
                category: mapCategoryToDb(data.category),
                videoUrl: data.videoUrl,
                thumbnail: data.thumbnail || null,
                duration: data.duration || null,
                views: 0,
            },
        });
        return transformVideo(video);
    }
    /**
     * Find all videos with filtering and pagination
     * Requirements: 2.1, 2.2, 2.3
     */
    static async findAll(filters) {
        const { category, page, limit } = filters;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        // Category filter
        if (category) {
            where.category = mapCategoryToDb(category);
        }
        // Execute queries
        const [videos, total] = await Promise.all([
            db_1.prisma.video.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            db_1.prisma.video.count({ where }),
        ]);
        return {
            videos: videos.map(transformVideo),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    /**
     * Find video by ID
     * Requirements: 3.1
     */
    static async findById(id) {
        const video = await db_1.prisma.video.findUnique({
            where: { id },
        });
        if (!video) {
            throw new errors_1.NotFoundError(`Video with ID ${id} not found`);
        }
        return transformVideo(video);
    }
    /**
     * Update an existing video
     * Requirements: 4.1
     */
    static async update(id, data) {
        // Check if video exists
        const existingVideo = await db_1.prisma.video.findUnique({
            where: { id },
        });
        if (!existingVideo) {
            throw new errors_1.NotFoundError(`Video with ID ${id} not found`);
        }
        // Build update data
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.category !== undefined)
            updateData.category = mapCategoryToDb(data.category);
        if (data.videoUrl !== undefined)
            updateData.videoUrl = data.videoUrl;
        if (data.thumbnail !== undefined)
            updateData.thumbnail = data.thumbnail || null;
        if (data.duration !== undefined)
            updateData.duration = data.duration || null;
        const video = await db_1.prisma.video.update({
            where: { id },
            data: updateData,
        });
        return transformVideo(video);
    }
    /**
     * Delete a video and clean up associated files
     * Requirements: 5.1
     */
    static async delete(id) {
        // Check if video exists
        const existingVideo = await db_1.prisma.video.findUnique({
            where: { id },
        });
        if (!existingVideo) {
            throw new errors_1.NotFoundError(`Video with ID ${id} not found`);
        }
        // Clean up associated files from storage
        try {
            // Delete video file if exists
            if (existingVideo.videoUrl) {
                const videoKey = storage_1.StorageService.getKeyFromUrl(existingVideo.videoUrl);
                if (videoKey) {
                    await storage_1.StorageService.deleteFile(videoKey);
                }
            }
            // Delete thumbnail if exists
            if (existingVideo.thumbnail) {
                const thumbnailKey = storage_1.StorageService.getKeyFromUrl(existingVideo.thumbnail);
                if (thumbnailKey) {
                    await storage_1.StorageService.deleteFile(thumbnailKey);
                }
            }
        }
        catch (error) {
            // Log error but don't fail the deletion if file cleanup fails
            console.error("Error cleaning up video files:", error);
        }
        // Delete video record
        await db_1.prisma.video.delete({
            where: { id },
        });
    }
    /**
     * Get video statistics by category
     * Requirements: 7.1
     */
    static async getStats() {
        const [totalVideos, trainingCount, educationalCount] = await Promise.all([
            db_1.prisma.video.count(),
            db_1.prisma.video.count({
                where: { category: client_1.VideoCategory.TRAINING },
            }),
            db_1.prisma.video.count({
                where: { category: client_1.VideoCategory.EDUCATIONAL },
            }),
        ]);
        return {
            totalVideos,
            trainingCount,
            educationalCount,
        };
    }
    /**
     * Increment video view count
     */
    static async incrementViews(id) {
        // Check if video exists
        const existingVideo = await db_1.prisma.video.findUnique({
            where: { id },
        });
        if (!existingVideo) {
            throw new errors_1.NotFoundError(`Video with ID ${id} not found`);
        }
        // Increment views
        await db_1.prisma.video.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
    }
}
exports.VideoService = VideoService;
