import { useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";

import { type Event } from "@/app/admin/events/page";
import { UploadApi } from "@/app/services/events";

interface EventFormPanelProps {
  event?: Event;
  defaultDate?: Date;
  onClose: () => void;
  onSave: (data: Partial<Event>) => void;
  isLoading?: boolean;
}

// Helper to parse time string like "7:00PM" to hours/minutes
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return { hours: 19, minutes: 0 }; // Default 7:00 PM

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
}

// Helper to format time from Date to string like "7:00PM"
function formatTimeString(date: Date): string {
  return format(date, "h:mma");
}

export default function EventFormPanel({ event, defaultDate, onClose, onSave, isLoading }: EventFormPanelProps) {
  const [category, setCategory] = useState<"online" | "in-person" | "">(event?.category || "");
  const [title, setTitle] = useState(event?.title || "");
  const [shortDescription, setShortDescription] = useState(event?.shortDescription || "");
  const [description, setDescription] = useState(event?.description || "");
  const [meetingLink, setMeetingLink] = useState(event?.meetingLink || "");
  const [thumbnail, setThumbnail] = useState<string | undefined>(event?.thumbnail);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize dateTime from event or default
  const [dateTime, setDateTime] = useState<Date>(() => {
    const baseDate = event?.date || defaultDate || new Date();
    const date = new Date(baseDate);

    // If we have a time string, parse and apply it
    if (event?.time) {
      const { hours, minutes } = parseTimeString(event.time);
      date.setHours(hours, minutes, 0, 0);
    } else {
      // Default to 7:00 PM
      date.setHours(19, 0, 0, 0);
    }

    return date;
  });

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Image size should be less than 10MB");
        return;
      }

      setUploadError(null);
      setIsUploading(true);

      try {
        if (thumbnail && thumbnail !== event?.thumbnail) {
          try {
            await UploadApi.deleteFile(thumbnail);
          } catch {
            // Ignore delete errors
          }
        }

        const result = await UploadApi.uploadEventImage(file);
        setThumbnail(result.url);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadError(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [thumbnail, event?.thumbnail],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleRemoveThumbnail = useCallback(async () => {
    if (!thumbnail) return;

    const isNewUpload = thumbnail !== event?.thumbnail;
    if ((isNewUpload && thumbnail.includes("r2.dev")) || thumbnail.includes("cloudflarestorage")) {
      try {
        await UploadApi.deleteFile(thumbnail);
      } catch (error) {
        console.error("Failed to delete file from storage:", error);
      }
    }

    setThumbnail(undefined);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [thumbnail, event?.thumbnail]);

  const handleSubmit = () => {
    if (!title || !category) return;

    onSave({
      title,
      shortDescription,
      description,
      meetingLink: category === "online" ? meetingLink : undefined,
      category: category as "online" | "in-person",
      time: formatTimeString(dateTime),
      date: dateTime,
      thumbnail,
    });
  };

  const isValid = title && category && (category !== "online" || meetingLink);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between py-2 px-3 border-b">
        <span className="text-sm font-medium uppercase">{event ? "Edit Event" : "Add New Event"}</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" disabled={isLoading || isUploading}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Category Select */}
        <Select value={category} onValueChange={(v) => setCategory(v as "online" | "in-person")}>
          <SelectTrigger className="w-full bg-gray-50">
            <SelectValue placeholder="CHOOSE CATEGORY" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="in-person">In-Person</SelectItem>
          </SelectContent>
        </Select>

        {/* Thumbnail Upload */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />

        {thumbnail ? (
          <div className="relative rounded-lg overflow-hidden">
            <Image src={thumbnail} alt="Event thumbnail" width={800} height={160} className="w-full h-40 object-cover" />
            <button onClick={handleRemoveThumbnail} disabled={isUploading} className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white">
              <X className="h-4 w-4" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 hover:bg-black/70 rounded text-white text-xs flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              Change
            </button>
          </div>
        ) : (
          <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isUploading ? "cursor-wait" : "cursor-pointer"} ${isDragging ? "border-cyan-500 bg-cyan-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`} onClick={() => !isUploading && fileInputRef.current?.click()}>
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                  <span className="text-sm text-gray-500">Uploading...</span>
                </>
              ) : (
                <>
                  <div className={`p-3 rounded-full ${isDragging ? "bg-cyan-100" : "bg-white"}`}>
                    <Upload className={`h-6 w-6 ${isDragging ? "text-cyan-500" : "text-gray-400"}`} />
                  </div>
                  <span className="text-sm text-gray-500">{isDragging ? "Drop image here" : "Drag and drop or click to upload"}</span>
                  <span className="text-xs text-gray-400">PNG, JPG, GIF, WebP up to 10MB</span>
                </>
              )}
            </div>
          </div>
        )}

        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

        {/* Title */}
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title (e.g., PITCHING 101)" className="text-lg font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0" />

        {/* Short Description */}
        <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Event Short Description" className="border-0 border-b rounded-none px-0 focus-visible:ring-0 text-gray-500" />

        {/* Description */}
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full event description..." className="min-h-[120px] max-h-60 bg-gray-50" />

        {/* Date & Time */}
        <div className="space-y-1">
          <label className="text-sm text-gray-500">Date & Time</label>
          <DateTimePicker date={dateTime} onSelect={(d) => d && setDateTime(d)} placeholder="Select event date and time" />
        </div>

        {/* Meeting Link or Location */}
        {category === "online" && (
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Meeting Link *</label>
            <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/abc-defg-hij" className="bg-gray-50" />
          </div>
        )}
        {category === "in-person" && (
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Location</label>
            <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="Enter address/location" className="bg-gray-50" />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="p-4 border-t">
        <Button onClick={handleSubmit} disabled={!isValid || isLoading || isUploading} className="w-full bg-cyan-500 hover:bg-cyan-600">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save and Publish"
          )}
        </Button>
      </div>
    </div>
  );
}
