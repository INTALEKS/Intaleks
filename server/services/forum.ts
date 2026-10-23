import { prisma } from "../config/db";
import { Prisma, ReactionType } from "@prisma/client";
import { NotFoundError, ValidationError } from "../errors";

// Re-export error classes for backward compatibility
export { NotFoundError, ValidationError };

// Reaction type for filtering
interface ReactionRecord {
  id: string;
  userId: string;
  postId: string | null;
  replyId: string | null;
  type: ReactionType;
  createdAt: Date;
}

// Type definitions
export interface ForumAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface CreateForumPostInput {
  title: string;
  content: string;
  attachments?: ForumAttachment[];
  isAnnouncement?: boolean;
  authorId: string;
}

export interface CreateReplyInput {
  message: string;
  authorId: string;
}

export interface ToggleReactionInput {
  userId: string;
  type: "LIKE" | "DISLIKE";
}

export interface ForumFilters {
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedForumPosts {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ForumService {
  /**
   * Find all forum posts with pagination and search
   * Requirements: 4.1, 4.3
   */
  static async findAll(filters: ForumFilters & { userId?: string }): Promise<PaginatedForumPosts> {
    const { search, page, limit, userId } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ForumPostWhereInput = {};

    // Search filter - search in author firstName, lastName, title, or content
    if (search && search.trim()) {
      where.OR = [{ title: { contains: search, mode: "insensitive" } }, { content: { contains: search, mode: "insensitive" } }, { author: { firstName: { contains: search, mode: "insensitive" } } }, { author: { lastName: { contains: search, mode: "insensitive" } } }];
    }

    // Execute queries
    const [items, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
              reactions: true,
            },
          },
          reactions: true,
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    // Parse attachments and calculate reaction counts for each post
    const parsedItems = items.map((post: (typeof items)[number]) => {
      const { reactions: postReactions, ...safePost } = post;
      const likes = postReactions.filter((r: { type: string }) => r.type === "LIKE").length;
      const dislikes = postReactions.filter((r: { type: string }) => r.type === "DISLIKE").length;
      const userReaction = userId ? postReactions.find((r: { userId: string }) => r.userId === userId) : null;

      return {
        ...safePost,
        attachments: post.attachments ? (typeof post.attachments === "string" ? JSON.parse(post.attachments) : post.attachments) : [],
        likes,
        dislikes,
        userLiked: userReaction?.type === "LIKE",
        userDisliked: userReaction?.type === "DISLIKE",
        replies: post.replies.map((reply: (typeof post.replies)[number]) => {
          const { reactions: replyReactions, ...safeReply } = reply;
          const replyLikes = replyReactions.filter((r: { type: string }) => r.type === "LIKE").length;
          const replyDislikes = replyReactions.filter((r: { type: string }) => r.type === "DISLIKE").length;
          const userReplyReaction = userId ? replyReactions.find((r: { userId: string }) => r.userId === userId) : null;
          return {
            ...safeReply,
            likes: replyLikes,
            dislikes: replyDislikes,
            userLiked: userReplyReaction?.type === "LIKE",
            userDisliked: userReplyReaction?.type === "DISLIKE",
          };
        }),
      };
    });

    return {
      items: parsedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find forum post by ID with replies and author
   * Requirements: 4.2
   */
  static async findById(id: string, userId?: string): Promise<any> {
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
            reactions: true,
          },
        },
        reactions: true,
      },
    });

    if (!post) {
      throw new NotFoundError(`Forum post with ID ${id} not found`);
    }

    // Calculate reaction counts
    const { reactions: postReactions, ...safePost } = post;
    const likes = postReactions.filter((r: ReactionRecord) => r.type === "LIKE").length;
    const dislikes = postReactions.filter((r: ReactionRecord) => r.type === "DISLIKE").length;
    const userReaction = userId ? postReactions.find((r: ReactionRecord) => r.userId === userId) : null;

    // Parse attachments and add reaction data
    return {
      ...safePost,
      attachments: post.attachments ? (typeof post.attachments === "string" ? JSON.parse(post.attachments) : post.attachments) : [],
      likes,
      dislikes,
      userLiked: userReaction?.type === "LIKE",
      userDisliked: userReaction?.type === "DISLIKE",
      replies: post.replies.map((reply: (typeof post.replies)[number]) => {
        const { reactions: replyReactions, ...safeReply } = reply;
        const replyLikes = replyReactions.filter((r: ReactionRecord) => r.type === "LIKE").length;
        const replyDislikes = replyReactions.filter((r: ReactionRecord) => r.type === "DISLIKE").length;
        const userReplyReaction = userId ? replyReactions.find((r: ReactionRecord) => r.userId === userId) : null;
        return {
          ...safeReply,
          likes: replyLikes,
          dislikes: replyDislikes,
          userLiked: userReplyReaction?.type === "LIKE",
          userDisliked: userReplyReaction?.type === "DISLIKE",
        };
      }),
    };
  }

  /**
   * Create a new forum post
   * Requirements: 8.1
   */
  static async create(data: CreateForumPostInput): Promise<any> {
    // Verify the author exists
    const author = await prisma.user.findUnique({
      where: { id: data.authorId },
    });

    if (!author) {
      throw new NotFoundError(`User with ID ${data.authorId} not found`);
    }

    const post = await prisma.forumPost.create({
      data: {
        title: data.title,
        content: data.content,
        attachments: data.attachments ? JSON.stringify(data.attachments) : "[]",
        authorId: data.authorId,
        starred: false,
        isAnnouncement: data.isAnnouncement ?? false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        replies: true,
      },
    });

    // Parse attachments back to array for response
    return {
      ...post,
      attachments: post.attachments ? JSON.parse(post.attachments as string) : [],
    };
  }

  /**
   * Add a reply to a forum post
   * Requirements: 5.1
   */
  static async addReply(postId: string, data: CreateReplyInput): Promise<any> {
    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError(`Forum post with ID ${postId} not found`);
    }

    // Validate message is not empty or whitespace-only
    if (!data.message || !data.message.trim()) {
      throw new ValidationError("Reply message cannot be empty or whitespace-only", {
        message: ["Message is required and cannot be empty"],
      });
    }

    // Create the reply
    const reply = await prisma.forumReply.create({
      data: {
        postId,
        authorId: data.authorId,
        message: data.message.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return {
      ...reply,
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false,
    };
  }

  /**
   * Toggle starred status of a forum post
   * Requirements: 6.1
   */
  static async toggleStar(id: string): Promise<any> {
    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundError(`Forum post with ID ${id} not found`);
    }

    // Toggle the starred status
    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: {
        starred: !post.starred,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Parse attachments for response
    return {
      ...updatedPost,
      attachments: updatedPost.attachments ? (typeof updatedPost.attachments === "string" ? JSON.parse(updatedPost.attachments) : updatedPost.attachments) : [],
    };
  }

  /**
   * Delete a forum post (cascade deletes replies)
   * Requirements: 6.2
   */
  static async delete(id: string): Promise<void> {
    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundError(`Forum post with ID ${id} not found`);
    }

    // Delete post (replies are cascade deleted via Prisma schema)
    await prisma.forumPost.delete({
      where: { id },
    });
  }

  /**
   * Toggle reaction on a forum post
   */
  static async togglePostReaction(postId: string, input: ToggleReactionInput): Promise<{ likes: number; dislikes: number; userLiked: boolean; userDisliked: boolean }> {
    const { userId, type } = input;

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError(`Forum post with ID ${postId} not found`);
    }

    // Check for existing reaction
    const existingReaction = await prisma.forumReaction.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Same reaction type - remove it (toggle off)
        await prisma.forumReaction.delete({
          where: { id: existingReaction.id },
        });
      } else {
        // Different reaction type - update it
        await prisma.forumReaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
      }
    } else {
      // No existing reaction - create new one
      await prisma.forumReaction.create({
        data: { userId, postId, type },
      });
    }

    // Get updated counts
    const reactions = await prisma.forumReaction.findMany({
      where: { postId },
    });

    const likes = reactions.filter((r: ReactionRecord) => r.type === "LIKE").length;
    const dislikes = reactions.filter((r: ReactionRecord) => r.type === "DISLIKE").length;
    const userReaction = reactions.find((r: ReactionRecord) => r.userId === userId);

    return {
      likes,
      dislikes,
      userLiked: userReaction?.type === "LIKE" || false,
      userDisliked: userReaction?.type === "DISLIKE" || false,
    };
  }

  /**
   * Toggle reaction on a forum reply
   */
  static async toggleReplyReaction(replyId: string, input: ToggleReactionInput): Promise<{ likes: number; dislikes: number; userLiked: boolean; userDisliked: boolean }> {
    const { userId, type } = input;

    // Check if reply exists
    const reply = await prisma.forumReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new NotFoundError(`Forum reply with ID ${replyId} not found`);
    }

    // Check for existing reaction
    const existingReaction = await prisma.forumReaction.findUnique({
      where: { userId_replyId: { userId, replyId } },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Same reaction type - remove it (toggle off)
        await prisma.forumReaction.delete({
          where: { id: existingReaction.id },
        });
      } else {
        // Different reaction type - update it
        await prisma.forumReaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
      }
    } else {
      // No existing reaction - create new one
      await prisma.forumReaction.create({
        data: { userId, replyId, type },
      });
    }

    // Get updated counts
    const reactions = await prisma.forumReaction.findMany({
      where: { replyId },
    });

    const likes = reactions.filter((r: ReactionRecord) => r.type === "LIKE").length;
    const dislikes = reactions.filter((r: ReactionRecord) => r.type === "DISLIKE").length;
    const userReaction = reactions.find((r: ReactionRecord) => r.userId === userId);

    return {
      likes,
      dislikes,
      userLiked: userReaction?.type === "LIKE" || false,
      userDisliked: userReaction?.type === "DISLIKE" || false,
    };
  }
}
