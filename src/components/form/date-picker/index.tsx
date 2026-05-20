import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FormControl from "@mui/material/FormControl";
import clsx from "clsx";
import dayjs, { type Dayjs } from "dayjs";
import { Controller, type FieldValues } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import styles from "./date-picker.module.scss";
import type { CustomDatePickerProps } from "./date-picker.type";

const DatePicker = <T extends FieldValues>({
  name,
  control,
  placeholder,
  identifier,
  views = ["year", "month", "day"],
  format = "DD-MM-YYYY",
  disableFuture,
  disablePast,
  disabled,
  minDate,
  handleChange,
  rules,
}: CustomDatePickerProps<T>) => {
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
        rules={rules}
        render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
          const parsed: Dayjs | null = typeof value === "string" && value ? dayjs(value, format, true) : null;
          const dateValue = parsed && parsed.isValid() ? parsed : null;

          const handleDateChange = (newDate: Dayjs | null) => {
            if (!newDate || !newDate.isValid()) {
              onChange("");
              handleChange?.();
              return;
            }

            onChange(newDate.format(format));
            handleChange?.();
          };

          return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MuiDatePicker
                value={dateValue}
                onChange={handleDateChange}
                label={placeholder}
                format={format}
                views={views}
                disabled={disabled}
                disableFuture={disableFuture}
                disablePast={disablePast}
                minDate={minDate ?? undefined}
                slots={{ openPickerIcon }}
                slotProps={{
                  textField: {
                    onBlur,
                    error: !disabled && !!error,
                    helperText: !disabled && error ? error.message : "",
                    inputRef: ref,
                    InputProps: { className: styles.datePickerInput },
                    inputProps: {
                      className: styles.input,
                      "data-test-id": `date-picker-input-${identifier}`,
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
                    ...({ "data-test-id": `btn-date-picker-open-${identifier}` } as any),
                  },
                }}
                data-test-id={`date-picker-${identifier}`}
              />
            </LocalizationProvider>
          );
        }}
      />
    </FormControl>
  );
};

export default DatePicker;
