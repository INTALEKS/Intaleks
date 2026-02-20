/**
 * Forum Service
 * API client for forum-related operations
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4545";

// Interfaces
export interface ForumFilters {
  search?: string;
  page?: number;
  limit?: number;
  authorId?: string;
  isAdmin?: boolean;
}

export interface ForumAuthor {
  id: string;
  name: string | null;
  email: string;
  avatar?: string;
  role?: string;
  subscriptionStatus?: "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";
}

export interface ForumAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface ForumReply {
  id: string;
  postId: string;
  message: string;
  author?: ForumAuthor;
  likes?: number;
  dislikes?: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  attachments: ForumAttachment[];
  authorId: string;
  author: ForumAuthor;
  starred: boolean;
  isAnnouncement: boolean;
  likes?: number;
  dislikes?: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  replies: ForumReply[];
  createdAt: string;
  updatedAt: string;
}

export interface ReactionResponse {
  likes: number;
  dislikes: number;
  userLiked: boolean;
  userDisliked: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateForumPostInput {
  title: string;
  content: string;
  attachments?: ForumAttachment[];
  isAnnouncement?: boolean;
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const errorData = await response.json();
    if (errorData.message) {
      return errorData.message;
    }
    if (errorData.error) {
      return errorData.error;
    }
    return `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export const ForumApi = {
  /**
   * Get all forum posts with pagination and filters
   */
  async getForumPosts(filters?: ForumFilters): Promise<PaginatedResponse<ForumPost>> {
    const searchParams = new URLSearchParams();
    if (filters?.page) searchParams.set("page", filters.page.toString());
    if (filters?.limit) searchParams.set("limit", filters.limit.toString());
    if (filters?.search) searchParams.set("search", filters.search);
    if (filters?.authorId) searchParams.set("authorId", filters.authorId);

    // Use admin endpoint for admin operations
    const endpoint = filters?.isAdmin ? `${API_BASE}/api/admin/forum` : `${API_BASE}/api/forum`;
    const response = await fetch(`${endpoint}?${searchParams}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get a single forum post by ID
   */
  async getForumPostById(id: string, isAdmin?: boolean): Promise<ForumPost> {
    const endpoint = isAdmin ? `${API_BASE}/api/admin/forum/${id}` : `${API_BASE}/api/forum/${id}`;
    const response = await fetch(endpoint, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Create a new forum post
   */
  async createForumPost(input: CreateForumPostInput): Promise<ForumPost> {
    const response = await fetch(`${API_BASE}/api/forum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Add a reply to a forum post
   */
  async addReply(postId: string, message: string): Promise<ForumReply> {
    const response = await fetch(`${API_BASE}/api/admin/forum/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Toggle star status on a forum post (admin only)
   */
  async toggleStar(id: string): Promise<ForumPost> {
    const response = await fetch(`${API_BASE}/api/admin/forum/${id}/star`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Delete a forum post (admin only)
   */
  async deleteForumPost(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/admin/forum/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }
  },

  /**
   * Toggle reaction on a forum post
   */
  async togglePostReaction(postId: string, type: "LIKE" | "DISLIKE"): Promise<ReactionResponse> {
    const response = await fetch(`${API_BASE}/api/forum/${postId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Toggle reaction on a forum reply
   */
  async toggleReplyReaction(replyId: string, type: "LIKE" | "DISLIKE"): Promise<ReactionResponse> {
    const response = await fetch(`${API_BASE}/api/forum/replies/${replyId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  },
};
