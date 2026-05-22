import { useRef } from "react";
import { Box } from "@mui/material";
import MuiTextField from "@mui/material/TextField";
import { Controller, type FieldValues } from "react-hook-form";
import clsx from "clsx";
import styles from "./otp-input.module.scss";
import { type OTPInputProps } from "./otp-input.type";

const OTPInput = <T extends FieldValues>({
  name,
  control,
  length = 6,
  disabled = false,
  identifier = "otp",
}: OTPInputProps<T>) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string, currentOtp: string, onChange: (value: string) => void) => {
    if (value && !/^\d$/.test(value)) return;

    const otpArray = currentOtp ? currentOtp.split("") : new Array(length).fill("");
    otpArray[index] = value;
    onChange(otpArray.join(""));
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: any, currentOtp: string, onChange: (value: string) => void) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const otpArray = currentOtp ? currentOtp.split("") : new Array(length).fill("");

      if (otpArray[index]) {
        otpArray[index] = "";
        onChange(otpArray.join(""));
      } else if (index > 0) {
        otpArray[index - 1] = "";
        onChange(otpArray.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent, onChange: (value: string) => void) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);

    if (!/^\d+$/.test(pastedData)) return;

    const otpArray = new Array(length).fill("");
    pastedData.split("").forEach((char, index) => {
      if (index < length) {
        otpArray[index] = char;
      }
    });

    onChange(otpArray.join(""));
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const otpValues = value ? value.split("") : new Array(length).fill("");

        return (
          <Box className={styles.otpContainer}>
            <Box className={styles.otpInputWrapper}>
              {Array.from({ length }).map((_, index) => (
                <MuiTextField
                  key={`otp-input-${index}`}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  value={otpValues[index] ?? ""}
                  onChange={(e) => handleChange(index, e.target.value, value ?? "", onChange)}
                  onKeyDown={(e) => handleKeyDown(index, e, value ?? "", onChange)}
                  onPaste={index === 0 ? (e) => handlePaste(e, onChange) : undefined}
                  disabled={disabled}
                  error={!!error}
                  helperText={index === 0 && error ? error.message : ""}
                  autoComplete="off"
                  slotProps={{
                    htmlInput: {
                      maxLength: 1,
                      "data-test-id": `input-${identifier}-${index}`,
                      className: styles.otpInput,
                    },
                    formHelperText: {
                      className: styles.otpHelperText,
                      ...({ "data-test-id": `text-error-${identifier}` } as any),
                    },
                  }}
                  className={clsx(styles.otpTextField)}
                  data-test-id={`textfield-${identifier}-${index}`}
                />
              ))}
            </Box>
          </Box>
        );
      }}
    />
  );
};

export default OTPInput;
