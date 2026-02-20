"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bold, Italic, Underline, Image as ImageIcon, Paperclip, Link, X, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadApi } from "@/app/services/events";
import { toast } from "sonner";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const FONT_FAMILIES = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
];

const FONT_SIZES = [
  { value: "12px", label: "12" },
  { value: "14px", label: "14" },
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "20px", label: "20" },
  { value: "24px", label: "24" },
];

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({ icon, tooltip, onClick, active, disabled }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClick} disabled={disabled} className={cn("h-8 w-8", active && "bg-muted")}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * RichTextEditor component with formatting toolbar.
 * Gmail-style: images inline in content, attachments in separate section below.
 */
export function RichTextEditor({ value, onChange, attachments = [], onAttachmentsChange, placeholder = "Write your content here...", disabled = false, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("16px");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [hoveredLink, setHoveredLink] = useState<{ url: string; x: number; y: number } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const savedSelection = useRef<Range | null>(null);
  const isInternalChange = useRef(false);

  // Sync external value changes to the editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const execCommand = useCallback((command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleBold = useCallback(() => execCommand("bold"), [execCommand]);
  const handleItalic = useCallback(() => execCommand("italic"), [execCommand]);
  const handleUnderline = useCallback(() => execCommand("underline"), [execCommand]);

  const handleFontFamilyChange = useCallback(
    (val: string) => {
      setFontFamily(val);
      execCommand("fontName", val);
    },
    [execCommand]
  );

  const handleFontSizeChange = useCallback((val: string) => {
    setFontSize(val);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement("span");
        span.style.fontSize = val;
        range.surroundContents(span);
      }
    }
    editorRef.current?.focus();
  }, []);

  // Insert image inline
  const handleInsertImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingImage(true);
      try {
        // Upload to Cloudflare
        const result = await UploadApi.uploadForumMedia(file);

        editorRef.current?.focus();
        // Insert image with Cloudflare URL
        const imgHtml = `<img src="${result.url}" alt="${file.name}" style="max-width: 100%; height: auto; display: block; margin: 8px 0; border-radius: 4px;" /><p><br></p>`;
        document.execCommand("insertHTML", false, imgHtml);
        handleInput();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to upload image");
      } finally {
        setIsUploadingImage(false);
        e.target.value = "";
      }
    },
    [handleInput]
  );

  // Add attachment to list (Gmail-style)
  const handleInsertAttachment = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onAttachmentsChange) return;

      setIsUploadingFile(true);
      try {
        // Upload to Cloudflare
        const result = await UploadApi.uploadForumMedia(file);

        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          size: result.size,
          type: result.contentType,
          url: result.url,
        };
        onAttachmentsChange([...attachments, newAttachment]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to upload file");
      } finally {
        setIsUploadingFile(false);
        e.target.value = "";
      }
    },
    [attachments, onAttachmentsChange]
  );

  const handleRemoveAttachment = useCallback(
    (id: string) => {
      if (onAttachmentsChange) {
        onAttachmentsChange(attachments.filter((a) => a.id !== id));
      }
    },
    [attachments, onAttachmentsChange]
  );

  // Save selection before opening link popover
  const handleLinkButtonClick = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0).cloneRange();
      // Pre-fill link text with selected text
      const selectedText = selection.toString();
      setLinkText(selectedText);
    }
    setLinkUrl("");
    setLinkPopoverOpen(true);
  }, []);

  // Insert link with the saved selection
  const handleInsertLink = useCallback(() => {
    if (!linkUrl.trim()) return;

    editorRef.current?.focus();

    // Restore selection
    if (savedSelection.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection.current);
      }
    }

    // If there's link text and no selection, insert the text with link
    const selection = window.getSelection();
    const hasSelection = selection && !selection.isCollapsed;

    if (!hasSelection && linkText.trim()) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      document.execCommand("insertHTML", false, linkHtml);
    } else {
      // Apply link to selected text
      document.execCommand("createLink", false, linkUrl);
      // Make links open in new tab
      const links = editorRef.current?.querySelectorAll('a[href="' + linkUrl + '"]');
      links?.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });
    }

    handleInput();
    setLinkPopoverOpen(false);
    setLinkUrl("");
    setLinkText("");
    savedSelection.current = null;
  }, [linkUrl, linkText, handleInput]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  // Handle click on links (Ctrl/Cmd + click to open)
  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");

    if (link && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (href) {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    }
  }, []);

  // Handle mouse over links to show tooltip
  const handleEditorMouseOver = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");

    if (link) {
      const href = link.getAttribute("href");
      if (href) {
        const rect = link.getBoundingClientRect();
        setHoveredLink({
          url: href,
          x: rect.left,
          y: rect.bottom + 4,
        });
      }
    }
  }, []);

  const handleEditorMouseOut = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;

    // Check if we're leaving a link and not entering the tooltip
    if (target.closest("a") && !relatedTarget?.closest(".link-tooltip")) {
      setHoveredLink(null);
    }
  }, []);

  return (
    <div className={cn("h-full border rounded-md flex flex-col", className)}>
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar" onChange={handleFileChange} className="hidden" />

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap shrink-0">
        <Select value={fontFamily} onValueChange={handleFontFamilyChange} disabled={disabled}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fontSize} onValueChange={handleFontSizeChange} disabled={disabled}>
          <SelectTrigger className="w-[70px] h-8 text-xs">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton icon={<Bold className="h-4 w-4" />} tooltip="Bold" onClick={handleBold} disabled={disabled} />
        <ToolbarButton icon={<Italic className="h-4 w-4" />} tooltip="Italic" onClick={handleItalic} disabled={disabled} />
        <ToolbarButton icon={<Underline className="h-4 w-4" />} tooltip="Underline" onClick={handleUnderline} disabled={disabled} />

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton icon={isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />} tooltip={isUploadingImage ? "Uploading..." : "Insert Image"} onClick={handleInsertImage} disabled={disabled || isUploadingImage} />
        <ToolbarButton icon={isUploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />} tooltip={isUploadingFile ? "Uploading..." : "Attach File"} onClick={handleInsertAttachment} disabled={disabled || !onAttachmentsChange || isUploadingFile} />

        {/* Link Popover */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <span>
              <ToolbarButton icon={<Link className="h-4 w-4" />} tooltip="Insert Link" onClick={handleLinkButtonClick} disabled={disabled} />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="link-text" className="text-sm font-medium">
                  Text
                </Label>
                <Input id="link-text" placeholder="Link text (optional)" value={linkText} onChange={(e) => setLinkText(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="link-url" className="text-sm font-medium">
                  URL
                </Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInsertLink();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLinkPopoverOpen(false);
                    setLinkUrl("");
                    setLinkText("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={handleInsertLink} disabled={!linkUrl.trim()}>
                  Insert
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Content Area */}
      <div ref={editorRef} contentEditable={!disabled} dir="ltr" onInput={handleInput} onPaste={handlePaste} onClick={handleEditorClick} onMouseOver={handleEditorMouseOver} onMouseOut={handleEditorMouseOut} className={cn("rich-text-editor flex-1 min-h-[150px] p-4 outline-none overflow-y-auto", "focus:ring-2 focus:ring-ring focus:ring-offset-2", disabled && "opacity-50 cursor-not-allowed bg-muted/50", !value && "text-muted-foreground")} style={{ fontFamily, fontSize }} data-placeholder={placeholder} suppressContentEditableWarning />

      {/* Link hover tooltip */}
      {hoveredLink && (
        <div className="link-tooltip fixed z-50 bg-popover border rounded-md shadow-md p-2 text-sm flex items-center gap-2 max-w-[300px]" style={{ left: hoveredLink.x, top: hoveredLink.y }} onMouseLeave={() => setHoveredLink(null)}>
          <span className="truncate text-muted-foreground flex-1">{hoveredLink.url}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 shrink-0"
            onClick={() => {
              window.open(hoveredLink.url, "_blank", "noopener,noreferrer");
              setHoveredLink(null);
            }}
          >
            Open
          </Button>
        </div>
      )}

      {/* Attachments Section (Gmail-style) */}
      {attachments.length > 0 && (
        <div className="border-t p-2 bg-muted/20 shrink-0">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg text-sm group hover:border-primary/50 transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <a href={attachment.url} download={attachment.name} className="font-medium truncate max-w-[150px] hover:underline" title={attachment.name}>
                    {attachment.name}
                  </a>
                  <span className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</span>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveAttachment(attachment.id)} disabled={disabled} className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
