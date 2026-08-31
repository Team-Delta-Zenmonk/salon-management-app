import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { StepperHeaderStep } from "./stepper-header.type";

type Props = {
  steps: StepperHeaderStep[];
  activeStep: number;
  className?: string;
};

export default function StepperHeader({ steps, activeStep, className }: Readonly<Props>) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between w-full relative">
        {/* Connecting lines background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-border z-0" />
        
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          const isPending = index > activeStep;

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center group">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 border-2",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "bg-background border-primary text-primary",
                  isPending && "bg-background border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
              </div>
              <div className="absolute top-10 flex flex-col items-center text-center w-32 -ml-12">
                <span
                  className={cn(
                    "text-sm font-medium mt-1",
                    (isActive || isCompleted) ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
