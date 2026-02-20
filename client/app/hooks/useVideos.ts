"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VideosApi, PublicVideosApi, type VideoFilters, type CreateVideoInput, type UpdateVideoInput } from "@/app/services/videos";

export const VIDEO_KEYS = {
  all: ["videos"] as const,
  lists: () => [...VIDEO_KEYS.all, "list"] as const,
  list: (filters?: VideoFilters) => [...VIDEO_KEYS.lists(), filters] as const,
  publicLists: () => [...VIDEO_KEYS.all, "public-list"] as const,
  publicList: (filters?: VideoFilters) => [...VIDEO_KEYS.publicLists(), filters] as const,
  details: () => [...VIDEO_KEYS.all, "detail"] as const,
  detail: (id: string) => [...VIDEO_KEYS.details(), id] as const,
  stats: () => [...VIDEO_KEYS.all, "stats"] as const,
};

/**
 * Hook for fetching public videos (for authenticated users)
 */
export function usePublicVideos(filters?: VideoFilters) {
  return useQuery({
    queryKey: VIDEO_KEYS.publicList(filters),
    queryFn: () => PublicVideosApi.fetchVideos(filters),
  });
}

/**
 * Hook for fetching a single public video
 */
export function usePublicVideo(id: string) {
  return useQuery({
    queryKey: VIDEO_KEYS.detail(id),
    queryFn: () => PublicVideosApi.fetchVideoById(id),
    enabled: !!id,
  });
}

export function useVideos(filters?: VideoFilters) {
  return useQuery({
    queryKey: VIDEO_KEYS.list(filters),
    queryFn: () => VideosApi.fetchVideos(filters),
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: VIDEO_KEYS.detail(id),
    queryFn: () => VideosApi.fetchVideoById(id),
    enabled: !!id,
  });
}

export function useVideoStats() {
  return useQuery({
    queryKey: VIDEO_KEYS.stats(),
    queryFn: () => VideosApi.getStats(),
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVideoInput) => VideosApi.createVideo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.stats() });
      toast.success("Video created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVideoInput }) => VideosApi.updateVideo(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.stats() });
      toast.success("Video updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => VideosApi.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.stats() });
      toast.success("Video deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: (file: File) => VideosApi.uploadVideo(file),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUploadThumbnail() {
  return useMutation({
    mutationFn: (file: File) => VideosApi.uploadThumbnail(file),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useIncrementVideoViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PublicVideosApi.incrementVideoViews(id),
    onSuccess: (_, videoId) => {
      // Invalidate video queries to refresh view count
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.detail(videoId) });
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.publicList() });
    },
    onError: (error: Error) => {
      // Silently fail - view tracking shouldn't disrupt user experience
      console.error("Failed to increment video views:", error);
    },
  });
}
