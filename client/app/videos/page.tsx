"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, List, Loader2, Play, Clock, Eye, Crown, ArrowLeft, Info, Volume2, VolumeX, Maximize2, Pause } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { PageHeader } from "@/components/general-ui/PageHeader";
import { FeatureCards } from "@/components/general-ui/FeatureCards";
import { usePublicVideos } from "@/app/hooks/useVideos";
import { useAuthState } from "@/app/hooks/useAuthState";
import { formatDuration, formatViews } from "@/lib/video-utils";
import { useIncrementVideoViews } from "@/app/hooks/useVideos";
import type { Video, VideoCategory } from "@/app/services/videos";

// Format date as relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
};

const getCategoryColor = (category: string) => {
  return category === "training" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-cyan-500 text-white hover:bg-cyan-600";
};

const features = [
  {
    title: "Easy to Understand",
    description: "Clear explanations that break down complex valuation concepts into simple, visual lessons",
    image: "/video-easy-to-understand.png",
  },
  {
    title: "Learn at Your Own Pace",
    description: "Watch, pause, and revisit lessons anytime to fit your schedule and learning speed",
    image: "/video-your-own-pace.png",
  },
  {
    title: "Practical and Actionable",
    description: "Real-world examples that show how valuation concepts apply to actual business decisions",
    image: "/video-practical-actionable.png",
  },
];

export default function VideosPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<VideoCategory | undefined>();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const limit = 12;

  const { isAuthenticated, isAuthentiating, hasActiveSubscription, user } = useAuthState();
  const isAdmin = user?.role === "ADMIN";
  const canAccessVideos = isAdmin || hasActiveSubscription;

  const { data, isLoading, error } = usePublicVideos({
    page,
    limit,
    category: categoryFilter,
  });

  const showPreview = !isAuthentiating && (!isAuthenticated || !canAccessVideos);

  // Hide header/features for subscribed users and admins
  const showHeader = !canAccessVideos;

  const videos = data?.videos ?? [];
  const totalPages = data?.totalPages ?? 1;
  const selectedVideo = selectedVideoId ? videos.find((v) => v.id === selectedVideoId) : null;
  const suggestedVideos = videos.filter((v) => v.id !== selectedVideoId).slice(0, 5);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {showHeader && (
        <>
          <PageHeader
            title={
              <>
                Video <span className="font-bold">lessons</span> to help you
                <br />
                understand business valuation
              </>
            }
            subtitle="Clear video lessons that break down business valuation and the numbers behind company value"
            ctaText="Start Learning"
            ctaHref="#videos"
            altCtaText="Subscribe to Learn"
            altCtaHref="/pricing"
          />
          <FeatureCards features={features} />
        </>
      )}

      <section id="videos" className="flex-1 py-8 px-4 max-w-6xl mx-auto w-full">
        {showPreview ? (
          <PreviewSection isAuthenticated={isAuthenticated} />
        ) : isLoading || isAuthentiating ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">Failed to load videos</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : selectedVideo ? (
          <VideoDetail video={selectedVideo} suggestedVideos={suggestedVideos} onBack={() => setSelectedVideoId(null)} onSelectVideo={setSelectedVideoId} />
        ) : (
          <VideoList videos={videos} viewMode={viewMode} setViewMode={setViewMode} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} page={page} setPage={setPage} totalPages={totalPages} getPageNumbers={getPageNumbers} onSelectVideo={setSelectedVideoId} />
        )}
      </section>

      <Footer />
    </div>
  );
}

// Preview Section for non-subscribed users
function PreviewSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="relative">
      <div className="flex justify-center -mb-4 relative z-10">
        <div className="w-12 h-12 bg-[#F4B400] rounded-full flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="relative rounded-lg overflow-hidden border shadow-lg">
        <Image src="/videos-layout.png" alt="Video lessons preview" width={1200} height={800} className="w-full h-auto" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-8">
          <div className="text-center">
            <p className="text-white text-lg font-medium mb-4">Unlock all Videos now</p>
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
                <Link href="/pricing">
                  <Button className="bg-blue-500 hover:bg-blue-600">View Pricing Plans</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Video List Component
interface VideoListProps {
  videos: Video[];
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  categoryFilter: VideoCategory | undefined;
  setCategoryFilter: (category: VideoCategory | undefined) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  getPageNumbers: () => number[];
  onSelectVideo: (id: string) => void;
}

