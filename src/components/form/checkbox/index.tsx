import React, { useId } from "react";
import clsx from "clsx";
import { Controller, type FieldValues } from "react-hook-form";
import type { CustomCheckboxProps } from "./checkbox.type";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CheckboxGroup = <T extends FieldValues>({
  name,
  control,
  rules,
  identifier,
  inputPropsClassName = "",
  showError = true,
  options,
  row,
  optionGap,
}: CustomCheckboxProps<T>) => {
  const generatedId = useId();

  const handleCheckedChange = (
    checked: boolean,
    value: string,
    onChange: (event: any[]) => void,
    storedValue: string[] | undefined
  ) => {
    if (checked) {
      onChange(storedValue ? [...storedValue, value] : [value]);
    } else {
      onChange(storedValue ? storedValue.filter((val) => val !== value) : []);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value: storedValue, onBlur, ref }, fieldState: { error } }) => {
        const hasError = !!error;

        return (
          <div className="flex flex-col gap-1.5 w-full" data-test-id={`checkbox-group-${identifier}`}>
            <div
              className={clsx("flex flex-wrap", row ? "flex-row" : "flex-col")}
              style={{ gap: optionGap ?? (row ? "16px" : "8px") }}
            >
              {options.map(({ label, value, disabled }, index) => {
                const isChecked = storedValue?.includes(value) ?? false;
                const checkboxId = `${identifier || generatedId}-${index}`;

                return (
                  <div key={`${label}-${value}`} className="flex items-center space-x-2">
                    <ShadcnCheckbox
                      id={checkboxId}
                      ref={ref as any}
                      checked={isChecked}
                      disabled={disabled}
                      onCheckedChange={(checked) => handleCheckedChange(!!checked, value, onChange, storedValue)}
                      onBlur={onBlur}
                      aria-invalid={hasError}
                      data-test-id={`${identifier}-${value}`}
                      className={clsx(
                        hasError && "border-destructive aria-invalid:border-destructive aria-invalid:ring-destructive",
                        inputPropsClassName
                      )}
                    />
                    <Label
                      htmlFor={checkboxId}
                      className={clsx(
                        "text-sm font-medium leading-none cursor-pointer",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {label}
                    </Label>
                  </div>
                );
              })}
            </div>
            
            {showError && hasError && (
              <p
                className="text-xs font-medium text-destructive mt-0.5"
                data-test-id={`checkbox-error-${identifier}`}
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

export default CheckboxGroup;
