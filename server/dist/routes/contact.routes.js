"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
// Validation schema
const contactSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required(),
    email: joi_1.default.string().email().required(),
    message: joi_1.default.string().min(1).max(2000).required(),
});
/**
 * POST /api/contact - Submit a contact message
 */
router.post("/", async (req, res) => {
    try {
        const { error, value } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        // Store contact message in database
        const contact = await db_1.prisma.contactMessage.create({
            data: {
                name: value.name,
                email: value.email,
                message: value.message,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: { id: contact.id },
        });
    }
    catch (error) {
        console.error("Contact message error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while sending your message",
        });
    }
});
exports.default = router;
