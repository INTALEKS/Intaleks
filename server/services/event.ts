import { prisma } from "../config/db";
import { EventCategory, EventStatus, ParticipantStatus, Prisma } from "@prisma/client";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

// Re-export error classes for backward compatibility
export { NotFoundError, ValidationError, ConflictError };

// Type definitions
export interface CreateEventInput {
  title: string;
  shortDescription: string;
  description: string;
  date: Date;
  time: string;
  category: "online" | "in-person";
  meetingLink?: string | null;
  thumbnail?: string | null;
}

export interface UpdateEventInput {
  title?: string;
  shortDescription?: string;
  description?: string;
  date?: Date;
  time?: string;
  category?: "online" | "in-person";
  meetingLink?: string | null;
  thumbnail?: string | null;
  status?: "upcoming" | "done";
}

export interface EventFilters {
  month?: number;
  year?: number;
  status?: "upcoming" | "done";
  category?: "online" | "in-person";
  page: number;
  limit: number;
}

export interface PaginatedEvents {
  events: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventStats {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendants: number;
  eventChange: number;
  registrationChange: number;
  attendantChange: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

// Helper functions to map between API and database enums
function mapCategoryToDb(category: "online" | "in-person"): EventCategory {
  return category === "online" ? EventCategory.ONLINE : EventCategory.IN_PERSON;
}

function mapCategoryFromDb(category: EventCategory): "online" | "in-person" {
  return category === EventCategory.ONLINE ? "online" : "in-person";
}

function mapStatusToDb(status: "upcoming" | "done"): EventStatus {
  return status === "upcoming" ? EventStatus.UPCOMING : EventStatus.DONE;
}

function mapStatusFromDb(status: EventStatus): "upcoming" | "done" {
  return status === EventStatus.UPCOMING ? "upcoming" : "done";
}

function mapParticipantStatusFromDb(status: ParticipantStatus): "Subscribed" | "Pending" {
  return status === ParticipantStatus.SUBSCRIBED ? "Subscribed" : "Pending";
}

// Transform database event to API response format
function transformEvent(event: any): any {
  return {
    ...event,
    category: mapCategoryFromDb(event.category),
    status: mapStatusFromDb(event.status),
    participants: event.participants?.map((p: any) => ({
      ...p,
      status: mapParticipantStatusFromDb(p.status),
    })),
  };
}

export class EventService {
  /**
   * Create a new event
   * Requirements: 1.1
   */
  static async create(data: CreateEventInput): Promise<any> {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        date: new Date(data.date),
        time: data.time,
        category: mapCategoryToDb(data.category),
        meetingLink: data.meetingLink || null,
        thumbnail: data.thumbnail || null,
        status: EventStatus.UPCOMING,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return transformEvent(event);
  }

  /**
   * Find all events with filtering and pagination
   * Requirements: 2.1, 2.2, 2.3, 2.4
   */
  static async findAll(filters: EventFilters): Promise<PaginatedEvents> {
    const { month, year, status, category, page, limit } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.EventWhereInput = {};

    // Month/year filter
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Status filter
    if (status) {
      where.status = mapStatusToDb(status);
    }

    // Category filter
    if (category) {
      where.category = mapCategoryToDb(category);
    }

    // Execute queries
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "asc" },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events: events.map(transformEvent),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find event by ID with participants
   * Requirements: 5.1
   */
  static async findById(id: string): Promise<any> {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundError(`Event with ID ${id} not found`);
    }

    const transformed = transformEvent(event);
    return {
      ...transformed,
      participantCount: event.participants.length,
    };
  }

  /**
   * Update an existing event
   * Requirements: 3.1, 3.3
   */
  static async update(id: string, data: UpdateEventInput): Promise<any> {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundError(`Event with ID ${id} not found`);
    }

    // Validate category change: if changing from in-person to online, meetingLink is required
    const newCategory = data.category ? mapCategoryToDb(data.category) : existingEvent.category;
    const isChangingToOnline = existingEvent.category === EventCategory.IN_PERSON && newCategory === EventCategory.ONLINE;

    if (isChangingToOnline && !data.meetingLink && !existingEvent.meetingLink) {
      throw new ValidationError("Meeting link is required when changing category to online", { meetingLink: ["Meeting link is required for online events"] });
    }

    // Build update data
    const updateData: Prisma.EventUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.time !== undefined) updateData.time = data.time;
    if (data.category !== undefined) updateData.category = mapCategoryToDb(data.category);
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink || null;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail || null;
    if (data.status !== undefined) updateData.status = mapStatusToDb(data.status);

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return transformEvent(event);
  }

  /**
   * Delete an event (cascade deletes participants)
   * Requirements: 4.1, 4.3
   */
  static async delete(id: string): Promise<void> {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundError(`Event with ID ${id} not found`);
    }

    // Delete event (participants are cascade deleted via Prisma schema)
    await prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Add a participant to an event
   * Requirements: 6.1, 6.3
   */
  static async addParticipant(eventId: string, userId: string): Promise<any> {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Check for duplicate registration
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      throw new ConflictError(`User is already registered for this event`);
    }

    // Create participant registration
    const participant = await prisma.eventParticipant.create({
      data: {
        eventId,
        userId,
        status: ParticipantStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      ...participant,
      status: mapParticipantStatusFromDb(participant.status),
    };
  }

  /**
   * Remove a participant from an event
   * Requirements: 6.2
   */
  static async removeParticipant(eventId: string, participantId: string): Promise<void> {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    // Check if participant exists
    const participant = await prisma.eventParticipant.findFirst({
      where: {
        id: participantId,
        eventId,
      },
    });

    if (!participant) {
      throw new NotFoundError(`Participant with ID ${participantId} not found for this event`);
    }

    // Delete participant registration
    await prisma.eventParticipant.delete({
      where: { id: participantId },
    });
  }

  /**
   * Update participant status
   * Requirements: 6.4
   */
  static async updateParticipantStatus(eventId: string, participantId: string, status: "Subscribed" | "Pending"): Promise<any> {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    // Check if participant exists
    const existingParticipant = await prisma.eventParticipant.findFirst({
      where: {
        id: participantId,
        eventId,
      },
    });

    if (!existingParticipant) {
      throw new NotFoundError(`Participant with ID ${participantId} not found for this event`);
    }

    // Map status to database enum
    const dbStatus = status === "Subscribed" ? ParticipantStatus.SUBSCRIBED : ParticipantStatus.PENDING;

    // Update participant status
    const participant = await prisma.eventParticipant.update({
      where: { id: participantId },
      data: { status: dbStatus },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      ...participant,
      status: mapParticipantStatusFromDb(participant.status),
    };
  }

  /**
   * Get event statistics with optional time range filtering
   * Requirements: 7.1, 7.2, 7.3
   */
  static async getStats(timeRange?: TimeRange): Promise<EventStats> {
    // Calculate the current period date range
    let currentStart: Date;
    let currentEnd: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (timeRange) {
      currentStart = new Date(timeRange.start);
      currentEnd = new Date(timeRange.end);

      // Calculate the duration of the current period
      const periodDuration = currentEnd.getTime() - currentStart.getTime();

      // Previous period is the same duration immediately before the current period
      previousEnd = new Date(currentStart.getTime() - 1); // 1ms before current start
      previousStart = new Date(previousEnd.getTime() - periodDuration);
    } else {
      // Default to current month if no time range specified
      const now = new Date();
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Previous month
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    // Get current period stats
    const [currentEvents, currentRegistrations, currentAttendants] = await Promise.all([
      // Total events in current period
      prisma.event.count({
        where: {
          createdAt: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
      }),
      // Total registrations in current period
      prisma.eventParticipant.count({
        where: {
          createdAt: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
      }),
      // Total attendants (participants with SUBSCRIBED status) in current period
      prisma.eventParticipant.count({
        where: {
          status: ParticipantStatus.SUBSCRIBED,
          createdAt: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
      }),
    ]);

    // Get previous period stats for change calculation
    const [previousEvents, previousRegistrations, previousAttendants] = await Promise.all([
      prisma.event.count({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
      prisma.eventParticipant.count({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
      prisma.eventParticipant.count({
        where: {
          status: ParticipantStatus.SUBSCRIBED,
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
    ]);

    // Calculate percentage change
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      totalEvents: currentEvents,
      totalRegistrations: currentRegistrations,
      totalAttendants: currentAttendants,
      eventChange: calculateChange(currentEvents, previousEvents),
      registrationChange: calculateChange(currentRegistrations, previousRegistrations),
      attendantChange: calculateChange(currentAttendants, previousAttendants),
    };
  }
}
