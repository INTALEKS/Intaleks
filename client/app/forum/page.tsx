"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar, Footer } from "@/components/home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, ChevronDown, Check, MessageCircle, MoreHorizontal, Search, ThumbsUp, ThumbsDown, Send, Bookmark, BookmarkCheck, Flame, HelpCircle, Sparkles, PaperclipIcon, Crown, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminOrHigher } from "@/lib/role-utils";
import { PageHeader } from "@/components/general-ui/PageHeader";
import { FeatureCards } from "@/components/general-ui/FeatureCards";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useForumPosts, useForumPost, useAddForumReply, useCreateForumPost, useTogglePostReaction, useToggleReplyReaction, type ForumPost as APIForumPost, type ForumReply as APIForumReply, type ForumFilters } from "@/app/hooks/useForumPosts";
import { useCreateCheckout } from "@/app/hooks/useSubscriptions";
import { useDebounce } from "@/app/hooks/useDebounce";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RichTextEditor, type Attachment } from "@/components/general-ui/admin-components/forum-components/RichTextEditor";
import { ForumPostContent } from "@/components/general-ui/admin-components/forum-components/ForumPostContent";

// UI Types
interface Author {
  name: string;
  email: string;
  avatar: string;
}

interface Reply {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userLiked: boolean;
  userDisliked: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  commentCount: number;
  isNew: boolean;
  isAdmin: boolean;
  isAnnouncement: boolean;
  attachments: { id: string; name: string; size: number; type: string; url: string }[];
  participants: string[];
  isBookmarked: boolean;
  likes: number;
  dislikes: number;
  userLiked: boolean;
  userDisliked: boolean;
  comments: Reply[];
}

type FilterType = "all" | "trending" | "unanswered" | "announcements" | "my-posts" | "bookmarks";

const features = [
  {
    title: "Learn from real-world experience",
    description: "Gain insights from founders, investors, and valuation professionals sharing practical, real-life perspectives.",
    image: "/forum-experience.png",
  },
  {
    title: "Ask questions and get clarity",
    description: "Discuss valuation challenges, investor expectations, and business value in a space built for clear, thoughtful answers.",
    image: "/forum-questions.png",
  },
  {
    title: "Stay ahead of valuation trends",
    description: "Explore how market changes, funding climates, and investor thinking impact business value—before it shows up in deals.",
    image: "/forum-trends.png",
  },
];

// Helper to strip HTML tags for preview text
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// Transform API response to UI format
function transformApiPostToUIPost(apiPost: APIForumPost): Post {
  const createdDate = new Date(apiPost.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let createdAtStr: string;
  if (diffMins < 1) {
    createdAtStr = "Just now";
  } else if (diffMins < 60) {
    createdAtStr = `${diffMins}min ago`;
  } else if (diffHours < 24) {
    createdAtStr = `${diffHours}h ago`;
  } else {
    createdAtStr = `${diffDays}d ago`;
  }

  // Check if post is new (created within last 24 hours)
  const isNew = diffHours < 24;

  // Check if author is admin or super admin
  const isAdmin = isAdminOrHigher(apiPost.author.role);

  // Transform replies to UI format
  const comments: Reply[] = apiPost.replies.map((reply) => transformApiReplyToUIReply(reply));

  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    author: {
      name: apiPost.author.name || "Anonymous",
      email: "",
      avatar: apiPost.author.avatar || "/founder.png",
    },
    createdAt: createdAtStr,
    commentCount: apiPost.replies.length,
    isNew,
    isAdmin,
    isAnnouncement: apiPost.isAnnouncement,
    attachments: apiPost.attachments || [],
    participants: ["/founder.png"], // Placeholder - could be derived from unique reply authors
    isBookmarked: apiPost.starred,
    likes: apiPost.likes ?? 0,
    dislikes: apiPost.dislikes ?? 0,
    userLiked: apiPost.userLiked ?? false,
    userDisliked: apiPost.userDisliked ?? false,
    comments,
  };
}

function transformApiReplyToUIReply(apiReply: APIForumReply): Reply {
  const createdDate = new Date(apiReply.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let createdAtStr: string;
  if (diffMins < 1) {
    createdAtStr = "Just now";
  } else if (diffMins < 60) {
    createdAtStr = `${diffMins}min ago`;
  } else if (diffHours < 24) {
    createdAtStr = `${diffHours}h ago`;
  } else {
    createdAtStr = `${diffDays}d ago`;
  }

  return {
    id: apiReply.id,
    author: {
      name: apiReply.author?.name || "User",
      email: "",
      avatar: "/founder.png",
    },
    content: apiReply.message,
    createdAt: createdAtStr,
    likes: apiReply.likes ?? 0,
    dislikes: apiReply.dislikes ?? 0,
    userLiked: apiReply.userLiked ?? false,
    userDisliked: apiReply.userDisliked ?? false,
  };
}

// Loading fallback for Suspense
function ForumLoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={<ForumLoadingFallback />}>
      <ForumPageContent />
    </Suspense>
  );
}

