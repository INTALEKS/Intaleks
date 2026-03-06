"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor, Attachment } from "./RichTextEditor";
import type { CreateForumPostInput } from "@/app/services/forum";

export interface AdminUser {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface PostCreationPanelProps {
  adminUser: AdminUser;
  onSubmit: (data: CreateForumPostInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  className?: string;
}

interface ValidationErrors {
  title?: string;
  content?: string;
}

/**
 * Validates post creation input.
 * Returns validation errors for empty or whitespace-only title/content.
 */
export function validatePostInput(title: string, content: string): ValidationErrors {
  const errors: ValidationErrors = {};

  const trimmedTitle = title.trim();
  const trimmedContent = content.replace(/<[^>]*>/g, "").trim(); // Strip HTML tags for validation

  if (!trimmedTitle) {
    errors.title = trimmedTitle === "" && title.length > 0 ? "Title cannot be empty" : "Title is required";
  }

  if (!trimmedContent) {
    errors.content = trimmedContent === "" && content.length > 0 ? "Content cannot be empty" : "Content is required";
  }

  return errors;
}

/**
 * PostCreationPanel component for creating new forum posts.
 * Displays admin info, title input, rich text editor, and submit/cancel buttons.
 */
export function PostCreationPanel({ adminUser, onSubmit, onCancel, isSubmitting, className }: PostCreationPanelProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      // Clear title error when user starts typing
      if (errors.title) {
        setErrors((prev) => ({ ...prev, title: undefined }));
      }
    },
    [errors.title],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      // Clear content error when user starts typing
      if (errors.content) {
        setErrors((prev) => ({ ...prev, content: undefined }));
      }
    },
    [errors.content],
  );

  const handleSubmit = useCallback(() => {
    const validationErrors = validatePostInput(title, content);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Convert Attachment type to match API expectations
    const apiAttachments = attachments.map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size,
      type: att.type,
      url: att.url,
    }));

    onSubmit({ title: title.trim(), content, attachments: apiAttachments, isAnnouncement });
  }, [title, content, attachments, isAnnouncement, onSubmit]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with admin info and close button */}
      <div className="p-2 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {adminUser.avatar && <AvatarImage src={adminUser.avatar} alt={`${adminUser.firstName} ${adminUser.lastName}`} />}
              <AvatarFallback>{getInitials(adminUser.firstName, adminUser.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{`${adminUser.firstName} ${adminUser.lastName}`}</h2>
              <p className="text-sm text-muted-foreground">{adminUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsAnnouncement(!isAnnouncement)} disabled={isSubmitting} aria-label={isAnnouncement ? "Remove announcement" : "Mark as announcement"} className={cn(isAnnouncement && "bg-amber-100 text-amber-700 hover:bg-amber-200")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
                    <path fill={isAnnouncement ? "#b45309" : "#000"} fillRule="evenodd" d="M25.5.5a2 2 0 0 0-2 2v3a2 2 0 1 0 4 0v-3a2 2 0 0 0-2-2m-17 21a2 2 0 1 1 0-4h3a2 2 0 1 1 0 4zm34 0a2 2 0 1 0 0-4h-3a2 2 0 1 0 0 4zM12.064 8.895a2 2 0 0 1 2.829-2.828l2.121 2.12a2 2 0 1 1-2.828 2.83zm26.87-2.828a2 2 0 0 1 0 2.828l-2.122 2.121a2 2 0 1 1-2.828-2.828l2.121-2.121a2 2 0 0 1 2.829 0M25.049 10.04a1.5 1.5 0 0 1 2.119.095l.003.003l.003.004l.01.01l.03.034l.1.117q.13.15.368.447c.319.4.785 1.008 1.398 1.874c1.225 1.73 3.042 4.491 5.446 8.656c2.405 4.164 3.887 7.117 4.773 9.045a41 41 0 0 1 .924 2.147a18 18 0 0 1 .254.687l.014.043l.005.014l.002.007v.002a1.5 1.5 0 0 1-2.85.935c-1.245.418-2.51.83-3.782 1.233a72 72 0 0 0-1.257-2.881a98 98 0 0 0-4.047-7.789a98 98 0 0 0-4.72-7.399a72 72 0 0 0-1.865-2.526c.985-.9 1.974-1.79 2.959-2.659a1.5 1.5 0 0 1 .113-2.099m5.81 25.93q.068.159.133.318c-2.04.625-4.07 1.224-6.032 1.786l.277 1.032a6.59 6.59 0 1 1-12.733 3.412l-.266-.992c-.98.25-1.82.463-2.49.63c-1.649.412-3.445-.144-4.503-1.582c-.38-.518-.805-1.13-1.147-1.724a19 19 0 0 1-.92-1.855c-.716-1.635-.3-3.469.882-4.691c2.61-2.7 8.892-9.116 15.704-15.464l.207.27c.335.442.822 1.098 1.419 1.944a95 95 0 0 1 4.574 7.17a95 95 0 0 1 3.922 7.546c.435.94.76 1.69.974 2.2Zm-14.75 4.546l.259.966a2.59 2.59 0 1 0 5.005-1.34l-.263-.982c-1.787.495-3.472.95-5.001 1.356" clipRule="evenodd" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isAnnouncement ? "Remove announcement" : "Mark as announcement"}</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSubmitting} aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-2 pb-0">
        {/* Title input */}
        <div className="mb-2">
          <Input placeholder="Add a title..." value={title} onChange={handleTitleChange} disabled={isSubmitting} className={cn("placeholder:text-lg placeholder:font-medium placeholder:text-black text-black text-lg! font-medium", errors.title && "border-destructive focus-visible:ring-destructive/50")} aria-invalid={!!errors.title} aria-describedby={errors.title ? "title-error" : undefined} />
          {errors.title && (
            <p id="title-error" className="text-sm text-destructive mt-1">
              {errors.title}
            </p>
          )}
        </div>

        {/* Rich text editor for content */}
        <div className="h-[90%]">
          <RichTextEditor value={content} onChange={handleContentChange} attachments={attachments} onAttachmentsChange={setAttachments} placeholder="Write your post content here..." disabled={isSubmitting} className={cn(errors.content && "border-destructive")} />
          {errors.content && (
            <p id="content-error" className="text-sm text-destructive mt-1">
              {errors.content}
            </p>
          )}
        </div>
      </div>

      {/* Footer with submit button */}
      <div className="p-1 flex flex-col">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="self-end bg-(--primary-border-typing)/80 hover:bg-(--primary-border-typing)">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Post...
            </>
          ) : (
            "Make a Post"
          )}
        </Button>
      </div>
    </div>
  );
}

export default PostCreationPanel;
