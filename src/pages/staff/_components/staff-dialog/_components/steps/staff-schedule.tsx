import type { Control, UseFormSetValue, UseFormWatch, FieldPath } from "react-hook-form";
import type { StaffForm } from "../../../schema/staff.schema";
import { DaysList, type DayKey } from "../../../../../../common/enums/days.enum";
import TimePicker from "../../../../../../components/form/time-picker";
import { Switch } from "../../../../../../components/ui/switch";
import { Label } from "../../../../../../components/ui/label";

export default function StaffSchedule({
  control,
  watch,
  setValue,
  disabled,
}: Readonly<{
  control: Control<StaffForm>;
  watch: UseFormWatch<StaffForm>;
  setValue: UseFormSetValue<StaffForm>;
  disabled: boolean;
}>) {
  const activeHours = watch("active_hours");

  const handleToggleDay = (day: DayKey, isOpen: boolean) => {
    const path = `active_hours.${day}` as FieldPath<StaffForm>;
    if (!isOpen) {
      setValue(path, null, { shouldDirty: true });
      return;
    }
    setValue(
      path,
      { start_time: "09:00", end_time: "21:00" },
      { shouldDirty: true }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Weekly Working Schedule</div>

      <div className="flex flex-col gap-4">
        {DaysList.map((day) => {
          const val = activeHours ? (activeHours as Record<DayKey, { start_time: string; end_time: string } | null | undefined>)[day] : undefined;
          const isOpen = Boolean(val && val.start_time !== undefined);

          return (
            <div
              key={day}
              className={`border rounded-2xl p-4 transition-all duration-300 ${!isOpen
                ? "bg-muted/10 border-border/50 opacity-70"
                : "bg-card/40 border-primary/20 shadow-xs"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold capitalize text-foreground flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${!isOpen ? "bg-muted-foreground/30" : "bg-primary"}`} />
                  {day}
                </span>

                <div className="flex items-center space-x-2.5 bg-background/50 border border-border/30 px-3 py-1.5 rounded-full">
                  <Switch
                    id={`open-${day}`}
                    checked={isOpen}
                    onCheckedChange={(checked) => handleToggleDay(day, checked)}
                    disabled={disabled}
                  />
                  <Label htmlFor={`open-${day}`} className="text-xs font-semibold select-none cursor-pointer">{isOpen ? "Open" : "Closed"}</Label>
                </div>
              </div>

              {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-border/10">
                  <TimePicker
                    name={`active_hours.${day}.start_time` as FieldPath<StaffForm>}
                    control={control}
                    placeholder="Start Time"
                    identifier={`staff-${day}-start`}
                    disabled={disabled}
                    label="Start Time"
                    isManual
                  />

                  <TimePicker
                    name={`active_hours.${day}.end_time` as FieldPath<StaffForm>}
                    control={control}
                    placeholder="End Time"
                    identifier={`staff-${day}-end`}
                    disabled={disabled}
                    label="End Time"
                    isManual
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
