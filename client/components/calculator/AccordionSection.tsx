"use client";

import { usePathname } from "next/navigation";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
  title: string;
  stepNumber: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function AccordionSection({ title, stepNumber, isOpen, onToggle, children }: AccordionSectionProps) {
  const pathname = usePathname();

  const isHomepage = pathname === "/";

  return (
    <div className="bg-white border border-[#E3E8F0] rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(13,17,23,0.05)]">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-[#F7F9FC] transition-colors">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF1FE] text-sm font-bold text-[#2563EB]">{stepNumber}</span>
          <span className="font-semibold text-[#0d1117]">{title}</span>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-gray-500 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      {isOpen && <div className={`border-t border-[#E3E8F0] px-5 pb-6 pt-5 ${isHomepage ? "h-96 overflow-y-auto" : ""}`}>{children}</div>}
    </div>
  );
}
