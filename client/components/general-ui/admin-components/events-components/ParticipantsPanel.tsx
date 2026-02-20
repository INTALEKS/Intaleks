import { ArrowLeft, X } from "lucide-react";

import ParticipantRow from "./ParticipantRow";

import { type Event } from "@/app/admin/events/page";

// Participants Panel
export default function ParticipantsPanel({ event, onClose, onBack }: { event: Event; onClose: () => void; onBack: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <span className="text-sm font-medium uppercase">Participants</span>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {event.participants.map((participant) => (
          <ParticipantRow key={participant.id} participant={participant} />
        ))}
      </div>
    </div>
  );
}
