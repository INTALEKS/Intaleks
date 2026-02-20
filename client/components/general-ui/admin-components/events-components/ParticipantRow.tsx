import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { type Participant } from "@/app/admin/events/page";

// Participant Row
export default function ParticipantRow({ participant }: { participant: Participant }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={participant.avatar} />
          <AvatarFallback className="bg-gray-200">{participant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm">{participant.name}</div>
          <div className="text-xs text-gray-500">
            {participant.role} {participant.company}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
          {participant.status}
        </Badge>
        <span className="text-sm text-gray-500">{participant.time}</span>
      </div>
    </div>
  );
}
