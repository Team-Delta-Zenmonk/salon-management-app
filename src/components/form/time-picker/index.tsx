import { useState, useEffect, useCallback } from "react";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import FormControl from "@mui/material/FormControl";
import MuiTextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import clsx from "clsx";
import dayjs from "dayjs";
import { Controller, type FieldValues } from "react-hook-form";
import ScrollTimePicker from "./_components/scroll-time-picker";
import styles from "./time-picker.module.scss";
import type { CustomDateTimePickerProps } from "./time.picker.type";

function parseTimeString(value: string | undefined | null) {
  const parsed = typeof value === "string" && value ? dayjs(value, "HH:mm") : null;
  const isValid = parsed?.isValid() ?? false;

  return {
    hour12: isValid ? ((parsed!.hour() % 12) || 12) : 12,
    minute: isValid ? parsed!.minute() : 0,
    period: (isValid ? (parsed!.hour() >= 12 ? "PM" : "AM") : "AM") as "AM" | "PM",
    displayValue: isValid ? parsed!.format("hh:mm A") : "",
  };
}

const TimePicker = <T extends FieldValues>({
  name,
  control,
  placeholder,
  identifier,
  disabled,
  handleChange,
}: CustomDateTimePickerProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [draftH, setDraftH] = useState(12);
  const [draftM, setDraftM] = useState(0);
  const [draftP, setDraftP] = useState<"AM" | "PM">("AM");
  const [fieldValue, setFieldValue] = useState<string>("");
  useEffect(() => {
    if (open) {
      const { hour12, minute, period } = parseTimeString(fieldValue);
      setDraftH(hour12);
      setDraftM(minute);
      setDraftP(period);
    }
  }, [open, fieldValue]);

  const handlePickerChange = useCallback((h: number, m: number, p: "AM" | "PM") => {
    setDraftH(h);
    setDraftM(m);
    setDraftP(p);
  }, []);

  return (
    <FormControl fullWidth>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
          const { displayValue } = parseTimeString(value);

          if (value !== fieldValue) {
            queueMicrotask(() => setFieldValue(value ?? ""));
          }

          const commitValue = () => {
            let hour24 = draftH % 12;
            if (draftP === "PM") hour24 += 12;
            const timeString = `${String(hour24).padStart(2, "0")}:${String(draftM).padStart(2, "0")}`;
            onChange(timeString);
            handleChange?.();
            setAnchorEl(null);
          };

          return (
            <>
              <MuiTextField
                fullWidth
                size="medium"
                disabled={disabled}
                error={!disabled && !!error}
                helperText={!disabled && error ? error.message : ""}
                placeholder={placeholder}
                label={placeholder}
                value={displayValue}
                inputRef={ref}
                onBlur={onBlur}
                autoComplete="off"
                onClick={(e) => {
                  if (!disabled) setAnchorEl(e.currentTarget);
                }}
                slotProps={{
                  htmlInput: {
                    readOnly: true,
                    "data-test-id": `time-picker-input-${identifier}`,
                    className: styles.input,
                    style: { cursor: disabled ? "default" : "pointer" },
                  },
                  input: {
                    className: styles.dateTimePickerInput,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          disabled={disabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!disabled) setAnchorEl(e.currentTarget);
                          }}
                          data-test-id={`btn-time-picker-open-${identifier}`}
                        >
                          <AccessTimeOutlinedIcon
                            className={clsx(styles.icon, {
                              [styles.disabledIcon]: disabled,
                            })}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                  inputLabel: {
                    ...({ "data-test-id": `label-${identifier}` } as any),
                    classes: {
                      root: styles.label,
                      shrink: styles.shrunkLabel,
                      disabled: styles.disabledLabel,
                    },
                  },
                  formHelperText: {
                    ...({ "data-test-id": `text-error-${identifier}` } as any),
                  },
                }}
                className={styles.textfield}
                data-test-id={`time-picker-${identifier}`}
              />

              <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                slotProps={{
                  paper: {
                    sx: (t: any) => ({
                      mt: 1,
                      borderRadius: `${t.shape.borderRadius * 1.5}px`,
                      overflow: "visible",
                      minWidth: 280,
                    }),
                  },
                }}
              >
                <Box sx={{ p: 2 }}>
                  <ScrollTimePicker
                    hours={draftH}
                    minutes={draftM}
                    period={draftP}
                    onChange={handlePickerChange}
                  />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      onClick={() => setAnchorEl(null)}
                      sx={(t: any) => ({ fontWeight: t.fontWeight.semiBold })}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={commitValue}
                      sx={(t: any) => ({ fontWeight: t.fontWeight.semiBold })}
                    >
                      OK
                    </Button>
                  </Box>
                </Box>
              </Popover>
            </>
          );
        }}
      />
    </FormControl>
  );
};

export default TimePicker;
