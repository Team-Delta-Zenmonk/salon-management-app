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

  const setDayClosed = (day: DayKey, closed: boolean) => {
    const path = `active_hours.${day}` as FieldPath<StaffForm>;
    if (closed) {
      setValue(path, null, { shouldDirty: true });
      return;
    }
    setValue(
      path,
      { start_time: "", end_time: "" },
      { shouldDirty: true }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Weekly Working Schedule</div>

      <div className="flex flex-col gap-4">
        {DaysList.map((day) => {
          const val = activeHours ? (activeHours as Record<DayKey, { start_time: string; end_time: string } | null | undefined>)[day] : undefined;
          const isClosed = val === null || val === undefined;

          return (
            <div 
              key={day} 
              className={`border rounded-2xl p-4 transition-all duration-300 ${
                isClosed 
                  ? "bg-muted/10 border-border/40 opacity-70" 
                  : "bg-card/40 border-primary/20 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold capitalize text-foreground flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isClosed ? "bg-muted-foreground/30" : "bg-primary"}`} />
                  {day}
                </span>

                <div className="flex items-center space-x-2.5 bg-background/50 border border-border/30 px-3 py-1.5 rounded-full">
                  <Switch
                    id={`closed-${day}`}
                    checked={isClosed}
                    onCheckedChange={(checked) => setDayClosed(day, checked)}
                    disabled={disabled}
                  />
                  <Label htmlFor={`closed-${day}`} className="text-xs font-semibold select-none cursor-pointer">Closed</Label>
                </div>
              </div>

              {!isClosed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-border/10">
                  <TimePicker
                    name={`active_hours.${day}.start_time` as FieldPath<StaffForm>}
                    control={control}
                    placeholder="Start Time"
                    identifier={`staff-${day}-start`}
                    disabled={disabled}
                    label="Start Time"
                  />

                  <TimePicker
                    name={`active_hours.${day}.end_time` as FieldPath<StaffForm>}
                    control={control}
                    placeholder="End Time"
                    identifier={`staff-${day}-end`}
                    disabled={disabled}
                    label="End Time"
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
