"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_1 = require("../services/event");
const eventValidation_1 = require("../validation/eventValidation");
/**
 * Event Controller
 * Handles all HTTP request/response logic for event management endpoints
 */
class EventController {
    /**
     * Get all events with optional filtering and pagination
     * GET /api/admin/events
     */
    static async getEvents(req, res) {
        try {
            // Validate and parse query parameters
            const { error, value } = eventValidation_1.eventFiltersSchema.validate(req.query, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
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
            const result = await event_1.EventService.findAll(value);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
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
    static async getEventById(req, res) {
        try {
            const { id } = req.params;
            const event = await event_1.EventService.findById(id);
            res.status(200).json({
                success: true,
                data: event,
            });
        }
        catch (error) {
            if (error instanceof event_1.NotFoundError) {
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
    static async createEvent(req, res) {
        try {
            // Validate request body
            const { error, value } = eventValidation_1.createEventSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
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
            const event = await event_1.EventService.create(value);
            res.status(201).json({
                success: true,
                message: "Event created successfully",
                data: event,
            });
        }
        catch (error) {
            if (error instanceof event_1.ValidationError) {
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
    static async updateEvent(req, res) {
        try {
            const { id } = req.params;
            // Validate request body
            const { error, value } = eventValidation_1.updateEventSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
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
            const event = await event_1.EventService.update(id, value);
            res.status(200).json({
                success: true,
                message: "Event updated successfully",
                data: event,
            });
        }
        catch (error) {
            if (error instanceof event_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            if (error instanceof event_1.ValidationError) {
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
    static async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            await event_1.EventService.delete(id);
            res.status(200).json({
                success: true,
                message: "Event deleted successfully",
            });
        }
        catch (error) {
            if (error instanceof event_1.NotFoundError) {
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
    static async getEventStats(req, res) {
        try {
            // Parse optional time range from query parameters
            let timeRange;
            if (req.query.startDate && req.query.endDate) {
                const startDate = new Date(req.query.startDate);
                const endDate = new Date(req.query.endDate);
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
            const stats = await event_1.EventService.getStats(timeRange);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
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
    static async addParticipant(req, res) {
        try {
            const { id: eventId } = req.params;
            // Validate request body
            const { error, value } = eventValidation_1.addParticipantSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
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
            const participant = await event_1.EventService.addParticipant(eventId, value.userId);
            res.status(201).json({
                success: true,
                message: "Participant added successfully",
                data: participant,
            });
        }
        catch (error) {
            if (error instanceof event_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            if (error instanceof event_1.ConflictError) {
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
    static async removeParticipant(req, res) {
        try {
            const { id: eventId, participantId } = req.params;
            await event_1.EventService.removeParticipant(eventId, participantId);
            res.status(200).json({
                success: true,
                message: "Participant removed successfully",
            });
        }
        catch (error) {
            if (error instanceof event_1.NotFoundError) {
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
    static async updateParticipantStatus(req, res) {
        try {
            const { id: eventId, participantId } = req.params;
            // Validate request body
            const { error, value } = eventValidation_1.participantStatusSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
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
            const participant = await event_1.EventService.updateParticipantStatus(eventId, participantId, value.status);
            res.status(200).json({
                success: true,
                message: "Participant status updated successfully",
                data: participant,
            });
        }
        catch (error) {
            if (error instanceof event_1.NotFoundError) {
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
exports.EventController = EventController;
