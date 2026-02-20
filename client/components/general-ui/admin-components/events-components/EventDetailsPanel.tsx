import { ArrowLeft, Copy, Link, X, Trash2 } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { type Event } from "@/app/admin/events/page";

interface EventDetailsPanelProps {
  event: Event;
  onClose: () => void;
  onViewParticipants: () => void;
  onEdit: () => void;
  onMarkAsDone?: () => void;
  onDelete?: () => void;
}

export default function EventDetailsPanel({ event, onClose, onViewParticipants, onEdit, onMarkAsDone, onDelete }: EventDetailsPanelProps) {
  const participantCount = event.participants.length;
  const displayCount = Math.min(3, participantCount);
  const extraCount = participantCount - displayCount;

  const copyLink = () => {
    if (event.meetingLink) {
      navigator.clipboard.writeText(event.meetingLink);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <span className="text-sm font-medium text-gray-500 uppercase">Event Details</span>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button onClick={onDelete} className="p-1 hover:bg-red-100 rounded text-red-500" title="Delete event">
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Event Thumbnail */}
        <div className="rounded-lg mb-6 relative overflow-hidden">
          {event.thumbnail ? (
            <Image src={event.thumbnail} alt={event.title} width={800} height={192} className="w-full h-48 object-cover" />
          ) : (
            <div className="bg-linear-to-br from-cyan-100 to-cyan-200 h-48 p-4">
              <div className="flex justify-end">
                <div className="bg-white/80 rounded-lg p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-cyan-500 rounded-sm" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-12 text-sm">
                <div className="text-gray-600">{event.shortDescription}</div>
                <div className="font-bold text-lg mt-1">{event.title.split(":")[0] || event.title}</div>
              </div>
            </div>
          )}
          <Badge className={`absolute top-2 left-2 text-white text-[10px] ${event.status === "done" ? "bg-gray-500" : "bg-green-500"}`}>{event.category.toUpperCase()}</Badge>
          {event.status === "done" && <Badge className="absolute top-2 right-2 bg-gray-700 text-white text-[10px]">COMPLETED</Badge>}
        </div>

        {/* Event Info */}
        <h2 className="text-xl font-bold mb-2">{event.title}</h2>
        <p className="text-gray-600 mb-2">{event.shortDescription}</p>
        <p className="text-sm text-gray-500 mb-4">
          {event.date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          at {event.time}
        </p>
        <p className="text-sm text-gray-500 mb-6">{event.description}</p>

        {/* Meeting Link */}
        {event.meetingLink && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
            <Link className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 flex-1 truncate">{event.meetingLink}</span>
            <button onClick={copyLink} className="p-1 hover:bg-gray-200 rounded">
              <Copy className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        )}

        {/* Participants Preview */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center -space-x-2">
            {event.participants.slice(0, displayCount).map((p, i) => (
              <Avatar key={i} className="h-8 w-8 border-2 border-white">
                <AvatarImage src={p.avatar} />
                <AvatarFallback className="bg-orange-400 text-white text-xs">{p.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {extraCount > 0 && <span className="text-xs bg-gray-200 rounded-full px-2 py-1 ml-2">+{extraCount}</span>}
            {participantCount === 0 && <span className="text-sm text-gray-400">No participants yet</span>}
          </div>
          {participantCount > 0 && (
            <button onClick={onViewParticipants} className="text-sm text-blue-600 hover:underline">
              View all event participants
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t flex gap-3">
        {event.status !== "done" && onMarkAsDone && (
          <Button variant="outline" className="flex-1" onClick={onMarkAsDone}>
            Mark as done
          </Button>
        )}
        <Button onClick={onEdit} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
          Edit Event
        </Button>
      </div>
    </div>
  );
}
