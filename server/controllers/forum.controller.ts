import { Request, Response } from "express";
import { ForumService, NotFoundError, ValidationError } from "../services/forum";
import { createForumPostSchema, createForumReplySchema, forumFiltersSchema } from "../validation/forumValidation";
import { isAdminOrHigher } from "../utils/roleHierarchy";

/**
 * Forum Controller
 * Handles all HTTP request/response logic for forum management endpoints
 * Requirements: 4.1, 4.2, 5.1, 6.1, 6.2, 8.1
 */
export class ForumController {
  /**
   * Get all forum posts with optional filtering and pagination
   * GET /api/admin/forum
   * Requirements: 4.1, 4.3, 4.4
   */
  static async getForumPosts(req: Request, res: Response): Promise<void> {
    try {
      // Validate and parse query parameters
      const { error, value } = forumFiltersSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
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

      const result = await ForumService.findAll({
        ...value,
        userId: req.user?.id,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get forum posts error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while retrieving forum posts",
        },
      });
    }
  }

  /**
   * Get a single forum post by ID with replies and author
   * GET /api/admin/forum/:id
   * Requirements: 4.2
   */
  static async getForumPostById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const post = await ForumService.findById(id, req.user?.id);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Get forum post by ID error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while retrieving the forum post",
        },
      });
    }
  }

  /**
   * Create a new forum post (authenticated users)
   * POST /api/forum
   * Requirements: 8.1, 8.2, 8.3
   */
  static async createForumPost(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createForumPostSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
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
            message: "Invalid forum post data",
            details,
          },
        });
        return;
      }

      // Get author ID from authenticated user
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to create a forum post",
          },
        });
        return;
      }

      const post = await ForumService.create({
        ...value,
        authorId: req.user.id,
        isAnnouncement: isAdminOrHigher(req.user.role) ? value.isAnnouncement : false,
      });

      res.status(201).json({
        success: true,
        message: "Forum post created successfully",
        data: post,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Create forum post error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while creating the forum post",
        },
      });
    }
  }

  /**
   * Add a reply to a forum post
   * POST /api/admin/forum/:id/replies
   * Requirements: 5.1, 5.2, 5.3
   */
  static async addReply(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check authentication
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to add a reply",
          },
        });
        return;
      }

      // Validate request body
      const { error, value } = createForumReplySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
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
            message: "Invalid reply data",
            details,
          },
        });
        return;
      }

      const reply = await ForumService.addReply(id, {
        ...value,
        authorId: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Reply added successfully",
        data: reply,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      console.error("Add reply error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while adding the reply",
        },
      });
    }
  }

  /**
   * Toggle starred status of a forum post
   * PATCH /api/admin/forum/:id/star
   * Requirements: 6.1
   */
  static async toggleStar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const post = await ForumService.toggleStar(id);

      res.status(200).json({
        success: true,
        message: "Forum post star status toggled successfully",
        data: post,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Toggle star error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while toggling the star status",
        },
      });
    }
  }

  /**
   * Delete a forum post
   * DELETE /api/admin/forum/:id
   * Requirements: 6.2, 6.3
   */
  static async deleteForumPost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await ForumService.delete(id);

      res.status(200).json({
        success: true,
        message: "Forum post deleted successfully",
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Delete forum post error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while deleting the forum post",
        },
      });
    }
  }

  /**
   * Toggle reaction on a forum post
   * POST /api/forum/:id/react
   */
  static async togglePostReaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type } = req.body;

      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to react to a post",
          },
        });
        return;
      }

      if (!type || !["LIKE", "DISLIKE"].includes(type)) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid reaction type. Must be LIKE or DISLIKE",
          },
        });
        return;
      }

      const result = await ForumService.togglePostReaction(id, {
        userId: req.user.id,
        type,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Toggle post reaction error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while toggling the reaction",
        },
      });
    }
  }

  /**
   * Toggle reaction on a forum reply
   * POST /api/forum/replies/:id/react
   */
  static async toggleReplyReaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type } = req.body;

      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to react to a reply",
          },
        });
        return;
      }

      if (!type || !["LIKE", "DISLIKE"].includes(type)) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid reaction type. Must be LIKE or DISLIKE",
          },
        });
        return;
      }

      const result = await ForumService.toggleReplyReaction(id, {
        userId: req.user.id,
        type,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Toggle reply reaction error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while toggling the reaction",
        },
      });
    }
  }
}
