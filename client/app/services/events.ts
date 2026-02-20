const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

// Upload Types
export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

export class UploadApi {
  /**
   * Upload event image (thumbnail/banner)
   * Stores in: events/
   */
  static async uploadEventImage(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/admin/upload/events`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to upload image");
    }
    return data.data;
  }

  /**
   * Upload video file
   * Stores in: videos/
   */
  static async uploadVideo(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/admin/upload/videos`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to upload video");
    }
    return data.data;
  }

  /**
   * Upload video thumbnail
   * Stores in: videos/
   */
  static async uploadVideoThumbnail(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/admin/upload/videos/thumbnail`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to upload thumbnail");
    }
    return data.data;
  }

  /**
   * Upload user image (avatar)
   * Stores in: users/
   */
  static async uploadUserImage(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/admin/upload/users`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to upload image");
    }
    return data.data;
  }

  /**
   * Upload forum media (images or videos)
   * Stores in: forum/
   */
  static async uploadForumMedia(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/admin/upload/forum`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to upload media");
    }
    return data.data;
  }

  /**
   * Delete a file from storage
   * @param url - The public URL of the file to delete
   */
  static async deleteFile(url: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/upload`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to delete file");
    }
  }

  /**
   * Get upload service status
   */
  static async getStatus(): Promise<{ configured: boolean; provider: string; folders: string[] }> {
    const response = await fetch(`${BASE_URL}/admin/upload/status`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to get upload status");
    }
    return data.data;
  }
}

// Event Types
export interface Participant {
  id: string;
  eventId: string;
  userId: string;
  status: "Subscribed" | "Pending";
  time?: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface Event {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  date: string;
  time: string;
  category: "online" | "in-person";
  meetingLink?: string | null;
  thumbnail?: string | null;
  status: "upcoming" | "done";
  participants?: Participant[];
  participantCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  month?: number;
  year?: number;
  status?: "upcoming" | "done";
  category?: "online" | "in-person";
  page?: number;
  limit?: number;
}

export interface PaginatedEvents {
  events: Event[];
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

export interface CreateEventInput {
  title: string;
  shortDescription: string;
  description: string;
  date: string;
  time: string;
  category: "online" | "in-person";
  meetingLink?: string;
  thumbnail?: string;
}

export interface UpdateEventInput {
  title?: string;
  shortDescription?: string;
  description?: string;
  date?: string;
  time?: string;
  category?: "online" | "in-person";
  meetingLink?: string | null;
  thumbnail?: string | null;
  status?: "upcoming" | "done";
}

export class EventsApi {
  static async getEvents(filters?: EventFilters): Promise<PaginatedEvents> {
    const params = new URLSearchParams();
    if (filters?.month) params.append("month", filters.month.toString());
    if (filters?.year) params.append("year", filters.year.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`${BASE_URL}/admin/events?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch events");
    }
    return data.data;
  }

  static async getEventById(id: string): Promise<Event> {
    const response = await fetch(`${BASE_URL}/admin/events/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch event");
    }
    return data.data;
  }

  static async createEvent(input: CreateEventInput): Promise<Event> {
    const response = await fetch(`${BASE_URL}/admin/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to create event");
    }
    return data.data;
  }

  static async updateEvent(id: string, input: UpdateEventInput): Promise<Event> {
    const response = await fetch(`${BASE_URL}/admin/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to update event");
    }
    return data.data;
  }

  static async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/events/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to delete event");
    }
  }

  static async getStats(startDate?: string, endDate?: string): Promise<EventStats> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await fetch(`${BASE_URL}/admin/events/stats?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to fetch event stats");
    }
    return data.data;
  }

  static async addParticipant(eventId: string, userId: string): Promise<Participant> {
    const response = await fetch(`${BASE_URL}/admin/events/${eventId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to add participant");
    }
    return data.data;
  }

  static async removeParticipant(eventId: string, participantId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/events/${eventId}/participants/${participantId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to remove participant");
    }
  }

  static async updateParticipantStatus(eventId: string, participantId: string, status: "Subscribed" | "Pending"): Promise<Participant> {
    const response = await fetch(`${BASE_URL}/admin/events/${eventId}/participants/${participantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to update participant status");
    }
    return data.data;
  }
}
