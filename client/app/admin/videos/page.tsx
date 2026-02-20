"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutGrid, List, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditIcon from "@/app/assets/edit.svg";
import DeleteIcon from "@/app/assets/delete.svg";
import AddNewVideo from "@/components/general-ui/admin-components/videos-components/AddNewVideo";
import { useVideos, useDeleteVideo } from "@/app/hooks/useVideos";
import type { Video, VideoCategory } from "@/app/services/videos";

interface VideoCardProps {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function VideoCard({ video, onEdit, onDelete, isDeleting }: VideoCardProps) {
  const [hoverCard, setHoverCard] = useState(false);

  const getCategoryColor = (category: string) => {
    return category === "training" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
  };

  const displayCategory = video.category.toUpperCase();

  return (
    <div className="relative" onMouseEnter={() => setHoverCard(true)} onMouseLeave={() => setHoverCard(false)}>
      {/* Hover Actions */}
      <div className={`absolute left-3 flex items-center bg-slate-700 rounded-sm duration-300 ease-in-out transition-all transform z-10 ${hoverCard ? "-top-4 opacity-100 scale-100" : "-top-2 opacity-0 scale-95 pointer-events-none"}`}>
        <button className="flex items-center justify-center w-10 h-8 rounded-l-sm hover:bg-slate-600 transition-colors" onClick={() => onEdit(video)}>
          <Image src={EditIcon} alt="Edit" width={18} height={18} />
        </button>
        <button className="flex items-center justify-center w-10 h-8 rounded-r-sm hover:bg-slate-600 transition-colors" onClick={() => onDelete(video.id)} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Image src={DeleteIcon} alt="Delete" width={18} height={18} />}
        </button>
      </div>

      {/* Video Card */}
      <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div className="relative h-48 bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          {video.thumbnail ? (
            <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
          ) : (
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-3 bg-white/80 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-sm font-medium text-slate-700">Video</p>
            </div>
          )}
          <Badge className={`absolute top-3 left-3 ${getCategoryColor(video.category)}`}>{displayCategory}</Badge>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-base mb-2">{video.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{video.description}</p>
        </div>
      </div>
    </div>
  );
}

interface VideoListItemProps {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function VideoListItem({ video, onEdit, onDelete, isDeleting }: VideoListItemProps) {
  const [hoverCard, setHoverCard] = useState(false);

  const getCategoryColor = (category: string) => {
    return category === "training" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
  };

  const displayCategory = video.category.toUpperCase();

  return (
    <div className="relative" onMouseEnter={() => setHoverCard(true)} onMouseLeave={() => setHoverCard(false)}>
      {/* Hover Actions */}
      <div className={`absolute left-3 flex items-center bg-slate-700 rounded-sm duration-300 ease-in-out transition-all transform z-10 ${hoverCard ? "top-3 opacity-100 scale-100" : "top-1 opacity-0 scale-95 pointer-events-none"}`}>
        <button className="flex items-center justify-center w-10 h-8 rounded-l-sm hover:bg-slate-600 transition-colors" onClick={() => onEdit(video)}>
          <Image src={EditIcon} alt="Edit" width={18} height={18} />
        </button>
        <button className="flex items-center justify-center w-10 h-8 rounded-r-sm hover:bg-slate-600 transition-colors" onClick={() => onDelete(video.id)} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Image src={DeleteIcon} alt="Delete" width={18} height={18} />}
        </button>
      </div>

      {/* List Item */}
      <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-32 h-24 bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded shrink-0">
          {video.thumbnail ? (
            <Image src={video.thumbnail} alt={video.title} fill className="object-cover rounded" />
          ) : (
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-semibold text-base">{video.title}</h3>
            <Badge className={getCategoryColor(video.category)}>{displayCategory}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function VideosPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<VideoCategory | undefined>();
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const limit = 9;

  const { data, isLoading, error } = useVideos({
    page,
    limit,
    category: categoryFilter,
  });

  const deleteVideoMutation = useDeleteVideo();

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    // The edit modal will be handled by AddNewVideo component
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    setDeletingId(id);
    try {
      await deleteVideoMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const videos = data?.videos ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 3;

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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error loading videos</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Management</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your video content</p>
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

      {/* Category Filter */}
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : videos.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No videos found</p>
          <AddNewVideo editVideo={editingVideo} onClose={() => setEditingVideo(null)} />
        </div>
      ) : (
        /* Video Grid or List */
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} onEdit={handleEdit} onDelete={handleDelete} isDeleting={deletingId === video.id} />
              ))}
              <AddNewVideo editVideo={editingVideo} onClose={() => setEditingVideo(null)} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {videos.map((video) => (
                  <VideoListItem key={video.id} video={video} onEdit={handleEdit} onDelete={handleDelete} isDeleting={deletingId === video.id} />
                ))}
              </div>
              <AddNewVideo editVideo={editingVideo} onClose={() => setEditingVideo(null)} />
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">{total} items</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              ←
            </Button>
            {getPageNumbers().map((pageNum) => (
              <Button key={pageNum} variant="outline" size="sm" className={pageNum === page ? "bg-primary text-primary-foreground" : ""} onClick={() => handlePageChange(pageNum)}>
                {pageNum}
              </Button>
            ))}
            <Button variant="outline" size="icon" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
