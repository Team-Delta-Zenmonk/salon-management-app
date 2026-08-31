import React, { useId } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { Controller, type FieldValues } from "react-hook-form";
import type { CustomSelectProps } from "./select.type";
import { Label } from "@/components/ui/label";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Select = <T extends FieldValues>({
  placeholder,
  name,
  options,
  control,
  identifier,
  label,
  translate = true,
  disabled = false,
  rules,
  triggerClassName,
}: CustomSelectProps<T>) => {
  const generatedId = useId();
  const selectId = identifier || generatedId;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        const hasError = !!error;

        return (
          <div className="flex flex-col gap-1.5 w-full" data-test-id={`select-wrapper-${identifier}`}>
            {label && (
              <Label 
                htmlFor={selectId}
                className={clsx(
                  "text-sm font-medium",
                  hasError ? "text-destructive" : "text-foreground",
                  disabled && "opacity-50"
                )}
                data-test-id={`label-${identifier}`}
              >
                {label}
              </Label>
            )}

            <ShadcnSelect
              value={value ?? ""}
              onValueChange={onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={selectId}
                ref={ref}
                onBlur={onBlur}
                className={clsx(
                  "w-full shadow-sm",
                  hasError && "border-destructive focus:ring-destructive aria-invalid:border-destructive aria-invalid:ring-destructive",
                  triggerClassName
                )}
                data-test-id={`select-${identifier}`}
                aria-invalid={hasError}
              >
                <div className="truncate flex-1 text-left flex items-center gap-1.5 line-clamp-1 pr-2">
                  {value ? options?.find((o) => o.value === value)?.label || value : <span className="text-muted-foreground">{placeholder}</span>}
                </div>
                {value && (
                  <div
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange("");
                    }}
                    className="mr-1 flex items-center justify-center rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                {options && options.length > 0 ? (
                  options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-test-id={`li-${identifier}-${option.label}`}
                    >
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled data-test-id={`li-${identifier}-no-options`}>
                    No options
                  </SelectItem>
                )}
              </SelectContent>
            </ShadcnSelect>

            {hasError && (
              <p 
                className="text-xs font-medium text-destructive mt-0.5" 
                data-test-id={`text-error-${identifier}`}
              >
                {error?.message as string}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default Select;
