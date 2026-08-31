import { Controller, type FieldValues } from "react-hook-form";
import clsx from "clsx";
import { type OTPInputProps } from "./otp-input.type";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";


const OTPInput = <T extends FieldValues>({
  name,
  control,
  length = 6,
  disabled = false,
  identifier = "otp",
}: OTPInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const hasError = !!error;

        return (
          <div className="flex flex-col gap-1.5 w-full items-center" data-test-id={`otp-container-${identifier}`}>
            <InputOTP
              maxLength={length}
              value={value || ""}
              onChange={onChange}
              disabled={disabled}
              data-test-id={`input-otp-${identifier}`}
            >
              <InputOTPGroup>
                {Array.from({ length }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={clsx(
                      "w-12 h-14 text-lg border-input-border",
                      hasError && "border-destructive text-destructive"
                    )}
                    data-test-id={`input-${identifier}-${index}`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            {hasError && (
              <p
                className="text-xs font-medium text-destructive mt-1"
                data-test-id={`text-error-${identifier}`}
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

export default OTPInput;
