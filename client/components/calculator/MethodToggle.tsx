"use client";

import { cn } from "@/lib/utils";

export type ValuationMethod = "asset" | "profit";

interface MethodToggleProps {
  selectedMethod: ValuationMethod;
  onMethodChange: (method: ValuationMethod) => void;
}

const methods: { id: ValuationMethod; label: string; description: string }[] = [
  {
    id: "asset",
    label: "Asset Method",
    description: "This asset method is effective because it values a business based on verifiable assets and liabilities.",
  },
  {
    id: "profit",
    label: "Profit Method",
    description: "This method is effective because it reflects the earning capacity and operational performance of the business.",
  },
];

export function MethodToggle({ selectedMethod, onMethodChange }: MethodToggleProps) {
  return (
    <div className="flex justify-center gap-4 py-6">
      {methods.map((method) => (
        <button key={method.id} onClick={() => onMethodChange(method.id)} className={cn("flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left w-80", selectedMethod === method.id ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400")}>
          <div className="shrink-0 mt-0.5">
            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedMethod === method.id ? "border-white" : "border-gray-400")}>{selectedMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}</div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{method.label}</h3>
            <p className={cn("text-xs leading-relaxed", selectedMethod === method.id ? "text-gray-200" : "text-gray-600")}>{method.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
