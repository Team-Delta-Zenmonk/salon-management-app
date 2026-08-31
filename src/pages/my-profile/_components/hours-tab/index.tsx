import React from "react";
import type { Control, UseFormSetValue, FieldPath } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { SalonProfileForm } from "../../schema/my-profile.schema";
import { DAY_KEYS, DAY_LABELS } from "../constants/business-hours.constants";
import { Switch } from "../../../../components/ui/switch";
import { CalendarDays } from "lucide-react";
import TimePicker from "../../../../components/form/time-picker";

interface HoursSectionProps {
  control: Control<SalonProfileForm>;
  setValue: UseFormSetValue<SalonProfileForm>;
  isSaving: boolean;
}

export const HoursSection: React.FC<HoursSectionProps> = ({
  control,
  setValue,
}) => {
  const businessHours = useWatch({ control, name: "business_hours" }) || {};

  const handleToggleDay = (dayKey: string, checked: boolean) => {
    const path = `business_hours.${dayKey}` as FieldPath<SalonProfileForm>;
    if (checked) {
      setValue(path, { start_time: "09:00", end_time: "18:00" }, { shouldDirty: true });
    } else {
      setValue(path, null, { shouldDirty: true });
    }
  };

  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <CalendarDays className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Weekly Operational Schedule
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="relative z-10">
        {DAY_KEYS.map((dayKey) => {
          const dayValue = businessHours[dayKey];
          const isOpen = !!dayValue;
          const label = DAY_LABELS[dayKey];

          return (
            <div key={dayKey} className="border-b border-border/40 last:border-0 py-2">
              {/* Row 1: Day name + Closed badge + Toggle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isOpen
                        ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  <span className={`text-xs font-semibold ${isOpen ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                  {!isOpen && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-muted/60 text-muted-foreground border border-border/50 shrink-0">
                      Closed
                    </span>
                  )}
                </div>

                <Switch
                  checked={isOpen}
                  onCheckedChange={(checked) => handleToggleDay(dayKey, checked)}
                  className="data-[state=checked]:bg-emerald-500 cursor-pointer shrink-0 scale-[0.85]"
                />
              </div>

              {/* Stacked time pickers — full width, shown only when open */}
              {isOpen && (
                <div className="mt-2 pl-3.5 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Opens</span>
                    <TimePicker
                      name={`business_hours.${dayKey}.start_time`}
                      control={control}
                      placeholder="09:00 AM"
                      identifier={`start-time-${dayKey}`}
                      triggerClassName="bg-white dark:bg-neutral-900 !h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Closes</span>
                    <TimePicker
                      name={`business_hours.${dayKey}.end_time`}
                      control={control}
                      placeholder="06:00 PM"
                      identifier={`end-time-${dayKey}`}
                      triggerClassName="bg-white dark:bg-neutral-900 !h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
