import { Request, Response } from "express";
import { StorageService, StorageFolders } from "../services/storage";

/**
 * Upload Controller
 * Handles file upload endpoints
 */
export class UploadController {
  /**
   * Upload event image (thumbnail/banner)
   * POST /api/admin/upload/events
   * Stores in: events/
   */
  static async uploadEventImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
        return;
      }

      const result = await StorageService.uploadEventImage(req.file);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
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
  static async uploadVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
        return;
      }

      const result = await StorageService.uploadVideo(req.file);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
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
  static async uploadVideoThumbnail(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
        return;
      }

      const result = await StorageService.uploadVideoThumbnail(req.file);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
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
  static async uploadUserImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
        return;
      }

      const result = await StorageService.uploadUserImage(req.file);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
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
  static async uploadForumMedia(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
        return;
      }

      const result = await StorageService.uploadForumMedia(req.file);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
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
  static async uploadToFolder(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
        return;
      }

      const folder = req.params.folder;
      const validFolders = Object.values(StorageFolders);

      if (!validFolders.includes(folder as any)) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid folder. Allowed: ${validFolders.join(", ")}`,
          },
        });
        return;
      }

      const result = await StorageService.upload(req.file, folder);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
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
  static async deleteFile(req: Request, res: Response): Promise<void> {
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
      const fileKey = key || StorageService.getKeyFromUrl(url);

      if (!fileKey) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid URL or key provided" },
        });
        return;
      }

      await StorageService.deleteFile(fileKey);

      res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
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
  static async getStatus(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        configured: StorageService.isConfigured(),
        provider: "cloudflare-r2",
        folders: Object.values(StorageFolders),
      },
    });
  }
}
