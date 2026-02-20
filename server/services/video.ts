import { prisma } from "../config/db";
import { VideoCategory, Prisma } from "@prisma/client";
import { NotFoundError } from "../errors";
import { StorageService } from "./storage";

// Re-export error classes for backward compatibility
export { NotFoundError };

// Type definitions
export interface CreateVideoInput {
  title: string;
  description: string;
  category: "training" | "educational";
  videoUrl: string;
  thumbnail?: string | null;
  duration?: number | null;
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  category?: "training" | "educational";
  videoUrl?: string;
  thumbnail?: string | null;
  duration?: number | null;
}

export interface VideoFilters {
  category?: "training" | "educational";
  page: number;
  limit: number;
}

export interface PaginatedVideos {
  videos: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VideoStats {
  totalVideos: number;
  trainingCount: number;
  educationalCount: number;
}

// Helper functions to map between API and database enums
function mapCategoryToDb(category: "training" | "educational"): VideoCategory {
  return category === "training" ? VideoCategory.TRAINING : VideoCategory.EDUCATIONAL;
}

function mapCategoryFromDb(category: VideoCategory): "training" | "educational" {
  return category === VideoCategory.TRAINING ? "training" : "educational";
}

// Transform database video to API response format
function transformVideo(video: any): any {
  return {
    ...video,
    category: mapCategoryFromDb(video.category),
  };
}

export class VideoService {
  /**
   * Create a new video
   */
  static async create(data: CreateVideoInput): Promise<any> {
    const video = await prisma.video.create({
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
  static async findAll(filters: VideoFilters): Promise<PaginatedVideos> {
    const { category, page, limit } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.VideoWhereInput = {};

    // Category filter
    if (category) {
      where.category = mapCategoryToDb(category);
    }

    // Execute queries
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.video.count({ where }),
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
  static async findById(id: string): Promise<any> {
    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundError(`Video with ID ${id} not found`);
    }

    return transformVideo(video);
  }

  /**
   * Update an existing video
   * Requirements: 4.1
   */
  static async update(id: string, data: UpdateVideoInput): Promise<any> {
    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      throw new NotFoundError(`Video with ID ${id} not found`);
    }

    // Build update data
    const updateData: Prisma.VideoUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = mapCategoryToDb(data.category);
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail || null;
    if (data.duration !== undefined) updateData.duration = data.duration || null;

    const video = await prisma.video.update({
      where: { id },
      data: updateData,
    });

    return transformVideo(video);
  }

  /**
   * Delete a video and clean up associated files
   * Requirements: 5.1
   */
  static async delete(id: string): Promise<void> {
    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      throw new NotFoundError(`Video with ID ${id} not found`);
    }

    // Clean up associated files from storage
    try {
      // Delete video file if exists
      if (existingVideo.videoUrl) {
        const videoKey = StorageService.getKeyFromUrl(existingVideo.videoUrl);
        if (videoKey) {
          await StorageService.deleteFile(videoKey);
        }
      }

      // Delete thumbnail if exists
      if (existingVideo.thumbnail) {
        const thumbnailKey = StorageService.getKeyFromUrl(existingVideo.thumbnail);
        if (thumbnailKey) {
          await StorageService.deleteFile(thumbnailKey);
        }
      }
    } catch (error) {
      // Log error but don't fail the deletion if file cleanup fails
      console.error("Error cleaning up video files:", error);
    }

    // Delete video record
    await prisma.video.delete({
      where: { id },
    });
  }

  /**
   * Get video statistics by category
   * Requirements: 7.1
   */
  static async getStats(): Promise<VideoStats> {
    const [totalVideos, trainingCount, educationalCount] = await Promise.all([
      prisma.video.count(),
      prisma.video.count({
        where: { category: VideoCategory.TRAINING },
      }),
      prisma.video.count({
        where: { category: VideoCategory.EDUCATIONAL },
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
  static async incrementViews(id: string): Promise<void> {
    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      throw new NotFoundError(`Video with ID ${id} not found`);
    }

    // Increment views
    await prisma.video.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }
}
