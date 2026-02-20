"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateTimePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disablePastDates?: boolean;
}

export function DateTimePicker({ date, onSelect, placeholder = "Pick date and time", className, disablePastDates = true }: DateTimePickerProps) {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  // Generate minutes (00, 15, 30, 45)
  const minutes = ["00", "15", "30", "45"];
  // AM/PM
  const periods = ["AM", "PM"];

  const getHour = (d: Date) => {
    const h = d.getHours();
    if (h === 0) return 12;
    if (h > 12) return h - 12;
    return h;
  };

  const getMinute = (d: Date) => {
    const m = d.getMinutes();
    // Round to nearest 15
    if (m < 8) return "00";
    if (m < 23) return "15";
    if (m < 38) return "30";
    if (m < 53) return "45";
    return "00";
  };

  const getPeriod = (d: Date) => (d.getHours() >= 12 ? "PM" : "AM");

  const currentHour = selectedDate ? getHour(selectedDate) : 12;
  const currentMinute = selectedDate ? getMinute(selectedDate) : "00";
  const currentPeriod = selectedDate ? getPeriod(selectedDate) : "PM";

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined);
      onSelect(undefined);
      return;
    }

    // Preserve time from current selection
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    } else {
      // Default to 7:00 PM for new selections
      newDate.setHours(19, 0, 0, 0);
    }

    setSelectedDate(newDate);
    onSelect(newDate);
  };

  const handleTimeChange = (type: "hour" | "minute" | "period", value: string) => {
    const newDate = selectedDate ? new Date(selectedDate) : new Date();

    if (type === "hour") {
      let hour = parseInt(value);
      if (currentPeriod === "PM" && hour !== 12) hour += 12;
      if (currentPeriod === "AM" && hour === 12) hour = 0;
      newDate.setHours(hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "period") {
      let hour = newDate.getHours();
      if (value === "PM" && hour < 12) hour += 12;
      if (value === "AM" && hour >= 12) hour -= 12;
      newDate.setHours(hour);
    }

    setSelectedDate(newDate);
    onSelect(newDate);
  };

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-gray-50", !selectedDate && "text-muted-foreground", className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP 'at' h:mm a") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} disabled={disablePastDates ? { before: today } : undefined} initialFocus />
        <div className="border-t px-3 py-3 bg-gray-50">
          <div className="flex items-center justify-center gap-1">
            <Clock className="h-4 w-4 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-500 mr-1">Time:</span>
            <Select value={currentHour.toString()} onValueChange={(v) => handleTimeChange("hour", v)}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {hours.map((h) => (
                  <SelectItem key={h} value={h.toString()}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-500">:</span>
            <Select value={currentMinute} onValueChange={(v) => handleTimeChange("minute", v)}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentPeriod} onValueChange={(v) => handleTimeChange("period", v)}>
              <SelectTrigger className="w-[75px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {periods.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
