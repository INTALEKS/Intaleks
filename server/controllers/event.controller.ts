import { Request, Response } from "express";
import { EventService, NotFoundError, ValidationError, ConflictError } from "../services/event";
import { createEventSchema, updateEventSchema, eventFiltersSchema, participantStatusSchema, addParticipantSchema } from "../validation/eventValidation";

/**
 * Event Controller
 * Handles all HTTP request/response logic for event management endpoints
 */
export class EventController {
  /**
   * Get all events with optional filtering and pagination
   * GET /api/admin/events
   */
  static async getEvents(req: Request, res: Response): Promise<void> {
    try {
      // Validate and parse query parameters
      const { error, value } = eventFiltersSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
        error.details.forEach((detail) => {
          const field = detail.path.join(".");
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(detail.message);
        });

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid filter parameters",
            details,
          },
        });
        return;
      }

      const result = await EventService.findAll(value);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while retrieving events",
        },
      });
    }
  }

  /**
   * Get a single event by ID with participants
   * GET /api/admin/events/:id
   */
  static async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await EventService.findById(id);

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Get event by ID error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while retrieving the event",
        },
      });
    }
  }

  /**
   * Create a new event
   * POST /api/admin/events
   */
  static async createEvent(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createEventSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
        error.details.forEach((detail) => {
          const field = detail.path.join(".");
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(detail.message);
        });

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid event data",
            details,
          },
        });
        return;
      }

      const event = await EventService.create(value);

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: event,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      console.error("Create event error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while creating the event",
        },
      });
    }
  }

  /**
   * Update an existing event
   * PUT /api/admin/events/:id
   */
  static async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = updateEventSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
        error.details.forEach((detail) => {
          const field = detail.path.join(".");
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(detail.message);
        });

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update data",
            details,
          },
        });
        return;
      }

      const event = await EventService.update(id, value);

      res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: event,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      console.error("Update event error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while updating the event",
        },
      });
    }
  }

  /**
   * Delete an event
   * DELETE /api/admin/events/:id
   */
  static async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await EventService.delete(id);

      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Delete event error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while deleting the event",
        },
      });
    }
  }

  /**
   * Get event statistics
   * GET /api/admin/events/stats
   */
  static async getEventStats(req: Request, res: Response): Promise<void> {
    try {
      // Parse optional time range from query parameters
      let timeRange: { start: Date; end: Date } | undefined;

      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid date format for time range",
              details: {
                startDate: ["Must be a valid ISO date string"],
                endDate: ["Must be a valid ISO date string"],
              },
            },
          });
          return;
        }

        timeRange = { start: startDate, end: endDate };
      }

      const stats = await EventService.getStats(timeRange);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get event stats error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while retrieving event statistics",
        },
      });
    }
  }

  /**
   * Add a participant to an event
   * POST /api/admin/events/:id/participants
   */
  static async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId } = req.params;

      // Validate request body
      const { error, value } = addParticipantSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
        error.details.forEach((detail) => {
          const field = detail.path.join(".");
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(detail.message);
        });

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid participant data",
            details,
          },
        });
        return;
      }

      const participant = await EventService.addParticipant(eventId, value.userId);

      res.status(201).json({
        success: true,
        message: "Participant added successfully",
        data: participant,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          error: {
            code: "CONFLICT",
            message: error.message,
          },
        });
        return;
      }

      console.error("Add participant error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while adding the participant",
        },
      });
    }
  }

  /**
   * Remove a participant from an event
   * DELETE /api/admin/events/:id/participants/:participantId
   */
  static async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId, participantId } = req.params;

      await EventService.removeParticipant(eventId, participantId);

      res.status(200).json({
        success: true,
        message: "Participant removed successfully",
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Remove participant error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while removing the participant",
        },
      });
    }
  }

  /**
   * Update participant status
   * PATCH /api/admin/events/:id/participants/:participantId
   */
  static async updateParticipantStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId, participantId } = req.params;

      // Validate request body
      const { error, value } = participantStatusSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
        error.details.forEach((detail) => {
          const field = detail.path.join(".");
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(detail.message);
        });

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid status data",
            details,
          },
        });
        return;
      }

      const participant = await EventService.updateParticipantStatus(eventId, participantId, value.status);

      res.status(200).json({
        success: true,
        message: "Participant status updated successfully",
        data: participant,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Update participant status error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while updating participant status",
        },
      });
    }
  }
}
