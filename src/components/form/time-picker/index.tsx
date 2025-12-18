import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FormControl from "@mui/material/FormControl";
import clsx from "clsx";
import dayjs, { type Dayjs } from "dayjs";
import { Controller, type FieldValues } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker as MuiDateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import styles from "./time-picker.module.scss";
import type { CustomDateTimePickerProps } from "./time.picker.type";

const DateTimePicker = <T extends FieldValues>({
  name,
  control,
  placeholder,
  identifier,
  disabled,
  minDateTime,
  maxDateTime,
  handleChange,
}: CustomDateTimePickerProps<T>) => {
  const openPickerIcon = (props: any) => (
    <CalendarTodayIcon
      {...props}
      className={clsx(styles.icon, {
        [styles.disabledIcon]: disabled,
      })}
    />
  );

  return (
    <FormControl fullWidth>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
          const parsed: Dayjs | null = typeof value === "string" && value ? dayjs(value) : null;
          const pickerValue = parsed && parsed.isValid() ? parsed : null;
          const handleDateTimeChange = (newValue: Dayjs | null) => {
            if (!newValue || !newValue.isValid()) {
              onChange("");
              handleChange?.();
              return;
            }
            onChange(newValue.toISOString());
            handleChange?.();
          };

          return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MuiDateTimePicker
                value={pickerValue}
                onChange={handleDateTimeChange}
                label={placeholder}
                disabled={disabled}
                minDateTime={minDateTime ?? undefined}
                maxDateTime={maxDateTime ?? undefined}
                slots={{ openPickerIcon }}
                slotProps={{
                  textField: {
                    onBlur,
                    error: !disabled && !!error,
                    helperText: !disabled && error ? error.message : "",
                    inputRef: ref,
                    InputProps: { className: styles.dateTimePickerInput },
                    inputProps: {
                      className: styles.input,
                      "data-test-id": `date-time-picker-input-${identifier}`,
                    },
                    InputLabelProps: {
                      classes: {
                        root: styles.label,
                        shrink: styles.shrunkLabel,
                        disabled: styles.disabledLabel,
                      },
                    },
                  },
                  openPickerButton: {
                    ...({ "data-test-id": `btn-date-time-picker-open-${identifier}` } as any),
                  },
                }}
                data-test-id={`date-time-picker-${identifier}`}
              />
            </LocalizationProvider>
          );
        }}
      />
    </FormControl>
  );
};

export default DateTimePicker;
