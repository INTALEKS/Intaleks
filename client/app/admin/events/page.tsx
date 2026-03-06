"use client";

import { useState, useMemo } from "react";
import { ChevronsLeft, ChevronsRight, Plus, Calendar, Users, UserCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EventCard from "@/components/general-ui/admin-components/events-components/EventCard";
import EventFormPanel from "@/components/general-ui/admin-components/events-components/EventFormPanel";
import ParticipantsPanel from "@/components/general-ui/admin-components/events-components/ParticipantsPanel";
import EventDetailsPanel from "@/components/general-ui/admin-components/events-components/EventDetailsPanel";
import StatCard from "@/components/general-ui/admin-components/events-components/StatCard";
import { useEvents, useEventStats, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/app/hooks/useEvents";
import type { Event as ApiEvent, CreateEventInput, UpdateEventInput } from "@/app/services/events";

// Types for UI (extends API types with Date object)
export interface Participant {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  status: "Subscribed" | "Pending";
  time: string;
}

export interface Event {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  date: Date;
  time: string;
  category: "online" | "in-person";
  meetingLink?: string;
  thumbnail?: string;
  participants: Participant[];
  status: "upcoming" | "done";
}

// Transform API event to UI event
function transformEvent(apiEvent: ApiEvent): Event {
  return {
    ...apiEvent,
    date: new Date(apiEvent.date),
    meetingLink: apiEvent.meetingLink || undefined,
    thumbnail: apiEvent.thumbnail || undefined,
    participants: (apiEvent.participants || []).map((p) => ({
      id: p.id,
      name: p.user.firstName && p.user.lastName ? `${p.user.firstName} ${p.user.lastName}` : p.user.email,
      role: "Member",
      company: "",
      status: p.status,
      time: p.time || "",
    })),
  };
}

// Calendar helpers
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// Main Events Page
export default function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [panelView, setPanelView] = useState<"details" | "participants" | "form">("details");
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Fetch events for current month
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    month: month + 1,
    year: year,
    limit: 100,
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useEventStats();

  // Mutations
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  // Transform API events to UI events
  const events = useMemo(() => {
    return (eventsData?.events || []).map(transformEvent);
  }, [eventsData]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: { day: number; isCurrentMonth: boolean; events: Event[]; fullDate: Date }[] = [];

    const getEventsForDay = (targetYear: number, targetMonth: number, day: number) => {
      return events.filter((event) => event.date.getFullYear() === targetYear && event.date.getMonth() === targetMonth && event.date.getDate() === day);
    };

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        day,
        isCurrentMonth: false,
        events: getEventsForDay(prevYear, prevMonth, day),
        fullDate: new Date(prevYear, prevMonth, day),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        events: getEventsForDay(year, month, i),
        fullDate: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        events: getEventsForDay(nextYear, nextMonth, i),
        fullDate: new Date(nextYear, nextMonth, i),
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDay, events]);

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setPanelView("details");
    setIsAddingEvent(false);
  };

  const openAddEvent = (date?: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date || null);
    setPanelView("form");
    setIsAddingEvent(true);
  };

  const closePanel = () => {
    setSelectedEvent(null);
    setSelectedDate(null);
    setIsAddingEvent(false);
  };

  const handleSaveEvent = (data: Partial<Event>) => {
    if (selectedEvent) {
      // Update existing event
      const input: UpdateEventInput = {
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        category: data.category,
        meetingLink: data.meetingLink || null,
        thumbnail: data.thumbnail || null,
        time: data.time,
        status: data.status,
      };
      if (data.date) {
        input.date = data.date.toISOString();
      }
      updateEvent.mutate({ id: selectedEvent.id, input });
    } else {
      // Create new event
      const input: CreateEventInput = {
        title: data.title || "",
        shortDescription: data.shortDescription || "",
        description: data.description || "",
        category: data.category || "online",
        meetingLink: data.meetingLink,
        thumbnail: data.thumbnail,
        time: data.time || "12:00PM",
        date: (data.date || selectedDate || new Date()).toISOString(),
      };
      createEvent.mutate(input);
    }
    closePanel();
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent.mutate(eventId);
    closePanel();
  };

  const handleMarkAsDone = (event: Event) => {
    updateEvent.mutate({
      id: event.id,
      input: { status: "done" },
    });
  };

  const isPanelOpen = selectedEvent !== null || isAddingEvent;
  const isMutating = createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  return (
    <div className="min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="All Events" value={statsLoading ? 0 : stats?.totalEvents || 0} icon={Calendar} change={stats?.eventChange || 0} changeText="FROM LAST MONTH" />
        <StatCard title="Registered" value={statsLoading ? 0 : stats?.totalRegistrations || 0} icon={Users} change={stats?.registrationChange || 0} changeText="FROM LAST MONTH" />
        <StatCard title="Attendants" value={statsLoading ? 0 : stats?.totalAttendants || 0} icon={UserCheck} change={stats?.attendantChange || 0} changeText="FROM LAST MONTH" />
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)} className="w-6 h-6 flex justify-center items-center bg-(--light-gray-bg) rounded-sm">
            <ChevronsLeft className="h-5 w-5" />
          </button>
          <span className="font-medium min-w-[60px] text-center">{MONTHS[month]}</span>
          <button onClick={() => navigateMonth(1)} className="w-6 h-6 flex justify-center items-center bg-(--light-gray-bg) rounded-sm">
            <ChevronsRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={year.toString()} onValueChange={(v) => setCurrentDate(new Date(parseInt(v), month, 1))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => openAddEvent()} disabled={isMutating} className="bg-(--primary-border-typing)/90 hover:bg-(--primary-border-typing) transition-colors duration-300">
            {isMutating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Add New Event
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-sm border border-slate-200 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {DAYS.map((day, i) => (
              <div key={day} className={`py-3 text-center text-sm font-medium border-slate-200 ${i + 1 === DAYS.length ? "" : "border-r"}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 relative">
            {eventsLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            {calendarDays.map((dayData, index) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPastDay = dayData.fullDate < today;

              return (
                <div key={index} className={`min-h-[120px] border-b border-r p-1.5 relative ${!isPastDay ? "cursor-pointer" : ""} ${dayData.events.length > 0 ? "bg-[#D9EBFD]" : ""} ${isPastDay && dayData.events.length === 0 ? "bg-[#F7F7F7]" : ""}`} onMouseEnter={() => setHoveredDayIndex(index)} onMouseLeave={() => setHoveredDayIndex(null)}>
                  <span className={`text-sm font-medium ${!dayData.isCurrentMonth ? "text-gray-400" : "text-black"}`}>{dayData.day.toString().padStart(2, "0")}</span>

                  {/* Add button on hover - only for today and future dates */}
                  {hoveredDayIndex === index && dayData.events.length === 0 && !isPastDay && (
                    <button onClick={() => openAddEvent(dayData.fullDate)} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                      <Plus className="h-5 w-5 text-gray-400" />
                    </button>
                  )}

                  {/* Events */}
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[100px] thin-scrollbar pr-0.5">
                    {dayData.events.map((event) => (
                      <EventCard key={event.id} event={event} onClick={() => openEventDetails(event)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        {isPanelOpen && (
          <div className="w-[400px] bg-white rounded-lg border overflow-hidden">
            {panelView === "details" && selectedEvent && <EventDetailsPanel event={selectedEvent} onClose={closePanel} onViewParticipants={() => setPanelView("participants")} onEdit={() => setPanelView("form")} onMarkAsDone={() => handleMarkAsDone(selectedEvent)} onDelete={() => handleDeleteEvent(selectedEvent.id)} />}
            {panelView === "participants" && selectedEvent && <ParticipantsPanel event={selectedEvent} onClose={closePanel} onBack={() => setPanelView("details")} />}
            {panelView === "form" && <EventFormPanel event={selectedEvent || undefined} defaultDate={selectedDate || undefined} onClose={closePanel} onSave={handleSaveEvent} isLoading={createEvent.isPending || updateEvent.isPending} />}
          </div>
        )}
      </div>
    </div>
  );
}
