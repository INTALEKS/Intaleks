"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
/**
 * Admin authorization middleware
 * Ensures the authenticated user has ADMIN role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            },
        });
        return;
    }
    if (req.user.role !== client_1.UserRole.ADMIN) {
        res.status(403).json({
            success: false,
            error: {
                code: "FORBIDDEN",
                message: "Admin access required",
            },
        });
        return;
    }
    next();
};
// Apply authentication and admin authorization to all routes
router.use(authMiddleware_1.authenticateToken);
router.use(requireAdmin);
/**
 * Event CRUD Routes
 */
// GET /api/admin/events/stats - Get event statistics (must be before /:id to avoid conflict)
router.get("/stats", event_controller_1.EventController.getEventStats);
// GET /api/admin/events - List events with filters
router.get("/", event_controller_1.EventController.getEvents);
// GET /api/admin/events/:id - Get event details
router.get("/:id", event_controller_1.EventController.getEventById);
// POST /api/admin/events - Create new event
router.post("/", event_controller_1.EventController.createEvent);
// PUT /api/admin/events/:id - Update event
router.put("/:id", event_controller_1.EventController.updateEvent);
// DELETE /api/admin/events/:id - Delete event
router.delete("/:id", event_controller_1.EventController.deleteEvent);
/**
 * Participant Management Routes
 */
// POST /api/admin/events/:id/participants - Add participant
router.post("/:id/participants", event_controller_1.EventController.addParticipant);
// DELETE /api/admin/events/:id/participants/:participantId - Remove participant
router.delete("/:id/participants/:participantId", event_controller_1.EventController.removeParticipant);
// PATCH /api/admin/events/:id/participants/:participantId - Update participant status
router.patch("/:id/participants/:participantId", event_controller_1.EventController.updateParticipantStatus);
exports.default = router;
