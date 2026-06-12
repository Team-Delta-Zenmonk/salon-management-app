import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import FormControl from "@mui/material/FormControl";
import clsx from "clsx";
import dayjs, { type Dayjs } from "dayjs";
import { Controller, type FieldValues } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileTimePicker as MuiTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderMultiSectionDigitalClockTimeView } from "@mui/x-date-pickers/timeViewRenderers";
import styles from "./time-picker.module.scss";
import type { CustomDateTimePickerProps } from "./time.picker.type";

const TimePicker = <T extends FieldValues>({
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
    <AccessTimeOutlinedIcon
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
          const parsed: Dayjs | null = typeof value === "string" && value ? dayjs(value, "HH:mm") : null;
          const pickerValue = parsed?.isValid() ? parsed : null;

          const handleTimeChange = (newValue: Dayjs | null) => {
            if (!newValue?.isValid()) {
              onChange("");
              handleChange?.();
              return;
            }
            const timeString = newValue.format("HH:mm");
            onChange(timeString);
            handleChange?.();
          };

          return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MuiTimePicker
                value={pickerValue}
                onChange={handleTimeChange}
                label={placeholder}
                disabled={disabled}
                minTime={minDateTime ?? undefined}
                maxTime={maxDateTime ?? undefined}
                viewRenderers={{
                  hours: renderMultiSectionDigitalClockTimeView as any,
                  minutes: renderMultiSectionDigitalClockTimeView as any,
                  seconds: renderMultiSectionDigitalClockTimeView as any,
                }}
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
                      "data-test-id": `time-picker-input-${identifier}`,
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
                    ...({ "data-test-id": `btn-time-picker-open-${identifier}` } as any),
                  },
                }}
                data-test-id={`time-picker-${identifier}`}
              />
            </LocalizationProvider>
          );
        }}
      />
    </FormControl>
  );
};

export default TimePicker;
