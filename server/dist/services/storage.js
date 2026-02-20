"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = exports.StorageFolders = exports.ALLOWED_THUMBNAIL_FORMATS = exports.ALLOWED_VIDEO_FORMATS = exports.THUMBNAIL_UPLOAD_MAX_SIZE = exports.VIDEO_UPLOAD_MAX_SIZE = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
// Cloudflare R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
// Initialize S3 client for R2
const s3Client = new client_s3_1.S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});
// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/csv", "application/zip", "application/x-rar-compressed", "application/vnd.rar"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
// Specific limits for video management feature (Requirements 6.2, 6.3)
exports.VIDEO_UPLOAD_MAX_SIZE = 100 * 1024 * 1024; // 100MB for video files
exports.THUMBNAIL_UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB for thumbnails
exports.ALLOWED_VIDEO_FORMATS = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
exports.ALLOWED_THUMBNAIL_FORMATS = ["image/jpeg", "image/png", "image/webp"];
// Storage folders for different features
exports.StorageFolders = {
    EVENTS: "events",
    VIDEOS: "videos",
    USERS: "users",
    FORUM: "forum",
    VALUATIONS: "valuations",
};
class StorageService {
    /**
     * Check if R2 is configured
     */
    static isConfigured() {
        return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);
    }
    /**
     * Validate file type
     */
    static validateFileType(file, allowedType) {
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
        const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
        if (allowedType === "image" && !isImage) {
            throw new Error(`Invalid file type. Allowed: JPEG, PNG, GIF, WebP.`);
        }
        if (allowedType === "video" && !isVideo) {
            throw new Error(`Invalid file type. Allowed: MP4, WebM, QuickTime.`);
        }
        if (allowedType === "document" && !isDocument) {
            throw new Error(`Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR.`);
        }
        if (allowedType === "any" && !isImage && !isVideo && !isDocument) {
            throw new Error(`Invalid file type: ${file.mimetype}. Allowed: images, videos, and documents.`);
        }
    }
    /**
     * Validate file size
     */
    static validateFileSize(file) {
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
        const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
        if (isImage && file.size > MAX_IMAGE_SIZE) {
            throw new Error(`Image size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit.`);
        }
        if (isVideo && file.size > MAX_VIDEO_SIZE) {
            throw new Error(`Video size exceeds ${MAX_VIDEO_SIZE / 1024 / 1024}MB limit.`);
        }
        if (isDocument && file.size > MAX_DOCUMENT_SIZE) {
            throw new Error(`Document size exceeds ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB limit.`);
        }
    }
    /**
     * Upload a file to R2
     * @param file - The file to upload
     * @param folder - The folder to store the file in (e.g., "events", "videos")
     * @param allowedType - Type of file allowed ("image", "video", or "any")
     */
    static async upload(file, folder, allowedType = "any") {
        if (!this.isConfigured()) {
            throw new Error("R2 storage is not configured. Please set environment variables.");
        }
        // Validate file
        this.validateFileType(file, allowedType);
        this.validateFileSize(file);
        // Generate unique filename
        const ext = path_1.default.extname(file.originalname);
        const uniqueId = (0, crypto_1.randomUUID)();
        const key = `${folder}/${uniqueId}${ext}`;
        // Upload to R2
        const command = new client_s3_1.PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        await s3Client.send(command);
        // Construct public URL
        const url = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
        return {
            url,
            key,
            size: file.size,
            contentType: file.mimetype,
        };
    }
    /**
     * Upload to events folder (images only)
     */
    static async uploadEventImage(file) {
        return this.upload(file, exports.StorageFolders.EVENTS, "image");
    }
    /**
     * Upload to videos folder (videos only)
     * Requirements: 6.1, 6.2, 6.3
     */
    static async uploadVideo(file) {
        // Validate video-specific constraints
        if (!exports.ALLOWED_VIDEO_FORMATS.includes(file.mimetype)) {
            throw new Error(`Invalid video format. Allowed: MP4, WebM, OGG, MOV.`);
        }
        if (file.size > exports.VIDEO_UPLOAD_MAX_SIZE) {
            throw new Error(`Video size exceeds ${exports.VIDEO_UPLOAD_MAX_SIZE / 1024 / 1024}MB limit.`);
        }
        return this.upload(file, exports.StorageFolders.VIDEOS, "video");
    }
    /**
     * Upload video thumbnail to videos folder (images only)
     * Requirements: 6.4
     */
    static async uploadVideoThumbnail(file) {
        // Validate thumbnail-specific constraints
        if (!exports.ALLOWED_THUMBNAIL_FORMATS.includes(file.mimetype)) {
            throw new Error(`Invalid thumbnail format. Allowed: JPEG, PNG, WebP.`);
        }
        if (file.size > exports.THUMBNAIL_UPLOAD_MAX_SIZE) {
            throw new Error(`Thumbnail size exceeds ${exports.THUMBNAIL_UPLOAD_MAX_SIZE / 1024 / 1024}MB limit.`);
        }
        return this.upload(file, exports.StorageFolders.VIDEOS, "image");
    }
    /**
     * Upload to users folder (images only - avatars, etc.)
     */
    static async uploadUserImage(file) {
        return this.upload(file, exports.StorageFolders.USERS, "image");
    }
    /**
     * Upload to forum folder (images and videos)
     */
    static async uploadForumMedia(file) {
        return this.upload(file, exports.StorageFolders.FORUM, "any");
    }
    /**
     * Upload PDF buffer to valuations folder
     * @param pdfBuffer - The PDF buffer to upload
     * @param filename - The filename for the PDF
     */
    static async uploadPDF(pdfBuffer, filename) {
        if (!this.isConfigured()) {
            throw new Error("R2 storage is not configured. Please set environment variables.");
        }
        // Generate unique filename
        const uniqueId = (0, crypto_1.randomUUID)();
        const key = `${exports.StorageFolders.VALUATIONS}/${uniqueId}-${filename}`;
        // Upload to R2
        const command = new client_s3_1.PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: pdfBuffer,
            ContentType: "application/pdf",
        });
        await s3Client.send(command);
        // Construct public URL
        const url = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
        return {
            url,
            key,
            size: pdfBuffer.length,
            contentType: "application/pdf",
        };
    }
    /**
     * Delete a file from R2
     */
    static async deleteFile(key) {
        if (!this.isConfigured()) {
            throw new Error("R2 storage is not configured.");
        }
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
    }
    /**
     * Extract key from URL
     */
    static getKeyFromUrl(url) {
        if (!url)
            return null;
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.slice(1);
        }
        catch {
            return null;
        }
    }
}
exports.StorageService = StorageService;
