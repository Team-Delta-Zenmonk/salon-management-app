import React, { useId } from "react";
import clsx from "clsx";
import { Controller, type FieldValues } from "react-hook-form";
import ArrowButtons from "./_components/arrow-buttons";
import { type CustomTextFieldProps } from "./textfield.type";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TextField = <T extends FieldValues>({
  type,
  placeholder,
  name,
  control,
  handleChange,
  pattern,
  label,
  startAdornment,
  endAdornment,
  handleBlur,
  disabled,
  maxLength,
  rules,
  identifier,
  endAdornmentClassName,
  endAdornmentToolTipText,
  onEndAdornmentClick,
  inputPropsClassName,
  showError = true,
  highlightPrimaryIconButton = false,
  processChange,
  extraSpacesNotAllowed = true,
  min,
  max,
  multiline,
  rows,
}: CustomTextFieldProps<T>) => {
  const generatedId = useId();
  const inputId = identifier || generatedId;

  const handleNumberChange = (evt: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (
      !/\d/.test(evt.key) &&
      evt.key !== "Backspace" &&
      evt.key !== "Delete" &&
      evt.key !== "ArrowLeft" &&
      evt.key !== "ArrowRight" &&
      evt.key !== "ArrowUp" &&
      evt.key !== "ArrowDown" &&
      evt.key !== "Tab"
    ) {
      evt.preventDefault();
    }
  };

  const handleInput = (e: any) => {
    if (extraSpacesNotAllowed) {
      const input = e.target;
      const cleaned = input.value.replace(/^\s+/, "").replaceAll(/\s{2,}/g, " ");
      if (input.value !== cleaned) {
        const diff = input.value.length - cleaned.length;
        const caretPos = Math.max(input.selectionStart - diff, 0);

        input.value = cleaned;
        input.setSelectionRange(caretPos, caretPos);
      }
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value, onBlur, ref, ...others }, fieldState: { error } }) => {
        const hasError = Boolean(error) && showError;

        const handleBeforeInput = (e: any) => {
          const input = e.target as HTMLInputElement;
          const { selectionStart, selectionEnd, value } = input;
          const newValue = value.slice(0, selectionStart!) + (e.data ?? "") + value.slice(selectionEnd!);
          if (
            (extraSpacesNotAllowed && (!value?.trim() && !newValue.trim())) ||
            value.replaceAll(/\s+/g, " ") === newValue.replaceAll(/\s+/g, " ")
          ) {
            e.preventDefault();
            return;
          }
          if (pattern && !pattern.test(newValue)) {
            e.preventDefault();
          }
        };

        const handleChangeInternal = (e: any) => {
          const newValue = e.target.value;
          if (handleChange) {
            return handleChange(e);
          }
          if (!pattern || pattern?.test(newValue)) {
            onChange(processChange ? processChange(newValue) : newValue);
          }
        };

        const renderInput = () => {
          if (multiline) {
            return (
              <textarea
                id={inputId}
                ref={ref as any}
                value={value ?? ""}
                onChange={handleChangeInternal}
                onBlur={handleBlur ?? onBlur}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                rows={rows || 4}
                onInput={handleInput}
                onKeyDown={(evt) => type === "number" && handleNumberChange(evt as any)}
                onBeforeInput={handleBeforeInput}
                data-test-id={`input-${identifier}`}
                className={clsx(
                  "flex w-full min-w-0 rounded-lg border bg-input-bg px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-input-border-hover disabled:hover:border-input-border disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 resize-none",
                  hasError ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "border-input-border",
                  inputPropsClassName
                )}
                {...(others as any)}
              />
            );
          }

          return (
            <div className="relative w-full">
              {startAdornment && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center pointer-events-none">
                  {startAdornment}
                </div>
              )}
              <Input
                id={inputId}
                type={type}
                ref={ref}
                value={value ?? ""}
                onChange={handleChangeInternal}
                onBlur={handleBlur ?? onBlur}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                min={min}
                max={max}
                onInput={handleInput}
                onKeyDown={(evt) => type === "number" && handleNumberChange(evt as any)}
                onBeforeInput={handleBeforeInput}
                data-test-id={`input-${identifier}`}
                className={clsx(
                  "w-full shadow-sm",
                  startAdornment && "pl-10",
                  (endAdornment || type === "number") && "pr-10",
                  hasError && "border-destructive focus-visible:ring-destructive aria-invalid:border-destructive aria-invalid:ring-destructive",
                  inputPropsClassName
                )}
                aria-invalid={hasError}
                {...(others as any)}
              />
              {(endAdornment || type === "number") && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  {type === "number" ? (
                    <ArrowButtons
                      endAdornmentClassName={endAdornmentClassName}
                      onChange={onChange}
                      value={value}
                      error={error}
                      identifier={identifier}
                      min={min}
                      max={max}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onEndAdornmentClick?.(value!)}
                      title={endAdornmentToolTipText}
                      data-test-id={`btn-end-adornment-${identifier}`}
                      className={clsx(
                        "flex items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors",
                        disabled && "opacity-50 cursor-not-allowed",
                        hasError && "text-destructive",
                        highlightPrimaryIconButton && "text-primary hover:text-primary/80",
                        endAdornmentClassName
                      )}
                    >
                      {endAdornment}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        };

        return (
          <div className="flex flex-col gap-1.5 w-full" data-test-id={`textfield-${identifier}`}>
            {label && (
              <Label
                htmlFor={inputId}
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

            {renderInput()}

            {hasError && (
              <p
                className="text-xs font-medium text-destructive mt-0.5"
                data-test-id={`text-error-${identifier}`}
              >
                {error?.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default TextField;
