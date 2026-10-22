import { useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import clsx from "clsx";
import { X, UploadCloud, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import type { FilePickerProps } from "./file-picker.type";
import { callSnack } from "../../snackbar";
import { ALLOWED_IMAGE_TYPES } from "../../../common/allowed-images.type";
import {
  validateUploadFile,
  extractUploadErrorMessage,
} from "../../../features/upload-images/upload-images.utils";

const FilePicker = <T extends FieldValues>({
  label,
  disabled,
  identifier,
  control,
  name,
  accept = "image/*",
  maxSizeBytes = 5 * 1024 * 1024,
  uploadFn,
  placeholder
}: FilePickerProps<T>) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = (e: MouseEvent<HTMLDivElement>, hasValue: boolean) => {
    e.stopPropagation();
    if (!disabled && !loading && !hasValue) inputRef.current?.click();
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: any) => void,
    onBlur: () => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file, {
      maxSizeBytes,
      allowedTypes: ALLOWED_IMAGE_TYPES,
    });

    if (!validation.valid) {
      callSnack(validation.error!, "error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      const result = await uploadFn(file);
      onChange(result);
      onBlur();
    } catch (err: any) {
      callSnack(extractUploadErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = (onChange: (value: string | null) => void) => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const renderEndAdornment = (
    loading: boolean,
    value: any,
    identifier: string,
    disabled: boolean | undefined,
    onChange: (value: string | null) => void,
  ) => {
    if (loading) {
      return (
        <Loader2 
          className="animate-spin text-muted-foreground mr-2" 
          size={20} 
          data-test-id={`loading-${identifier}`} 
        />
      );
    }

    if (value) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          data-test-id={`clear-btn-${identifier}`}
          onClick={(e) => {
            e.stopPropagation();
            clearFile(onChange);
          }}
          disabled={disabled}
        >
          <X size={18} data-test-id={`clear-btn-icon-${identifier}`} />
        </Button>
      );
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground pointer-events-none"
        disabled={disabled}
        data-test-id={`upload-btn-${identifier}`}
      >
        <UploadCloud size={18} data-test-id={`upload-btn-icon-${identifier}`} />
      </Button>
    );
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const hasError = !!error;
        const isDisabled = disabled || loading;

        return (
          <div className="flex flex-col gap-1.5 w-full" data-test-id={identifier}>
            {label && (
              <Label
                className={clsx(
                  "text-sm font-medium",
                  hasError ? "text-destructive" : "text-foreground",
                  isDisabled && "opacity-50"
                )}
                data-test-id={`label-${identifier}`}
              >
                {label}
              </Label>
            )}

            <div 
              className="relative flex items-center"
              onClick={(e) => openFilePicker(e, Boolean(value))}
            >
              <Input
                readOnly
                disabled={isDisabled}
                value={value?.filename ?? ""}
                placeholder={placeholder || "Select a file"}
                className={clsx(
                  "cursor-pointer pr-10",
                  hasError && "border-destructive focus-visible:ring-destructive",
                  !value && "text-muted-foreground"
                )}
                aria-invalid={hasError}
                data-test-id={`text-input-${identifier}`}
              />
              <div className="absolute right-1 flex items-center">
                {renderEndAdornment(loading, value, identifier, disabled, onChange)}
              </div>
            </div>

            {value?.url && (() => {
              const isPdf =
                value.format === "pdf" ||
                value.url?.toLowerCase().endsWith(".pdf") ||
                value.filename?.toLowerCase().endsWith(".pdf");

              return (
                <div className="relative w-12 h-12 mt-2 shrink-0 group">
                  <div className="w-full h-full rounded-xl overflow-hidden border border-border/50 shadow-xs bg-muted/20 flex items-center justify-center">
                    {isPdf ? (
                      <div className="flex flex-col items-center justify-center text-primary p-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                          PDF
                        </span>
                      </div>
                    ) : (
                      <img
                        src={value.url}
                        alt={value.filename || "Uploaded file"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  {!isDisabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile(onChange);
                        onBlur();
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer z-10"
                      title="Remove file"
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              );
            })()}

            {hasError && (
              <p
                className="text-xs font-medium text-destructive mt-0.5"
                data-test-id={`error-${identifier}`}
              >
                {error.message}
              </p>
            )}

            <input
              ref={inputRef}
              data-test-id={`input-${identifier}`}
              onChange={(e) => {
                handleFileChange(e, onChange, onBlur);
              }}
              accept={accept}
              hidden
              type="file"
            />
          </div>
        );
      }}
    />
  );
};

export default FilePicker;
