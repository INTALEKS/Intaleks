"use client";

import { Input } from "@/components/ui/input";

interface LabeledInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  type?: "text" | "number";
  readOnly?: boolean;
  className?: string;
}

export function LabeledInput({ label, value, onChange, placeholder = "Enter value", suffix, type = "number", readOnly = false, className = "" }: LabeledInputProps) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${className}`}>
      <span className="text-sm text-gray-600 min-w-[180px]">{label}</span>
      <div className="flex items-center gap-2 flex-1 max-w-[250px]">
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly} className={`bg-gray-50 border-gray-200 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`} />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}
