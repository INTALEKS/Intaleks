"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const db_1 = require("../config/db");
const storage_1 = require("../services/storage");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max for avatars
    },
});
// Validation schemas
const updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required(),
    avatar: joi_1.default.string().uri().optional(),
});
const changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).max(100).required(),
});
/**
 * PATCH /api/users/profile - Update current user's profile
 */
router.patch("/profile", authMiddleware_1.authenticateToken, authMiddleware_1.requireEmailVerified, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { error, value } = updateProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const user = await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: value.name,
                ...(value.avatar && { avatar: value.avatar }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating profile",
        });
    }
});
/**
 * PATCH /api/users/password - Change current user's password
 */
router.patch("/password", authMiddleware_1.authenticateToken, authMiddleware_1.requireEmailVerified, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        // Get user with password
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Verify old password
        const isValidPassword = await bcrypt_1.default.compare(value.oldPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(value.newPassword, 10);
        // Update password
        await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while changing password",
        });
    }
});
/**
 * POST /api/users/avatar - Upload user avatar
 */
router.post("/avatar", authMiddleware_1.authenticateToken, authMiddleware_1.requireEmailVerified, upload.single("file"), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file provided",
            });
        }
        // Validate file type
        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({
                success: false,
                message: "Only image files are allowed",
            });
        }
        // Upload to storage
        const result = await storage_1.StorageService.uploadUserImage(req.file);
        return res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            data: {
                url: result.url,
                key: result.key,
            },
        });
    }
    catch (error) {
        console.error("Avatar upload error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while uploading avatar",
        });
    }
});
/**
 * POST /api/users/accept-terms - Accept terms and conditions
 */
router.post("/accept-terms", authMiddleware_1.authenticateToken, authMiddleware_1.requireEmailVerified, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const user = await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                termsAccepted: true,
                termsAcceptedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                name: true,
                termsAccepted: true,
                termsAcceptedAt: true,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Terms and conditions accepted successfully",
            data: {
                termsAccepted: user.termsAccepted,
                termsAcceptedAt: user.termsAcceptedAt,
            },
        });
    }
    catch (error) {
        console.error("Accept terms error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while accepting terms",
        });
    }
});
exports.default = router;
