"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Plus, Upload, X, Video as VideoIcon, Loader2 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateVideo, useUpdateVideo, useUploadVideo, useUploadThumbnail } from "@/app/hooks/useVideos";
import type { Video, VideoCategory } from "@/app/services/videos";

interface AddNewVideoProps {
  editVideo?: Video | null;
  onClose?: () => void;
}

export default function AddNewVideo({ editVideo, onClose }: AddNewVideoProps) {
  const [category, setCategory] = useState<VideoCategory>("educational");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const createVideoMutation = useCreateVideo();
  const updateVideoMutation = useUpdateVideo();
  const uploadVideoMutation = useUploadVideo();
  const uploadThumbnailMutation = useUploadThumbnail();

  const isUploading = uploadVideoMutation.isPending || uploadThumbnailMutation.isPending;
  const isSubmitting = createVideoMutation.isPending || updateVideoMutation.isPending;

  const openModal = () => {
    setOpen(true);
    setTimeout(() => setIsAnimating(true), 10);
  };

  // Handle edit mode - populate form when editVideo changes
  useEffect(() => {
    if (editVideo) {
      // Use requestAnimationFrame to batch state updates
      requestAnimationFrame(() => {
        setCategory(editVideo.category);
        setTitle(editVideo.title);
        setDescription(editVideo.description);
        setVideoUrl(editVideo.videoUrl);
        setThumbnailUrl(editVideo.thumbnail);
        setVideoDuration(editVideo.duration);
        openModal();
      });
    }
  }, [editVideo]);

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setOpen(false);
      resetForm();
      onClose?.();
    }, 300);
  };

  const resetForm = () => {
    setCategory("educational");
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setVideoPreview(null);
    setVideoUrl(null);
    setVideoName("");
    setVideoDuration(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setThumbnailUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoSelect(file);
    }
  };

  const handleVideoSelect = (file: File) => {
    setUploadError(null);

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid video file (MP4, WebM, OGG, MOV)");
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError("Video must be less than 100MB");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
    setVideoFile(file);
    setVideoName(file.name);

    // Extract video duration
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = Math.floor(videoElement.duration);
      setVideoDuration(duration);
    };
    videoElement.src = previewUrl;
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPEG, PNG, WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Thumbnail must be less than 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
    setThumbnailFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleVideoSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setVideoUrl(null);
    setVideoName("");
    setVideoDuration(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setUploadError(null);

    // Validate required fields
    if (!title.trim()) {
      setUploadError("Please enter a video title");
      return;
    }
    if (!description.trim()) {
      setUploadError("Please enter a video description");
      return;
    }

    try {
      let finalVideoUrl = videoUrl;
      let finalThumbnailUrl = thumbnailUrl;

      // Upload video file if new file selected
      if (videoFile) {
        const uploadResult = await uploadVideoMutation.mutateAsync(videoFile);
        finalVideoUrl = uploadResult.url;
      }

      // Upload thumbnail if new file selected
      if (thumbnailFile) {
        const uploadResult = await uploadThumbnailMutation.mutateAsync(thumbnailFile);
        finalThumbnailUrl = uploadResult.url;
      }

      // Validate video URL exists
      if (!finalVideoUrl) {
        setUploadError("Please upload a video file");
        return;
      }

      if (editVideo) {
        // Update existing video
        await updateVideoMutation.mutateAsync({
          id: editVideo.id,
          input: {
            title: title.trim(),
            description: description.trim(),
            category,
            videoUrl: finalVideoUrl,
            thumbnail: finalThumbnailUrl,
            duration: videoDuration,
          },
        });
      } else {
        // Create new video
        await createVideoMutation.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          category,
          videoUrl: finalVideoUrl,
          thumbnail: finalThumbnailUrl,
          duration: videoDuration,
        });
      }

      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        setUploadError(error.message);
      } else {
        setUploadError("An error occurred while saving the video");
      }
    }
  };

  return (
    <>
      <div className="border-2 border-dashed rounded-lg h-full min-h-[200px] flex flex-col items-center justify-center hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer" onClick={openModal}>
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-white" />
        </div>
        <p className="font-semibold text-slate-900">Upload New Video</p>
      </div>

      {/* Modal Overlay */}
      {open && (
        <div className={`bg-black/50 fixed top-0 left-0 w-full h-full z-50 flex justify-center items-start overflow-y-auto py-12 transition-all duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}>
          {/* Modal Content */}
          <div className={`flex w-[450px] flex-col items-start relative bg-white rounded-md transition-all duration-300 transform my-auto ${isAnimating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`} onClick={(e) => e.stopPropagation()}>
            <button className="w-[40px] h-[40px] p-1 rounded-full flex justify-center items-center shadow-md bg-white absolute -top-5 left-1/2 transform -translate-x-1/2 z-10 hover:bg-gray-200 transition-colors duration-200" onClick={closeModal}>
              <X className="h-5 w-5" />
            </button>
            <div className="flex w-full pt-[32px] p-[16px] flex-col items-start gap-[16px] max-h-[calc(100vh-6rem)] overflow-y-auto">
              <h2 className="text-lg font-semibold w-full text-center">{editVideo ? "Edit Video" : "Upload New Video"}</h2>

              {/* Category Select */}
              <Select value={category} onValueChange={(v: VideoCategory) => setCategory(v)}>
                <SelectTrigger className="w-full bg-gray-50">
                  <SelectValue placeholder="CHOOSE CATEGORY" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>

              {/* Video Upload */}
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileInputChange} className="hidden" />
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Video</label>
                {videoPreview || videoUrl ? (
                  <div className="relative rounded-xl overflow-hidden w-full shadow-sm border border-gray-100">
                    {videoPreview ? (
                      <video src={videoPreview} className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <VideoIcon className="h-14 w-14 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent flex items-end justify-between p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <VideoIcon className="h-4 w-4 text-white" />
                        </div>
                        {videoName && <span className="text-white text-xs font-medium truncate max-w-[140px]">{videoName}</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-2.5 py-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                          <Upload className="h-3 w-3" />
                          Change
                        </button>
                        <button onClick={handleRemoveVideo} disabled={isUploading} className="p-1.5 bg-white/20 backdrop-blur-sm hover:bg-red-500/80 rounded-lg text-white transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`relative rounded-xl p-6 text-center transition-all w-full min-h-[176px] ${isUploading ? "cursor-wait" : "cursor-pointer"} ${isDragging ? "border-2 border-blue-400 bg-blue-50 shadow-lg shadow-blue-100" : "border-2 border-dashed border-gray-200 bg-linear-to-br from-gray-50 to-white hover:border-gray-300 hover:shadow-md"}`} onClick={() => !isUploading && fileInputRef.current?.click()}>
                    <div className="flex flex-col items-center gap-3">
                      {isUploading ? (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Uploading video...</span>
                        </>
                      ) : (
                        <>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-blue-100" : "bg-slate-100"}`}>
                            <Upload className={`h-7 w-7 ${isDragging ? "text-blue-500" : "text-slate-400"}`} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-gray-700 block">{isDragging ? "Drop video here" : "Drag and drop or click to upload"}</span>
                            <span className="text-xs text-gray-400 block">MP4, WebM, OGG, MOV up to 100MB</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Thumbnail (optional)</label>
                {thumbnailPreview || thumbnailUrl ? (
                  <div className="relative rounded-xl overflow-hidden w-full h-28 shadow-sm border border-gray-100 group">
                    <Image src={thumbnailPreview || thumbnailUrl || ""} alt="Thumbnail" fill className="object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                      <button
                        onClick={() => {
                          if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
                          setThumbnailFile(null);
                          setThumbnailPreview(null);
                          setThumbnailUrl(null);
                          if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
                        }}
                        className="p-1.5 bg-white/20 backdrop-blur-sm hover:bg-red-500/80 rounded-lg text-white transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-gray-400" />
                    </div>
                    <span>Click to upload thumbnail</span>
                  </button>
                )}
              </div>

              {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

              <div className="flex items-center gap-x-1.5 bg-gray-50 border border-gray-200 rounded-sm p-2 text-sm w-full">
                <input type="text" placeholder="Enter Video title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent outline-none w-full" />
              </div>

              <div className="flex items-center gap-x-1.5 bg-gray-50 border border-gray-200 rounded-sm p-2 text-sm w-full">
                <textarea placeholder="Enter Video description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-transparent outline-none w-full max-h-96 overflow-auto resize-none" rows={3} />
              </div>

              <button className="bg-(--primary-border-typing) px-4 py-2 rounded-sm text-sm text-white font-bold hover:opacity-90 transition-opacity duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" onClick={handleSubmit} disabled={isUploading || isSubmitting}>
                {isUploading || isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isUploading ? "Uploading..." : "Saving..."}
                  </>
                ) : editVideo ? (
                  "Update Video"
                ) : (
                  "Upload Video"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
