"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForumAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ForumPostContentProps {
  content: string;
  attachments?: ForumAttachment[];
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * ForumPostContent component for rendering rich text content with attachments.
 * Safely renders HTML content and displays attachments in a Gmail-style section.
 */
export function ForumPostContent({ content, attachments = [], className }: ForumPostContentProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Rich text content */}
      <div className="rich-text-content prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

      {/* Attachments section */}
      {attachments.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Attachments ({attachments.length})</h4>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <a key={attachment.id} href={attachment.url} download={attachment.name} className="flex items-center gap-2 px-3 py-2 bg-muted/50 border rounded-lg text-sm hover:bg-muted transition-colors group">
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate max-w-[200px]" title={attachment.name}>
                    {attachment.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ForumPostContent;
