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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const generateTimeOptions = (intervalMinutes: number = 30) => {
  const options: { value: string; label: string }[] = [];
  const step = Math.max(1, Math.min(60, intervalMinutes));
  
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      const value = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
};

const formatTimeLabel = (val: string, options: { value: string; label: string }[]): string => {
  if (!val) return "";
  const match = options.find((o) => o.value === val);
  if (match) return match.label;
  const [hours, minutes] = val.split(":");
  if (!hours || minutes === undefined) return val;
  const h = Number.parseInt(hours, 10);
  if (Number.isNaN(h)) return val;
  const h12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h12}:${minutes.padStart(2, "0")} ${ampm}`;
};

const parseTimeToParts = (val: string) => {
  if (!val) return { hour12: 12, minute: 0, ampm: "AM" as const };
  const [hStr, mStr] = val.split(":");
  let h = Number.parseInt(hStr, 10);
  let m = Number.parseInt(mStr, 10);
  if (Number.isNaN(h)) h = 12;
  if (Number.isNaN(m)) m = 0;
  const ampm = h >= 12 ? ("PM" as const) : ("AM" as const);
  const hour12 = h % 12 || 12;
  return { hour12, minute: m, ampm };
};

const partsTo24HourValue = (hour12: number, minute: number, ampm: "AM" | "PM") => {
  let h24 = hour12 % 12;
  if (ampm === "PM") h24 += 12;
  return `${h24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
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
  rules,
  helperText,
  intervalMinutes = 30,
  isManual = false,
}: CustomDateTimePickerProps<T>) => {
  const timeOptions = React.useMemo(() => generateTimeOptions(intervalMinutes), [intervalMinutes]);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        const hasError = !disabled && !!error;
        const stringValue = value ? String(value) : "";

        const handleManualChange = (newVal: string) => {
          onChange(newVal);
          handleChange?.();
        };

        return (
          <div className="flex flex-col gap-1.5 w-full text-left" data-test-id={`time-picker-container-${identifier}`}>
            {label && (
              <Label
                className={cn(
                  "text-xs font-semibold tracking-wide text-foreground",
                  hasError && "text-destructive",
                  disabled && "opacity-50"
                )}
                data-test-id={`label-${identifier}`}
              >
                {label}
              </Label>
            )}

            {isManual ? (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger
                  ref={ref as any}
                  disabled={disabled}
                  onBlur={onBlur}
                  data-test-id={`time-picker-${identifier}`}
                  className={cn(
                    "flex h-10 w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm shadow-sm transition-all outline-none items-center justify-between",
                    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-input-border-hover",
                    "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 disabled:hover:border-input-border",
                    hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                    !stringValue && "text-muted-foreground",
                    triggerClassName
                  )}
                >
                  <div className="flex items-center gap-2 truncate flex-1 text-left min-w-0 pr-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                    <span>
                      {stringValue ? formatTimeLabel(stringValue, timeOptions) : (placeholder || "Select time")}
                    </span>
                  </div>

                  {stringValue && !disabled && (
                    <div
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleManualChange("");
                      }}
                      className="mr-1 flex items-center justify-center rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
                      title="Clear time"
                      aria-label="Clear time selection"
                    >
                      <X className="h-3.5 w-3.5" />
                    </div>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-auto p-4 z-50 rounded-2xl border border-border bg-popover shadow-xl" align="start">
                  {(() => {
                    const { hour12, minute, ampm } = parseTimeToParts(stringValue);

                    const stepHour = (delta: number) => {
                      let nextH = (hour12 + delta) % 12;
                      if (nextH <= 0) nextH += 12;
                      handleManualChange(partsTo24HourValue(nextH, minute, ampm));
                    };

                    const stepMinute = (delta: number) => {
                      let nextM = (minute + delta) % 60;
                      if (nextM < 0) nextM += 60;
                      handleManualChange(partsTo24HourValue(hour12, nextM, ampm));
                    };

                    const prevHour = hour12 - 1 <= 0 ? 12 : hour12 - 1;
                    const nextHour = hour12 + 1 > 12 ? 1 : hour12 + 1;

                    const prevMin = (minute - 1 + 60) % 60;
                    const nextMin = (minute + 1) % 60;

                    const handleWheelHour = (e: React.WheelEvent) => {
                      e.preventDefault();
                      stepHour(e.deltaY > 0 ? 1 : -1);
                    };

                    const handleWheelMinute = (e: React.WheelEvent) => {
                      e.preventDefault();
                      stepMinute(e.deltaY > 0 ? 1 : -1);
                    };

                    return (
                      <div className="flex items-center gap-4 select-none">
                        {/* Hours Wheel Spinner */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-1.5">
                            Hour
                          </span>
                          <div
                            onWheel={handleWheelHour}
                            className="flex flex-col items-center gap-1 bg-muted/30 border border-border/50 rounded-xl p-1.5 touch-pan-y"
                          >
                            <button
                              type="button"
                              onClick={() => stepHour(-1)}
                              className="text-xs font-mono font-medium text-muted-foreground/50 hover:text-foreground transition-colors py-0.5 px-2 cursor-pointer"
                            >
                              {prevHour.toString().padStart(2, "0")}
                            </button>
                            <div className="w-12 py-1.5 rounded-lg bg-primary text-primary-foreground font-mono font-extrabold text-sm text-center shadow-xs">
                              {hour12.toString().padStart(2, "0")}
                            </div>
                            <button
                              type="button"
                              onClick={() => stepHour(1)}
                              className="text-xs font-mono font-medium text-muted-foreground/50 hover:text-foreground transition-colors py-0.5 px-2 cursor-pointer"
                            >
                              {nextHour.toString().padStart(2, "0")}
                            </button>
                          </div>
                        </div>

                        <span className="text-xl font-bold text-muted-foreground pt-4">:</span>

                        {/* Minutes Wheel Spinner */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-1.5">
                            Minute
                          </span>
                          <div
                            onWheel={handleWheelMinute}
                            className="flex flex-col items-center gap-1 bg-muted/30 border border-border/50 rounded-xl p-1.5 touch-pan-y"
                          >
                            <button
                              type="button"
                              onClick={() => stepMinute(-1)}
                              className="text-xs font-mono font-medium text-muted-foreground/50 hover:text-foreground transition-colors py-0.5 px-2 cursor-pointer"
                            >
                              {prevMin.toString().padStart(2, "0")}
                            </button>
                            <div className="w-12 py-1.5 rounded-lg bg-primary text-primary-foreground font-mono font-extrabold text-sm text-center shadow-xs">
                              {minute.toString().padStart(2, "0")}
                            </div>
                            <button
                              type="button"
                              onClick={() => stepMinute(1)}
                              className="text-xs font-mono font-medium text-muted-foreground/50 hover:text-foreground transition-colors py-0.5 px-2 cursor-pointer"
                            >
                              {nextMin.toString().padStart(2, "0")}
                            </button>
                          </div>
                        </div>

                        {/* AM / PM Toggle */}
                        <div className="flex flex-col items-center pt-5 gap-1.5">
                          {(["AM", "PM"] as const).map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => handleManualChange(partsTo24HourValue(hour12, minute, period))}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center",
                                ampm === period
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </PopoverContent>
              </Popover>
            ) : (
              <Select
                value={stringValue}
                onValueChange={(val) => {
                  onChange(val);
                  handleChange?.();
                }}
                disabled={disabled}
              >
                <SelectTrigger
                  ref={ref as any}
                  onBlur={onBlur}
                  data-test-id={`time-picker-${identifier}`}
                  className={cn(
                    "h-10 w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm shadow-sm transition-all outline-none",
                    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-input-border-hover",
                    "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 disabled:hover:border-input-border",
                    hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                    !stringValue && "text-muted-foreground",
                    triggerClassName
                  )}
                >
                  <div className="flex items-center gap-2 truncate flex-1 text-left min-w-0 pr-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                    <SelectValue placeholder={placeholder || "Select time"}>
                      {stringValue ? formatTimeLabel(stringValue, timeOptions) : (placeholder || "Select time")}
                    </SelectValue>
                  </div>

                  {stringValue && !disabled && (
                    <div
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange("");
                        handleChange?.();
                      }}
                      className="mr-1 flex items-center justify-center rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
                      title="Clear time"
                      aria-label="Clear time selection"
                    >
                      <X className="h-3.5 w-3.5" />
                    </div>
                  )}
                </SelectTrigger>

                <SelectContent className="max-h-[220px] z-50">
                  {timeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasError && (
              <p className="text-xs font-medium text-destructive mt-0.5" data-test-id={`text-error-${identifier}`}>
                {error.message as string}
              </p>
            )}

            {!hasError && helperText && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {helperText}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default TimePicker;
