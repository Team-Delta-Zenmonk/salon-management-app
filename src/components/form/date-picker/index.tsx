import * as React from "react";
import dayjs, { type Dayjs } from "dayjs";
import { format as dateFnsFormat } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Controller, type FieldValues } from "react-hook-form";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { CustomDatePickerProps } from "./date-picker.type";
import { cn } from "@/lib/utils";

const DatePicker = <T extends FieldValues>({
  name,
  control,
  placeholder,
  identifier,
  label,
  format = "DD-MM-YYYY",
  disableFuture,
  disablePast,
  disabled,
  minDate,
  handleChange,
  rules,
}: CustomDatePickerProps<T>) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        const parsed: Dayjs | null = typeof value === "string" && value ? dayjs(value, format, true) : null;
        const dateValue: Date | undefined = parsed?.isValid() ? parsed.toDate() : undefined;

        const handleDateChange = (newDate: Date | undefined) => {
          if (!newDate) {
            onChange("");
            handleChange?.();
            setIsOpen(false);
            return;
          }

          onChange(dayjs(newDate).format(format));
          handleChange?.();
          setIsOpen(false);
        };

        const hasError = !disabled && !!error;

        return (
          <div className="flex flex-col gap-1.5 w-full" data-test-id={`date-picker-container-${identifier}`}>
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
            <div className="relative">
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger
                  disabled={disabled}
                  ref={ref as any}
                  className={cn(
                    "flex w-full min-w-0 rounded-lg border bg-input-bg px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-input-border-hover disabled:hover:border-input-border disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 resize-none h-[40px] items-center justify-between",
                    hasError ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "border-input-border",
                    !dateValue && "text-muted-foreground"
                  )}
                  onBlur={onBlur}
                  data-test-id={`date-picker-${identifier}`}
                >
                  <span className="truncate">
                    {dateValue ? dateFnsFormat(dateValue, "dd-MM-yyyy") : <span className="opacity-70">{placeholder}</span>}
                  </span>
                  <div className="flex items-center">
                    {dateValue && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDateChange(undefined);
                        }}
                        className="mr-1.5 flex items-center justify-center rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={handleDateChange}
                    disabled={(date) => {
                      let isDisabled = false;
                      const djsDate = dayjs(date);
                      
                      if (disableFuture && djsDate.isAfter(dayjs(), 'day')) isDisabled = true;
                      if (disablePast && djsDate.isBefore(dayjs(), 'day')) isDisabled = true;
                      if (minDate && djsDate.isBefore(minDate, 'day')) isDisabled = true;
                      
                      return isDisabled;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {hasError && (
              <p
                className="text-xs font-medium text-destructive mt-0.5"
                data-test-id={`date-picker-error-${identifier}`}
              >
                {error.message as string}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default DatePicker;
