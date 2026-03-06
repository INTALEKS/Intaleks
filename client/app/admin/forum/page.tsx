"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Star, Send, Trash2, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForumPosts, useForumPost, useAddForumReply, useToggleForumStar, useDeleteForumPost, useCreateForumPost } from "@/app/hooks/useForumPosts";
import { useAuthState } from "@/app/hooks/useAuthState";
import { PostCreationPanel } from "@/components/general-ui/admin-components/forum-components/PostCreationPanel";
import { ForumPostContent } from "@/components/general-ui/admin-components/forum-components/ForumPostContent";
import { SubscriptionBadge, type SubscriptionStatusType } from "@/components/general-ui/admin-components/forum-components/SubscriptionBadge";
import type { ForumPost, CreateForumPostInput } from "@/app/services/forum";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function ForumListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border-b">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/4 mb-3" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ForumDetailSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function ForumPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [mode, setMode] = useState<"view" | "create">("view");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: forumData, isLoading: isLoadingList, error: listError } = useForumPosts({ search: debouncedSearch || undefined, isAdmin: true });
  const addReplyMutation = useAddForumReply();
  const toggleStarMutation = useToggleForumStar();
  const deletePostMutation = useDeleteForumPost();
  const createPostMutation = useCreateForumPost();
  const { user } = useAuthState();

  const forumPosts = useMemo(() => forumData?.items || [], [forumData?.items]);

  // Compute effective selected ID: use user selection if valid, otherwise default to first item
  const effectiveSelectedId = useMemo(() => {
    if (forumPosts.length === 0) return null;
    if (userSelectedId && forumPosts.some((post) => post.id === userSelectedId)) {
      return userSelectedId;
    }
    return forumPosts[0].id;
  }, [forumPosts, userSelectedId]);

  const { data: selectedPost, isLoading: isLoadingDetail } = useForumPost(effectiveSelectedId || "", true);

  const handleSelectPost = useCallback((id: string) => {
    setUserSelectedId(id);
  }, []);

  const handleToggleStar = useCallback(
    (e: React.MouseEvent, postId: string) => {
      e.stopPropagation();
      toggleStarMutation.mutate(postId);
    },
    [toggleStarMutation]
  );

  const handleDelete = useCallback((e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!postToDelete) return;
    deletePostMutation.mutate(postToDelete, {
      onSuccess: () => {
        if (userSelectedId === postToDelete) {
          setUserSelectedId(null);
        }
        setDeleteDialogOpen(false);
        setPostToDelete(null);
      },
    });
  }, [deletePostMutation, postToDelete, userSelectedId]);

  const handleSendReply = useCallback(() => {
    if (!effectiveSelectedId || !replyMessage.trim()) return;

    addReplyMutation.mutate(
      { postId: effectiveSelectedId, message: replyMessage },
      {
        onSuccess: () => {
          setReplyMessage("");
        },
      }
    );
  }, [effectiveSelectedId, replyMessage, addReplyMutation]);

  const handleCreatePost = useCallback(() => {
    setMode("create");
  }, []);

  const handleCancelCreate = useCallback(() => {
    setMode("view");
  }, []);

  const handleSubmitPost = useCallback(
    (data: CreateForumPostInput) => {
      createPostMutation.mutate(data, {
        onSuccess: () => {
          setMode("view");
        },
      });
    },
    [createPostMutation]
  );

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] pt-2 bg-background">
      {/* Left Sidebar - Forum Posts List */}
      <div className="w-[440px] border-r flex flex-col mr-2">
        {/* Search */}
        <div className="pr-2 py-2  border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-muted/50" />
            </div>
            <Button onClick={handleCreatePost} size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Create a Post
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingList && <ForumListSkeleton />}

        {/* Error State */}
        {listError && (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-destructive text-sm text-center">Failed to load forum posts. Please try again.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingList && !listError && forumPosts.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground text-sm text-center">{debouncedSearch ? "No forum posts match your search" : "No forum posts yet"}</p>
          </div>
        )}

        {/* Forum Posts List */}
        {!isLoadingList && !listError && forumPosts.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            {forumPosts.map((post: ForumPost) => {
              const subscriptionStatus: SubscriptionStatusType = post.author.subscriptionStatus || "NONE";
              return (
                <div key={post.id} onClick={() => handleSelectPost(post.id)} className={cn("p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors", effectiveSelectedId === post.id && "bg-muted/50 border-l-2 border-l-primary")}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{post.author.name || post.author.email}</h3>
                      <SubscriptionBadge subscriptionStatus={subscriptionStatus} />
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(post.createdAt)}</span>
                  </div>
                  <h4 className="font-semibold text-base mb-2">{post.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{stripHtmlTags(post.content)}</p>
                  <div className="flex items-center justify-between">
                    <button onClick={(e) => handleToggleStar(e, post.id)} className="focus:outline-none" disabled={toggleStarMutation.isPending}>
                      <Star className={cn("h-5 w-5 transition-colors", post.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400")} />
                    </button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDelete(e, post.id)} disabled={deletePostMutation.isPending}>
                      {deletePostMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Panel - Post Details or Creation Panel */}
      <div className="bg-(--hover-bg) flex-1 flex flex-col rounded-md">
        {/* Create Mode - Show PostCreationPanel */}
        {mode === "create" && (
          <PostCreationPanel
            adminUser={{
              firstName: user?.firstName || user?.name?.split(" ")[0] || "Admin",
              lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "User",
              email: user?.email || "admin@example.com",
              avatar: undefined,
            }}
            onSubmit={handleSubmitPost}
            onCancel={handleCancelCreate}
            isSubmitting={createPostMutation.isPending}
          />
        )}

        {/* View Mode - Show Post Details */}
        {mode === "view" && isLoadingDetail && effectiveSelectedId && <ForumDetailSkeleton />}

        {mode === "view" && !isLoadingDetail && selectedPost ? (
          <>
            {/* Header */}
            <div className="p-2 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(selectedPost.author.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-lg">{selectedPost.author.name || selectedPost.author.email}</h2>
                      <SubscriptionBadge subscriptionStatus={selectedPost.author.subscriptionStatus || "NONE"} />
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedPost.author.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, selectedPost.id)} disabled={deletePostMutation.isPending}>
                    {deletePostMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleToggleStar(e, selectedPost.id)} disabled={toggleStarMutation.isPending}>
                    <Star className={cn("h-5 w-5", selectedPost.starred ? "fill-yellow-400 text-yellow-400" : "")} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="flex-1 overflow-y-auto py-2 px-4">
              <h2 className="text-2xl font-semibold mb-4">{selectedPost.title}</h2>
              <ForumPostContent content={selectedPost.content} attachments={selectedPost.attachments} />

              {/* Replies Section */}
              {selectedPost.replies && selectedPost.replies.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Replies</h3>
                  <div className="space-y-4">
                    {selectedPost.replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Admin Reply</span>
                          <span className="text-xs text-muted-foreground">{formatTimestamp(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reply Section */}
            <div className="p-2 border-t bg-muted/20">
              <div className="flex items-start gap-3">
                <Textarea placeholder="Reply..." value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} className="min-h-[80px] resize-none" disabled={addReplyMutation.isPending} />
                <Button size="icon" className="shrink-0" onClick={handleSendReply} disabled={addReplyMutation.isPending || !replyMessage.trim()}>
                  {addReplyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          mode === "view" &&
          !isLoadingDetail &&
          !effectiveSelectedId && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select a forum post to view details</p>
            </div>
          )
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Forum Post</DialogTitle>
            <DialogDescription>Are you sure you want to delete this forum post? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deletePostMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deletePostMutation.isPending}>
              {deletePostMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
