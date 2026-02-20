"use client";

import { Input } from "@/components/ui/input";

interface InputItem {
  label: string;
  key: string;
  placeholder?: string;
  suffix?: string;
}

interface InputGroupProps {
  title: string;
  items: InputItem[];
  values: Record<string, string | number>;
  onChange: (key: string, value: string) => void;
  totalLabel?: string;
  totalValue?: string | number;
}

export function InputGroup({ title, items, values, onChange, totalLabel, totalValue }: InputGroupProps) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600 min-w-[180px]">{item.label}</span>
            <div className="flex items-center gap-2 flex-1 max-w-[250px]">
              <Input type="number" value={values[item.key] || ""} onChange={(e) => onChange(item.key, e.target.value)} placeholder={item.placeholder || "Enter value"} className="bg-gray-50 border-gray-200" />
              {item.suffix && <span className="text-sm text-gray-500">{item.suffix}</span>}
            </div>
          </div>
        ))}
        {totalLabel && (
          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <span className="text-sm font-medium text-gray-700">{totalLabel}</span>
            <span className="text-sm font-semibold text-gray-900 min-w-[250px] text-right">{totalValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
