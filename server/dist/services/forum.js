"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumService = exports.ValidationError = exports.NotFoundError = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../errors");
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return errors_1.NotFoundError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return errors_1.ValidationError; } });
class ForumService {
    /**
     * Find all forum posts with pagination and search
     * Requirements: 4.1, 4.3
     */
    static async findAll(filters) {
        const { search, page, limit, userId } = filters;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        // Search filter - search in author name, title, or content
        if (search && search.trim()) {
            where.OR = [{ title: { contains: search, mode: "insensitive" } }, { content: { contains: search, mode: "insensitive" } }, { author: { name: { contains: search, mode: "insensitive" } } }];
        }
        // Execute queries
        const [items, total] = await Promise.all([
            db_1.prisma.forumPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            subscriptionStatus: true,
                        },
                    },
                    replies: {
                        orderBy: { createdAt: "asc" },
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                            reactions: true,
                        },
                    },
                    reactions: true,
                },
            }),
            db_1.prisma.forumPost.count({ where }),
        ]);
        // Parse attachments and calculate reaction counts for each post
        const parsedItems = items.map((post) => {
            const likes = post.reactions.filter((r) => r.type === "LIKE").length;
            const dislikes = post.reactions.filter((r) => r.type === "DISLIKE").length;
            const userReaction = userId ? post.reactions.find((r) => r.userId === userId) : null;
            return {
                ...post,
                attachments: post.attachments ? (typeof post.attachments === "string" ? JSON.parse(post.attachments) : post.attachments) : [],
                likes,
                dislikes,
                userLiked: userReaction?.type === "LIKE",
                userDisliked: userReaction?.type === "DISLIKE",
                replies: post.replies.map((reply) => {
                    const replyLikes = reply.reactions.filter((r) => r.type === "LIKE").length;
                    const replyDislikes = reply.reactions.filter((r) => r.type === "DISLIKE").length;
                    const userReplyReaction = userId ? reply.reactions.find((r) => r.userId === userId) : null;
                    return {
                        ...reply,
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
    static async findById(id, userId) {
        const post = await db_1.prisma.forumPost.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        subscriptionStatus: true,
                    },
                },
                replies: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
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
            throw new errors_1.NotFoundError(`Forum post with ID ${id} not found`);
        }
        // Calculate reaction counts
        const likes = post.reactions.filter((r) => r.type === "LIKE").length;
        const dislikes = post.reactions.filter((r) => r.type === "DISLIKE").length;
        const userReaction = userId ? post.reactions.find((r) => r.userId === userId) : null;
        // Parse attachments and add reaction data
        return {
            ...post,
            attachments: post.attachments ? (typeof post.attachments === "string" ? JSON.parse(post.attachments) : post.attachments) : [],
            likes,
            dislikes,
            userLiked: userReaction?.type === "LIKE",
            userDisliked: userReaction?.type === "DISLIKE",
            replies: post.replies.map((reply) => {
                const replyLikes = reply.reactions.filter((r) => r.type === "LIKE").length;
                const replyDislikes = reply.reactions.filter((r) => r.type === "DISLIKE").length;
                const userReplyReaction = userId ? reply.reactions.find((r) => r.userId === userId) : null;
                return {
                    ...reply,
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
    static async create(data) {
        // Verify the author exists
        const author = await db_1.prisma.user.findUnique({
            where: { id: data.authorId },
        });
        if (!author) {
            throw new errors_1.NotFoundError(`User with ID ${data.authorId} not found`);
        }
        const post = await db_1.prisma.forumPost.create({
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
                        name: true,
                        email: true,
                        role: true,
                        subscriptionStatus: true,
                    },
                },
                replies: true,
            },
        });
        // Parse attachments back to array for response
        return {
            ...post,
            attachments: post.attachments ? JSON.parse(post.attachments) : [],
        };
    }
    /**
     * Add a reply to a forum post
     * Requirements: 5.1
     */
    static async addReply(postId, data) {
        // Check if post exists
        const post = await db_1.prisma.forumPost.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new errors_1.NotFoundError(`Forum post with ID ${postId} not found`);
        }
        // Validate message is not empty or whitespace-only
        if (!data.message || !data.message.trim()) {
            throw new errors_1.ValidationError("Reply message cannot be empty or whitespace-only", {
                message: ["Message is required and cannot be empty"],
            });
        }
        // Create the reply
        const reply = await db_1.prisma.forumReply.create({
            data: {
                postId,
                authorId: data.authorId,
                message: data.message.trim(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
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
    static async toggleStar(id) {
        // Check if post exists
        const post = await db_1.prisma.forumPost.findUnique({
            where: { id },
        });
        if (!post) {
            throw new errors_1.NotFoundError(`Forum post with ID ${id} not found`);
        }
        // Toggle the starred status
        const updatedPost = await db_1.prisma.forumPost.update({
            where: { id },
            data: {
                starred: !post.starred,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        subscriptionStatus: true,
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
    static async delete(id) {
        // Check if post exists
        const post = await db_1.prisma.forumPost.findUnique({
            where: { id },
        });
        if (!post) {
            throw new errors_1.NotFoundError(`Forum post with ID ${id} not found`);
        }
        // Delete post (replies are cascade deleted via Prisma schema)
        await db_1.prisma.forumPost.delete({
            where: { id },
        });
    }
    /**
     * Toggle reaction on a forum post
     */
    static async togglePostReaction(postId, input) {
        const { userId, type } = input;
        // Check if post exists
        const post = await db_1.prisma.forumPost.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new errors_1.NotFoundError(`Forum post with ID ${postId} not found`);
        }
        // Check for existing reaction
        const existingReaction = await db_1.prisma.forumReaction.findUnique({
            where: { userId_postId: { userId, postId } },
        });
        if (existingReaction) {
            if (existingReaction.type === type) {
                // Same reaction type - remove it (toggle off)
                await db_1.prisma.forumReaction.delete({
                    where: { id: existingReaction.id },
                });
            }
            else {
                // Different reaction type - update it
                await db_1.prisma.forumReaction.update({
                    where: { id: existingReaction.id },
                    data: { type },
                });
            }
        }
        else {
            // No existing reaction - create new one
            await db_1.prisma.forumReaction.create({
                data: { userId, postId, type },
            });
        }
        // Get updated counts
        const reactions = await db_1.prisma.forumReaction.findMany({
            where: { postId },
        });
        const likes = reactions.filter((r) => r.type === "LIKE").length;
        const dislikes = reactions.filter((r) => r.type === "DISLIKE").length;
        const userReaction = reactions.find((r) => r.userId === userId);
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
    static async toggleReplyReaction(replyId, input) {
        const { userId, type } = input;
        // Check if reply exists
        const reply = await db_1.prisma.forumReply.findUnique({
            where: { id: replyId },
        });
        if (!reply) {
            throw new errors_1.NotFoundError(`Forum reply with ID ${replyId} not found`);
        }
        // Check for existing reaction
        const existingReaction = await db_1.prisma.forumReaction.findUnique({
            where: { userId_replyId: { userId, replyId } },
        });
        if (existingReaction) {
            if (existingReaction.type === type) {
                // Same reaction type - remove it (toggle off)
                await db_1.prisma.forumReaction.delete({
                    where: { id: existingReaction.id },
                });
            }
            else {
                // Different reaction type - update it
                await db_1.prisma.forumReaction.update({
                    where: { id: existingReaction.id },
                    data: { type },
                });
            }
        }
        else {
            // No existing reaction - create new one
            await db_1.prisma.forumReaction.create({
                data: { userId, replyId, type },
            });
        }
        // Get updated counts
        const reactions = await db_1.prisma.forumReaction.findMany({
            where: { replyId },
        });
        const likes = reactions.filter((r) => r.type === "LIKE").length;
        const dislikes = reactions.filter((r) => r.type === "DISLIKE").length;
        const userReaction = reactions.find((r) => r.userId === userId);
        return {
            likes,
            dislikes,
            userLiked: userReaction?.type === "LIKE" || false,
            userDisliked: userReaction?.type === "DISLIKE" || false,
        };
    }
}
exports.ForumService = ForumService;
