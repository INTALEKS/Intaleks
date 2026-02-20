"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ForumApi, type ForumFilters, type CreateForumPostInput, type ForumPost, type ForumReply, type ForumAttachment, type PaginatedResponse, type ReactionResponse } from "@/app/services/forum";

// Re-export types for convenience
export type { ForumFilters, CreateForumPostInput, ForumPost, ForumReply, ForumAttachment, PaginatedResponse, ReactionResponse };

export const FORUM_KEYS = {
  all: ["forumPosts"] as const,
  lists: () => [...FORUM_KEYS.all, "list"] as const,
  list: (filters?: ForumFilters) => [...FORUM_KEYS.lists(), filters] as const,
  details: () => [...FORUM_KEYS.all, "detail"] as const,
  detail: (id: string) => [...FORUM_KEYS.details(), id] as const,
};

export function useForumPosts(filters?: ForumFilters) {
  return useQuery({
    queryKey: FORUM_KEYS.list(filters),
    queryFn: () => ForumApi.getForumPosts(filters),
  });
}

export function useForumPost(id: string, isAdmin?: boolean) {
  return useQuery({
    queryKey: FORUM_KEYS.detail(id),
    queryFn: () => ForumApi.getForumPostById(id, isAdmin),
    enabled: !!id,
  });
}

export function useCreateForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateForumPostInput) => ForumApi.createForumPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.lists() });
      toast.success("Forum post created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAddForumReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, message }: { postId: string; message: string }) => ForumApi.addReply(postId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.lists() });
      toast.success("Reply added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleForumStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ForumApi.toggleStar(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.lists() });
      toast.success(data.starred ? "Post starred" : "Post unstarred");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ForumApi.deleteForumPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.lists() });
      toast.success("Forum post deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useTogglePostReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: "LIKE" | "DISLIKE" }) => ForumApi.togglePostReaction(postId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleReplyReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, type }: { replyId: string; type: "LIKE" | "DISLIKE"; postId: string }) => ForumApi.toggleReplyReaction(replyId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