function ForumPageContent() {
  const { isAuthenticated, isAuthentiating, hasActiveSubscription, user } = useAuthState();
  const canAccessForum = isAdminOrHigher(user?.role) || hasActiveSubscription;

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy] = useState("latest");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAttachments, setNewPostAttachments] = useState<Attachment[]>([]);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Build filters based on selected filter and search
  const userId = user?.id;
  const filters: ForumFilters = useMemo(() => {
    const f: ForumFilters = { page: 1, limit: 20 };
    if (debouncedSearchQuery.trim()) {
      f.search = debouncedSearchQuery.trim();
    }
    if (selectedFilter === "my-posts" && userId) {
      f.authorId = userId;
    }
    return f;
  }, [debouncedSearchQuery, selectedFilter, userId]);

  // Track if search is pending (user typed but debounce hasn't fired yet)
  const isSearchPending = searchQuery !== debouncedSearchQuery;

  // Fetch posts from API
  const { data: postsData, isLoading: isLoadingPosts, error: postsError } = useForumPosts(filters);

  // Fetch selected post details
  const { data: selectedPostData, isLoading: isLoadingPost, error: postError } = useForumPost(selectedPostId || "");

  // Add reply mutation
  const addReplyMutation = useAddForumReply();

  // Create post mutation
  const createPostMutation = useCreateForumPost();

  // Reaction mutations
  const togglePostReactionMutation = useTogglePostReaction();
  const toggleReplyReactionMutation = useToggleReplyReaction();

  const showPreview = !isAuthentiating && (!isAuthenticated || !canAccessForum);

  // Hide header/features for subscribed users and admins
  const showHeader = !canAccessForum;

  const filterOptions: { key: FilterType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "all", label: "All Discussions", icon: <MessageCircle className="w-4 h-4" /> },
    { key: "trending", label: "Trending", icon: <Flame className="w-4 h-4" /> },
    { key: "unanswered", label: "Unanswered", icon: <HelpCircle className="w-4 h-4" /> },
    { key: "announcements", label: "Announcements", icon: <Sparkles className="w-4 h-4" /> },
    { key: "my-posts", label: "My Posts", icon: <PaperclipIcon className="w-4 h-4" /> },
    { key: "bookmarks", label: "My Bookmarks", icon: <Bookmark className="w-4 h-4" /> },
  ];

  // Transform API posts to UI format and apply client-side filters
  const posts: Post[] = useMemo(() => {
    if (!postsData?.items) return [];

    let transformedPosts = postsData.items.map(transformApiPostToUIPost);

    // Apply client-side filters
    if (selectedFilter === "announcements") {
      transformedPosts = transformedPosts.filter((post) => post.isAnnouncement);
    } else if (selectedFilter === "unanswered") {
      transformedPosts = transformedPosts.filter((post) => post.commentCount === 0);
    } else if (selectedFilter === "bookmarks") {
      transformedPosts = transformedPosts.filter((post) => post.isBookmarked);
    }

    return transformedPosts;
  }, [postsData, selectedFilter]);

  // Transform selected post from API
  const selectedPost: Post | null = useMemo(() => {
    if (!selectedPostData) return null;
    return transformApiPostToUIPost(selectedPostData);
  }, [selectedPostData]);

  const handleToggleBookmark = (postId: string) => {
    // TODO: Implement bookmark API when available
    console.log("Toggle bookmark for post:", postId);
  };

  const handleTogglePostLike = (postId: string, isLike: boolean) => {
    togglePostReactionMutation.mutate({
      postId,
      type: isLike ? "LIKE" : "DISLIKE",
    });
  };

  const handleToggleLike = (postId: string, commentId: string, isLike: boolean) => {
    toggleReplyReactionMutation.mutate({
      replyId: commentId,
      postId,
      type: isLike ? "LIKE" : "DISLIKE",
    });
  };

  const handleAddReply = (postId: string, content: string, onSuccess?: () => void) => {
    if (!content.trim()) return;
    addReplyMutation.mutate(
      { postId, message: content.trim() },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  // Validate post form fields
  const validatePostForm = (): boolean => {
    let isValid = true;
    setTitleError("");
    setContentError("");

    if (!newPostTitle.trim()) {
      setTitleError("Title is required");
      isValid = false;
    }

    // Strip HTML tags for content validation
    const strippedContent = newPostContent.replace(/<[^>]*>/g, "").trim();
    if (!strippedContent) {
      setContentError("Content is required");
      isValid = false;
    }

    return isValid;
  };

  // Handle create post submission
  const handleCreatePost = () => {
    if (!validatePostForm()) {
      return;
    }

    const apiAttachments = newPostAttachments.map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size,
      type: att.type,
      url: att.url,
    }));

    createPostMutation.mutate(
      { title: newPostTitle.trim(), content: newPostContent.trim(), attachments: apiAttachments },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          setNewPostTitle("");
          setNewPostContent("");
          setNewPostAttachments([]);
          setTitleError("");
          setContentError("");
        },
      },
    );
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostAttachments([]);
      setTitleError("");
      setContentError("");
    }
    setIsCreateDialogOpen(open);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {showHeader && (
        <>
          <PageHeader
            title={
              <>
                A <span className="font-bold">community</span> for people who care
                <br />
                about business value
              </>
            }
            subtitle="Insights and discussions on business valuation from experienced professionals."
            ctaText="Start New Discussion"
            ctaHref="#forum"
            altCtaText="Subscribe to Join"
            altCtaHref="/#pricing"
          />

          <FeatureCards features={features} />
        </>
      )}

      <section id="forum" className="py-8 px-4 relative">
        {showPreview ? (
          <PreviewSection isAuthenticated={isAuthenticated} />
        ) : isAuthentiating ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm">
                  {sortBy === "latest" ? "Latest first" : "Oldest first"}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-48 bg-gray-100 border-0" />
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                {/* Loading State */}
                {(isLoadingPosts || isSearchPending) && !selectedPostId && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    {isSearchPending && <span className="ml-2 text-muted-foreground">Searching...</span>}
                  </div>
                )}

                {/* Error State */}
                {postsError && !selectedPostId && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load posts</h3>
                    <p className="text-gray-600 mb-4">{postsError.message}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Post Detail View */}
                {selectedPostId && (
                  <>
                    {isLoadingPost && (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {postError && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load post</h3>
                        <p className="text-gray-600 mb-4">{postError.message}</p>
                        <Button variant="outline" onClick={() => setSelectedPostId(null)}>
                          Back to discussions
                        </Button>
                      </div>
                    )}
                    {selectedPost && !isLoadingPost && !postError && <PostDetail post={selectedPost} onBack={() => setSelectedPostId(null)} onToggleBookmark={() => handleToggleBookmark(selectedPost.id)} onTogglePostLike={(isLike) => handleTogglePostLike(selectedPost.id, isLike)} onToggleLike={(commentId, isLike) => handleToggleLike(selectedPost.id, commentId, isLike)} onAddReply={(content, onSuccess) => handleAddReply(selectedPost.id, content, onSuccess)} isAddingReply={addReplyMutation.isPending} />}
                  </>
                )}

                {/* Posts List */}
                {!selectedPostId && !isLoadingPosts && !isSearchPending && !postsError && (
                  <>
                    {posts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                        <p className="text-gray-600">{searchQuery ? "Try a different search term" : selectedFilter === "my-posts" ? "You haven't created any posts yet" : selectedFilter === "announcements" ? "No announcements at this time" : selectedFilter === "bookmarks" ? "You haven't bookmarked any posts yet" : selectedFilter === "unanswered" ? "All questions have been answered!" : "Be the first to start a discussion!"}</p>
                      </div>
                    ) : (
                      posts.map((post) => <PostCard key={post.id} post={post} onClick={() => setSelectedPostId(post.id)} />)
                    )}
                  </>
                )}
              </div>

              <Sidebar filters={filterOptions} selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} onCreatePost={() => setIsCreateDialogOpen(true)} />
            </div>
          </div>
        )}
      </section>

      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="flex max-h-[85dvh] flex-col overflow-hidden p-0 sm:max-w-[700px]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Start New Discussion</DialogTitle>
          {/* Header with user info and close button */}
          <div className="shrink-0 border-b p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/founder.png" alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg">{user?.name || "User"}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-0">
            {/* Title input */}
            <div className="mb-3">
              <Input
                placeholder="Add a title..."
                value={newPostTitle}
                onChange={(e) => {
                  setNewPostTitle(e.target.value);
                  if (titleError) setTitleError("");
                }}
                disabled={createPostMutation.isPending}
                className={cn("placeholder:text-lg placeholder:font-medium placeholder:text-black text-black text-lg font-medium", titleError && "border-destructive focus-visible:ring-destructive/50")}
              />
              {titleError && <p className="text-sm text-destructive mt-1">{titleError}</p>}
            </div>

            {/* Rich text editor for content */}
            <div className="h-[min(350px,45vh)] min-h-[220px]">
              <RichTextEditor
                value={newPostContent}
                onChange={(value) => {
                  setNewPostContent(value);
                  if (contentError) setContentError("");
                }}
                attachments={newPostAttachments}
                onAttachmentsChange={setNewPostAttachments}
                placeholder="Write your post content here..."
                disabled={createPostMutation.isPending}
                className={cn(contentError && "border-destructive")}
              />
              {contentError && <p className="text-sm text-destructive mt-1">{contentError}</p>}
            </div>
          </div>

          {/* Footer with submit button */}
          <div className="flex shrink-0 justify-end border-t p-4">
            <Button onClick={handleCreatePost} disabled={createPostMutation.isPending} className="bg-blue-500 hover:bg-blue-600">
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Post...
                </>
              ) : (
                "Make a Post"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

// Preview Section Component
function PreviewSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [plans, setPlans] = useState<APIForumPost[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const createCheckout = useCreateCheckout();

  useEffect(() => {
    if (isAuthenticated) {
      async function fetchPlans() {
        setIsLoadingPlans(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api"}/subscriptions/plans`);
          const data = await response.json();
          if (data.success) {
            setPlans(data.data);
          }
        } catch (error) {
          console.error("Failed to fetch plans:", error);
        } finally {
          setIsLoadingPlans(false);
        }
      }
      fetchPlans();
    }
  }, [isAuthenticated]);

  const handleSubscribeClick = () => {
    if (isAuthenticated) {
      // Find the first paid plan
      const paidPlan = plans.find((plan: any) => plan.price > 0);
      if (paidPlan) {
        createCheckout.mutate({
          planId: (paidPlan as any).id,
          successUrl: `${window.location.origin}/forum?success=true`,
          cancelUrl: `${window.location.origin}/forum`,
        });
      }
    } else {
      // Redirect to pricing page for non-authenticated users
      window.location.href = "/#pricing";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-center -mb-4 relative z-10">
        <div className="w-12 h-12 bg-[#F4B400] rounded-full flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="relative rounded-lg overflow-hidden shadow-lg">
        <Image src="/forum-placeholder.png" alt="Forum preview" width={1200} height={800} className="w-full h-auto" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-8">
          <div className="text-center">
            <p className="text-white text-lg font-medium mb-4">Upgrade your plan to gain access</p>
            <div className="flex gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="bg-white hover:bg-gray-100">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-blue-500 hover:bg-blue-600">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSubscribeClick} disabled={isLoadingPlans || createCheckout.isPending}>
                  {isLoadingPlans || createCheckout.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ filters, selectedFilter, onFilterChange, onCreatePost }: { filters: { key: FilterType; label: string; icon: React.ReactNode; badge?: number }[]; selectedFilter: FilterType; onFilterChange: (filter: FilterType) => void; onCreatePost: () => void }) {
  return (
    <div className="space-y-4">
      <Button onClick={onCreatePost} className="w-full bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50">
        Start New Discussion
      </Button>
      <div className="bg-gray-50 rounded-lg p-2">
        {filters.map((filter) => (
          <button key={filter.key} onClick={() => onFilterChange(filter.key)} className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors", selectedFilter === filter.key ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100")}>
            <div className="flex items-center gap-2">
              {filter.icon}
              {filter.label}
            </div>
            {filter.badge && <span className="bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full">{filter.badge}</span>}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Bookmark className="w-4 h-4" />
          <span>Bookmark</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookmarkCheck className="w-4 h-4 text-blue-500" />
          <span>Bookmarked</span>
        </div>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex gap-4">
        <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0">
          <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900">{post.title}</h3>
            <div className="flex items-center gap-2">
              {post.isAnnouncement && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Announcement
                </span>
              )}
              {post.isNew && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">New</span>}
              {post.isAdmin && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">Admin</span>}
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{stripHtmlTags(post.content)}</p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {post.author.name}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {post.participants.slice(0, 3).map((avatar, i) => (
                  <div key={i} className="w-6 h-6 relative rounded-full overflow-hidden border-2 border-white">
                    <Image src={avatar} alt="" fill className="object-cover" />
                  </div>
                ))}
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs border-2 border-white">
                  <MoreHorizontal className="w-3 h-3" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageCircle className="w-4 h-4" />+{post.commentCount} Comments
              </div>
              {post.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <PaperclipIcon className="w-4 h-4" />
                  {post.attachments.length} {post.attachments.length === 1 ? "Attachment" : "Attachments"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Post Detail Component
interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onToggleBookmark: () => void;
  onTogglePostLike: (isLike: boolean) => void;
  onToggleLike: (commentId: string, isLike: boolean) => void;
  onAddReply: (content: string, onSuccess?: () => void) => void;
  isAddingReply?: boolean;
}

function PostDetail({ post, onBack, onToggleBookmark, onTogglePostLike, onToggleLike, onAddReply, isAddingReply }: PostDetailProps) {
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

  const validateReplyContent = (content: string): boolean => {
    if (!content.trim()) {
      return false;
    }
    return true;
  };

  const handleSubmitComment = () => {
    setCommentError("");
    if (!validateReplyContent(commentText)) {
      setCommentError("Comment cannot be empty");
      return;
    }
    onAddReply(commentText, () => {
      setCommentText("");
      setCommentError("");
    });
  };

  const handleCommentTextChange = (value: string) => {
    setCommentText(value);
    if (commentError) setCommentError("");
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to discussions
      </button>

      {/* Post Header */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 relative rounded-full overflow-hidden">
            <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.author.name}</span>
              {post.isAnnouncement && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Announcement
                </span>
              )}
              {post.isAdmin && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">Admin</span>}
              <span className="text-gray-500 text-sm">• {post.createdAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onToggleBookmark} className={cn("p-2 rounded-lg transition-colors", post.isBookmarked ? "text-blue-500 bg-blue-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200")}>
              {post.isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">{post.title}</h2>
        <ForumPostContent content={post.content} className="text-gray-700" />

        {/* Post Reactions */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <button onClick={() => onTogglePostLike(true)} className={cn("flex items-center gap-1", post.userLiked ? "text-blue-500" : "text-gray-500 hover:text-blue-500")}>
            <ThumbsUp className={cn("w-5 h-5", post.userLiked && "fill-current")} />
            <span className="text-sm">{post.likes}</span>
          </button>
          <button onClick={() => onTogglePostLike(false)} className={cn("flex items-center gap-1", post.userDisliked ? "text-red-500" : "text-gray-500 hover:text-red-500")}>
            <ThumbsDown className={cn("w-5 h-5", post.userDisliked && "fill-current")} />
            <span className="text-sm">{post.dislikes}</span>
          </button>
        </div>

        {/* Attachments */}
        {post.attachments.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <PaperclipIcon className="w-4 h-4" />
              Attachments ({post.attachments.length})
            </h4>
            <div className="space-y-2">
              {post.attachments.map((attachment) => (
                <a key={attachment.id} href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <PaperclipIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="space-y-1">
        <div className="relative">
          <Input placeholder="Drop a comment" value={commentText} onChange={(e) => handleCommentTextChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !isAddingReply && handleSubmitComment()} className={cn("pr-12 bg-gray-100 border-0", commentError && "border border-red-500 focus-visible:ring-red-500")} disabled={isAddingReply} />
          <button onClick={handleSubmitComment} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 disabled:opacity-50" disabled={isAddingReply}>
            {isAddingReply ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        {commentError && <p className="text-sm text-red-500">{commentError}</p>}
      </div>

      {/* Comments */}
      <div className="space-y-4">
        {post.comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} onToggleLike={onToggleLike} />
        ))}
      </div>
    </div>
  );
}

// Comment Card Component
interface CommentCardProps {
  comment: Reply;
  onToggleLike: (commentId: string, isLike: boolean) => void;
}

function CommentCard({ comment, onToggleLike }: CommentCardProps) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 relative rounded-full overflow-hidden shrink-0">
        <Image src={comment.author.avatar} alt={comment.author.name} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{comment.author.name}</span>
          <span className="text-gray-500 text-xs">• {comment.createdAt}</span>
        </div>
        <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
        <div className="flex items-center gap-4 text-sm">
          <button onClick={() => onToggleLike(comment.id, true)} className={cn("flex items-center gap-1", comment.userLiked ? "text-blue-500" : "text-gray-500 hover:text-blue-500")}>
            <ThumbsUp className={cn("w-4 h-4", comment.userLiked && "fill-current")} />
            {comment.likes}
          </button>
          <button onClick={() => onToggleLike(comment.id, false)} className={cn("flex items-center gap-1", comment.userDisliked ? "text-red-500" : "text-gray-500 hover:text-red-500")}>
            <ThumbsDown className={cn("w-4 h-4", comment.userDisliked && "fill-current")} />
            {comment.dislikes}
          </button>
        </div>
      </div>
    </div>
  );
}
