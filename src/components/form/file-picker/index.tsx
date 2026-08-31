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

const FilePicker = <T extends FieldValues>({
  label,
  disabled,
  identifier,
  control,
  name,
  accept = "image/*",
  maxSizeBytes = 5 * 1024 * 1024,
  uploadFn,
}: FilePickerProps<T>) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = (e: MouseEvent<HTMLDivElement>, hasValue: boolean) => {
    e.stopPropagation();
    if (!disabled && !loading && !hasValue) inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, onChange: (value: any) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);

    if (file.size > maxSizeBytes) {
      callSnack("File is too large", "error");
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      callSnack("Invalid file type. Only images are allowed.", "error");
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      const result = await uploadFn(file);
      onChange(result);
    } catch {
      callSnack("Failed to upload file", "error");
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
                placeholder="Select a file"
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

            {value?.url && (
              <div className="relative group w-12 h-12 mt-2 rounded-xl overflow-hidden border border-border/60 shadow-sm bg-muted/20 shrink-0">
                <img
                  src={value.url}
                  alt={value.filename || "Uploaded logo"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {!isDisabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile(onChange);
                      onBlur();
                    }}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
                  >
                    <div className="p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow transition-colors">
                      <X size={12} />
                    </div>
                  </button>
                )}
              </div>
            )}

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
                handleFileChange(e, onChange);
                onBlur();
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
