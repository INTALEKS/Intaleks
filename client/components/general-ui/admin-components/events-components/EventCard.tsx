import { type Event } from "@/app/admin/events/page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Event Card on Calendar
export default function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const participantCount = event.participants.length;
  const displayCount = Math.min(3, participantCount);
  const extraCount = participantCount - displayCount;

  return (
    <div onClick={onClick} className="bg-(--chart-oklch-color) text-white text-xs p-1.5 rounded cursor-pointer mb-1 flex flex-col">
      <div className="font-medium line-clamp-2">{event.title}</div>
      <div className="text-[10px] opacity-90">{event.time}</div>
      {participantCount > 0 && (
        <div className="flex items-center mt-1 -space-x-1 self-end relative mr-1">
          {event.participants.slice(0, displayCount).map((p, i) => (
            <Avatar key={i} className="h-5 w-5 border border-black">
              <AvatarImage src={p.avatar} />
              <AvatarFallback className="text-[6px] bg-orange-400">{p.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {extraCount > 0 && <span className="absolute -bottom-1 -right-1.5 text-[8px] bg-white text-black font-medium rounded-full px-1 ml-1">+{extraCount}</span>}
        </div>
      )}
    </div>
  );
}