function VideoList({ videos, viewMode, setViewMode, categoryFilter, setCategoryFilter, page, setPage, totalPages, getPageNumbers, onSelectVideo }: VideoListProps) {
  return (
    <>
      {/* View Toggle and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={categoryFilter === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCategoryFilter(undefined);
              setPage(1);
            }}
          >
            All
          </Button>
          <Button
            variant={categoryFilter === "training" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCategoryFilter("training");
              setPage(1);
            }}
          >
            Training
          </Button>
          <Button
            variant={categoryFilter === "educational" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCategoryFilter("educational");
              setPage(1);
            }}
          >
            Educational
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No videos available yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} onClick={() => onSelectVideo(video.id)} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <VideoListItem key={video.id} video={video} onClick={() => onSelectVideo(video.id)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
              </Button>
              {getPageNumbers().map((pageNum) => (
                <Button key={pageNum} variant="outline" size="sm" className={pageNum === page ? "bg-primary text-primary-foreground" : ""} onClick={() => setPage(pageNum)}>
                  {pageNum}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// Video Card Component (Grid View)
interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

function VideoCard({ video, onClick }: VideoCardProps) {
  const displayCategory = video.category.toUpperCase();

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-video bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
          {video.thumbnail ? (
            <Image src={video.thumbnail} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-2 bg-white/80 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-slate-600">How to</p>
              <p className="text-sm font-medium text-slate-700">Input your</p>
              <p className="text-base font-semibold text-slate-800">Qualitative Data</p>
            </div>
          )}
          <Badge className={`absolute top-3 left-3 ${getCategoryColor(video.category)}`}>{displayCategory}</Badge>
          {video.duration && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-6 h-6 text-blue-500 ml-1" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{video.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViews(video.views)}
            </span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Video List Item Component (List View)
function VideoListItem({ video, onClick }: VideoCardProps) {
  const displayCategory = video.category.toUpperCase();

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{video.title}</h3>
          <Badge className={`shrink-0 text-xs ${getCategoryColor(video.category)}`}>{displayCategory}</Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{video.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
          {video.duration && (
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Video Detail Component with Player and Suggestions
interface VideoDetailProps {
  video: Video;
  suggestedVideos: Video[];
  onBack: () => void;
  onSelectVideo: (id: string) => void;
}

function VideoDetail({ video, suggestedVideos, onBack, onSelectVideo }: VideoDetailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const incrementViewsMutation = useIncrementVideoViews();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();

        // Track view on first play
        if (!hasTrackedView) {
          incrementViewsMutation.mutate(video.id);
          setHasTrackedView(true);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Video Section */}
      <div className="lg:col-span-2 space-y-4">
        {/* Video Player */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {/* Video Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
            <button onClick={onBack} className="flex items-center gap-2 text-white text-sm hover:text-blue-400">
              <ArrowLeft className="w-4 h-4" />
              {video.title}
            </button>
            <button className="text-white hover:text-blue-400">
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Video Area */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {video.videoUrl ? (
              <video ref={videoRef} src={video.videoUrl} className="w-full h-full object-contain" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleVideoEnd} onClick={togglePlay} />
            ) : (
              <div className="text-center text-white">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm opacity-70">Video preview</p>
              </div>
            )}

            {/* Play/Pause Overlay - only show when paused */}
            {!isPlaying && (
              <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-900 ml-1" />
                </div>
              </button>
            )}
          </div>

          {/* Video Controls */}
          <div className="px-4 py-3 bg-gray-800">
            {/* Progress Bar */}
            <div className="relative h-1 bg-gray-600 rounded-full mb-3 cursor-pointer" onClick={handleProgressClick}>
              <div className="absolute h-full bg-white rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
              <div className="absolute w-3 h-3 bg-white rounded-full -top-1" style={{ left: `${(currentTime / duration) * 100}%`, transform: "translateX(-50%)" }} />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="hover:text-blue-400">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button onClick={toggleMute} className="hover:text-blue-400">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={handleFullscreen} className="hover:text-blue-400">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className={getCategoryColor(video.category)}>{video.category.toUpperCase()}</Badge>
              <h1 className="text-xl font-bold mt-2">{video.title}</h1>
            </div>
            <div className="text-sm text-gray-500">
              {formatViews(video.views)} • {formatRelativeTime(video.createdAt)}
            </div>
          </div>
          <p className="text-gray-700">{video.description}</p>
        </div>
      </div>

      {/* Suggested Videos Sidebar */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Suggested Videos</h2>
        <div className="space-y-3">
          {suggestedVideos.map((suggestedVideo) => (
            <SuggestedVideoCard key={suggestedVideo.id} video={suggestedVideo} onClick={() => onSelectVideo(suggestedVideo.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Suggested Video Card Component
interface SuggestedVideoCardProps {
  video: Video;
  onClick: () => void;
}

function SuggestedVideoCard({ video, onClick }: SuggestedVideoCardProps) {
  const displayCategory = video.category.toUpperCase();

  return (
    <div onClick={onClick} className="flex gap-3 cursor-pointer group">
      {/* Thumbnail */}
      <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-linear-to-br from-blue-100 to-blue-200">
        {video.thumbnail ? (
          <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[8px] text-slate-600">How to</p>
              <p className="text-[10px] font-medium text-slate-700">Input your</p>
              <p className="text-xs font-semibold text-slate-800">Qualitative Data</p>
            </div>
          </div>
        )}
        <Badge className={`absolute top-1 left-1 text-[10px] px-1.5 py-0.5 ${getCategoryColor(video.category)}`}>{displayCategory}</Badge>
        {video.duration && (
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            <span>{formatDuration(video.duration)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">{video.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{video.description}</p>
        <div className="text-xs text-muted-foreground mt-1">
          {formatViews(video.views)} • {formatRelativeTime(video.createdAt)}
        </div>
      </div>
    </div>
  );
}
