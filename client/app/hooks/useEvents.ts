"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EventsApi, type EventFilters, type CreateEventInput, type UpdateEventInput } from "@/app/services/events";

export const EVENT_KEYS = {
  all: ["events"] as const,
  lists: () => [...EVENT_KEYS.all, "list"] as const,
  list: (filters?: EventFilters) => [...EVENT_KEYS.lists(), filters] as const,
  details: () => [...EVENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...EVENT_KEYS.details(), id] as const,
  stats: (startDate?: string, endDate?: string) => [...EVENT_KEYS.all, "stats", startDate, endDate] as const,
};

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: EVENT_KEYS.list(filters),
    queryFn: () => EventsApi.getEvents(filters),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: EVENT_KEYS.detail(id),
    queryFn: () => EventsApi.getEventById(id),
    enabled: !!id,
  });
}

export function useEventStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: EVENT_KEYS.stats(startDate, endDate),
    queryFn: () => EventsApi.getStats(startDate, endDate),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => EventsApi.createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.stats() });
      toast.success("Event created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEventInput }) => EventsApi.updateEvent(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(data.id) });
      toast.success("Event updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => EventsApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.stats() });
      toast.success("Event deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAddParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) => EventsApi.addParticipant(eventId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.stats() });
      toast.success("Participant added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, participantId }: { eventId: string; participantId: string }) => EventsApi.removeParticipant(eventId, participantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.stats() });
      toast.success("Participant removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateParticipantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, participantId, status }: { eventId: string; participantId: string; status: "Subscribed" | "Pending" }) => EventsApi.updateParticipantStatus(eventId, participantId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      toast.success("Participant status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
