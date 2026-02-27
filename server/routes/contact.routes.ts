import { Router, Request, Response } from "express";
import { prisma } from "../config/db";
import Joi from "joi";
import emailService from "../services/email";

const router = Router();

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(1).max(2000).required(),
});

/**
 * POST /api/contact - Submit a contact message
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Store contact message in database
    const contact = await prisma.contactMessage.create({
      data: {
        name: value.name,
        email: value.email,
        message: value.message,
      },
    });

    // Send confirmation email to user (non-blocking)
    emailService.sendContactConfirmationToUser(value.name, value.email).catch((error) => {
      console.error("Failed to send contact confirmation email:", error);
    });

    // Send notification email to admin (non-blocking)
    emailService
      .sendContactNotificationToAdmin({
        name: value.name,
        email: value.email,
        message: value.message,
        contactId: contact.id,
      })
      .catch((error) => {
        console.error("Failed to send admin notification email:", error);
      });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { id: contact.id },
    });
  } catch (error) {
    console.error("Contact message error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending your message",
    });
  }
});

export default router;
