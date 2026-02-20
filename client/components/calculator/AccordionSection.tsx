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
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left bg-gray-200 hover:bg-gray-300 transition-colors">
        <span className="font-medium text-gray-800">
          {stepNumber}. {title}
        </span>
        <ChevronDown className={cn("w-5 h-5 text-gray-500 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      {isOpen && <div className={`px-4 pb-6 mt-3 ${isHomepage ? "h-96 overflow-y-auto" : ""}`}>{children}</div>}
    </div>
  );
}
