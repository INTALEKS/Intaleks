"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export function StepProgress({ steps, currentStep, completedSteps }: StepProgressProps) {
  return (
    <div className="w-full overflow-x-auto py-6 px-2">
      <div className="flex items-center justify-between min-w-max mx-auto gap-2 md:gap-4 lg:gap-8 max-w-4xl">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const isActive = isCompleted || isCurrent;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center gap-2 md:gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center transition-all duration-300 shrink-0", isActive ? "bg-blue-500" : "bg-gray-200")}>
                  <div className={cn("w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center", isActive ? "bg-white" : "bg-transparent")}>
                    <Check className={cn("w-3 h-3 md:w-4 md:h-4", isActive ? "text-blue-500" : "text-gray-400")} />
                  </div>
                </div>
                <span className={cn("text-xs md:text-sm text-center whitespace-nowrap", isActive ? "text-gray-900 font-medium" : "text-gray-500")}>
                  <span className="hidden sm:inline">{step.number}. </span>
                  {step.label}
                </span>
              </div>
              {!isLast && <div className={cn("h-0.5 w-4 md:w-8 lg:w-16 transition-colors duration-300", isCompleted ? "bg-blue-500" : "bg-gray-200")} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
