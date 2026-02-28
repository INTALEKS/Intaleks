import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import { authenticateToken, requireEmailVerified } from "../middleware/authMiddleware";
import { prisma } from "../config/db";
import { StorageService } from "../services/storage";
import Joi from "joi";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for avatars
  },
});

// Validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  avatar: Joi.string().uri().optional(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required(),
});

/**
 * PATCH /api/users/profile - Update current user's profile
 */
router.patch("/profile", authenticateToken, requireEmailVerified, async (req: Request, res: Response) => {
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

    const user = await prisma.user.update({
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
  } catch (error) {
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
router.patch("/password", authenticateToken, requireEmailVerified, async (req: Request, res: Response) => {
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(value.oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(value.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
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
router.post("/avatar", authenticateToken, requireEmailVerified, upload.single("file"), async (req: Request, res: Response) => {
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
    const result = await StorageService.uploadUserImage(req.file);

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: result.url,
        key: result.key,
      },
    });
  } catch (error) {
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
router.post("/accept-terms", authenticateToken, requireEmailVerified, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.update({
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
  } catch (error) {
    console.error("Accept terms error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while accepting terms",
    });
  }
});

export default router;
