interface SummaryItem {
  label: string;
  value: string | number;
  isBold?: boolean;
}

interface SummaryCardProps {
  title: string;
  items: SummaryItem[];
  note?: string;
}

export function SummaryCard({ title, items, note }: SummaryCardProps) {
  return (
    <div className="border rounded-md overflow-hidden mb-4">
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">{title}</div>
      {note && <p className="px-4 py-1 text-xs text-gray-400">{note}</p>}
      <div className="p-4 space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className={`text-sm ${item.isBold ? "font-semibold text-gray-800" : "text-gray-600"}`}>{item.label}</span>
            <span className={`text-sm ${item.isBold ? "font-bold text-gray-900 text-lg" : "text-gray-800"}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
