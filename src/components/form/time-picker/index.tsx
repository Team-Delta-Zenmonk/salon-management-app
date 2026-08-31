import * as React from "react";
import { Controller, type FieldValues } from "react-hook-form";
import type { CustomDateTimePickerProps } from "./time.picker.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/** Generate time options at 30-minute intervals in "HH:mm" (24h) format with 12h display labels */
const TIME_OPTIONS = (() => {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
})();

/** Convert "HH:mm" to display label like "9:00 AM" */
const formatTimeLabel = (val: string): string => {
  const match = TIME_OPTIONS.find((o) => o.value === val);
  if (match) return match.label;
  // Fallback for non-standard times
  if (!val) return "";
  const [hours, minutes] = val.split(":");
  const h = Number.parseInt(hours, 10);
  const h12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h12}:${minutes} ${ampm}`;
};

const TimePicker = <T extends FieldValues>({
  name,
  control,
  placeholder,
  identifier,
  disabled,
  handleChange,
  label,
  triggerClassName,
}: CustomDateTimePickerProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const hasError = !disabled && !!error;

        return (
          <div className="flex flex-col gap-1.5 w-full" data-test-id={`time-picker-container-${identifier}`}>
            {label && (
              <Label
                className={cn(
                  "text-sm font-medium",
                  hasError ? "text-destructive" : "text-foreground",
                  disabled && "opacity-50"
                )}
                data-test-id={`label-${identifier}`}
              >
                {label}
              </Label>
            )}
            <Select
              value={value || ""}
              onValueChange={(val) => {
                onChange(val);
                handleChange?.();
              }}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(
                  "h-10 w-full rounded-lg text-sm font-medium transition-all duration-200 [&>svg]:opacity-50 shadow-sm hover:border-input-border-hover",
                  hasError ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "",
                  !value && "text-muted-foreground/60",
                  triggerClassName
                )}
              >
                <div className="flex items-center gap-2 truncate flex-1 text-left line-clamp-1 pr-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  <SelectValue placeholder={placeholder || "Select"}>
                    {value ? formatTimeLabel(value) : (placeholder || "Select")}
                  </SelectValue>
                </div>
                {value && (
                  <div
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange("");
                      handleChange?.();
                    }}
                    className="mr-1 flex items-center justify-center rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </div>
                )}
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {TIME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasError && (
              <p className="text-xs font-medium text-destructive mt-0.5">
                {error.message as string}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default TimePicker;
