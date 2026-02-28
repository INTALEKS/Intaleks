import { Router, Request, Response, NextFunction } from "express";
import { EventController } from "../controllers/event.controller";
import { authenticateToken } from "../middleware/authMiddleware";
import { UserRole } from "@prisma/client";
import { isAdminOrHigher } from "../utils/roleHierarchy";

const router = Router();

/**
 * Admin authorization middleware
 * Ensures the authenticated user has ADMIN or SUPER_ADMIN role
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
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

  if (!isAdminOrHigher(req.user.role)) {
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
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * Event CRUD Routes
 */

// GET /api/admin/events/stats - Get event statistics (must be before /:id to avoid conflict)
router.get("/stats", EventController.getEventStats);

// GET /api/admin/events - List events with filters
router.get("/", EventController.getEvents);

// GET /api/admin/events/:id - Get event details
router.get("/:id", EventController.getEventById);

// POST /api/admin/events - Create new event
router.post("/", EventController.createEvent);

// PUT /api/admin/events/:id - Update event
router.put("/:id", EventController.updateEvent);

// DELETE /api/admin/events/:id - Delete event
router.delete("/:id", EventController.deleteEvent);

/**
 * Participant Management Routes
 */

// POST /api/admin/events/:id/participants - Add participant
router.post("/:id/participants", EventController.addParticipant);

// DELETE /api/admin/events/:id/participants/:participantId - Remove participant
router.delete("/:id/participants/:participantId", EventController.removeParticipant);

// PATCH /api/admin/events/:id/participants/:participantId - Update participant status
router.patch("/:id/participants/:participantId", EventController.updateParticipantStatus);

export default router;
