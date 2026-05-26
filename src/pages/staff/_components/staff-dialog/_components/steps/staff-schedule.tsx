import { Box, Typography, FormControlLabel, Switch } from "@mui/material";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { StaffForm } from "../../../schema/staff.schema";
import { DaysList, type DayKey } from "../../../../../../common/enums/days.enum";
import TimePicker from "../../../../../../components/form/time-picker";

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
    if (closed) {
      setValue(`active_hours.${day}` as any, null, { shouldDirty: true });
      return;
    }
    setValue(
      `active_hours.${day}` as any,
      { start_time: "", end_time: "" },
      { shouldDirty: true }
    );
  };

  return (
    <Box className="flex flex-col gap-3">
      <Typography fontWeight="bold">Active Hours</Typography>

      <Box className="flex flex-col gap-3">
        {DaysList.map((day) => {
          const val = (activeHours as any)?.[day];
          const isClosed = val === null || val === undefined;

          return (
            <Box key={day} className="border border-gray-200 rounded-lg p-3 space-y-3">
              <Box className="flex items-center justify-between">
                <Typography fontWeight="bold" className="capitalize">
                  {day}
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={isClosed}
                      onChange={(e) => setDayClosed(day, e.target.checked)}
                      disabled={disabled}
                    />
                  }
                  label="Closed"
                />
              </Box>

              {!isClosed && (
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="flex flex-col gap-2">
                    <Typography fontWeight="bold">Start Time</Typography>
                    <TimePicker
                      name={`active_hours.${day}.start_time` as any}
                      control={control}
                      placeholder="Start Time"
                      identifier={`staff-${day}-start`}
                      disabled={disabled}
                    />
                  </Box>

                  <Box className="flex flex-col gap-2">
                    <Typography fontWeight="bold">End Time</Typography>
                    <TimePicker
                      name={`active_hours.${day}.end_time` as any}
                      control={control}
                      placeholder="End Time"
                      identifier={`staff-${day}-end`}
                      disabled={disabled}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
