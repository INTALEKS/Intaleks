import { UploadApi, type UploadResult } from "./events";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

// Re-export UploadResult for convenience
export type { UploadResult };

// Video Types
export type VideoCategory = "training" | "educational";

export interface Video {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  videoUrl: string;
  thumbnail: string | null;
  duration: number | null; // Duration in seconds
  views: number; // View count
  createdAt: string;
  updatedAt: string;
}

export interface VideoFilters {
  category?: VideoCategory;
  page?: number;
  limit?: number;
}

export interface PaginatedVideos {
  videos: Video[];
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

export interface CreateVideoInput {
  title: string;
  description: string;
  category: VideoCategory;
  videoUrl: string;
  thumbnail?: string | null;
  duration?: number | null; // Duration in seconds
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  category?: VideoCategory;
  videoUrl?: string;
  thumbnail?: string | null;
  duration?: number | null; // Duration in seconds
}

/**
 * Public Videos API - for authenticated users viewing videos
 */
export class PublicVideosApi {
  /**
   * Fetch paginated list of videos with optional filters (public endpoint)
   */
  static async fetchVideos(filters?: VideoFilters): Promise<PaginatedVideos> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`${BASE_URL}/videos?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch videos");
    }
    return data.data;
  }

  /**
   * Fetch a single video by ID (public endpoint)
   */
  static async fetchVideoById(id: string): Promise<Video> {
    const response = await fetch(`${BASE_URL}/videos/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch video");
    }
    return data.data;
  }

  /**
   * Increment video view count (public endpoint)
   */
  static async incrementVideoViews(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/videos/${id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to increment video views");
    }
  }
}

export class VideosApi {
  /**
   * Fetch paginated list of videos with optional filters
   */
  static async fetchVideos(filters?: VideoFilters): Promise<PaginatedVideos> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`${BASE_URL}/admin/videos?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch videos");
    }
    return data.data;
  }

  /**
   * Fetch a single video by ID
   */
  static async fetchVideoById(id: string): Promise<Video> {
    const response = await fetch(`${BASE_URL}/admin/videos/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch video");
    }
    return data.data;
  }

  /**
   * Create a new video
   */
  static async createVideo(input: CreateVideoInput): Promise<Video> {
    const response = await fetch(`${BASE_URL}/admin/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to create video");
    }
    return data.data;
  }

  /**
   * Update an existing video
   */
  static async updateVideo(id: string, input: UpdateVideoInput): Promise<Video> {
    const response = await fetch(`${BASE_URL}/admin/videos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to update video");
    }
    return data.data;
  }

  /**
   * Delete a video
   */
  static async deleteVideo(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/videos/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to delete video");
    }
  }

  /**
   * Get video statistics
   */
  static async getStats(): Promise<VideoStats> {
    const response = await fetch(`${BASE_URL}/admin/videos/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch video stats");
    }
    return data.data;
  }

  /**
   * Upload a video file (uses centralized upload service)
   */
  static async uploadVideo(file: File): Promise<UploadResult> {
    return UploadApi.uploadVideo(file);
  }

  /**
   * Upload a video thumbnail (uses centralized upload service)
   */
  static async uploadThumbnail(file: File): Promise<UploadResult> {
    return UploadApi.uploadVideoThumbnail(file);
  }
}
