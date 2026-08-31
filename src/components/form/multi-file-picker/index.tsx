import { useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import clsx from "clsx";
import { X, UploadCloud, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { callSnack } from "../../snackbar";
import type { FileMultiPickerProps } from "./multi-file-picke.type";
import { ALLOWED_IMAGE_TYPES } from "../../../common/allowed-images.type";

const FileMultiPicker = <T extends FieldValues>({
  label,
  disabled,
  identifier,
  control,
  name,
  accept = "image/*",
  maxSizeBytes = 5 * 1024 * 1024,
  uploadFn,
}: FileMultiPickerProps<T>) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!disabled && !loading) inputRef.current?.click();
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: Array<{ url: string; filename: string }>) => void,
    current: Array<{ url: string; filename: string }>
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    const invalidFile = Array.from(files).find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type as any));

    if (invalidFile) {
      callSnack("Invalid file type. Only images are allowed.", "error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);

    const tooBig = Array.from(files).some((file) => file.size > maxSizeBytes);
    if (tooBig) {
      callSnack("File is too large", "error");
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      const uploadedData: Array<{ url: string; filename: string }> = [];
      for (const file of Array.from(files)) {
        const result = await uploadFn(file);
        uploadedData.push(result);
      }
      onChange([...current, ...uploadedData]);
    } catch {
      callSnack("Failed to upload files", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = (onChange: (value: Array<{ url: string; filename: string }>) => void) => {
    onChange([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeOne = (
    url: string,
    current: Array<{ url: string; filename: string }>,
    onChange: (value: Array<{ url: string; filename: string }>) => void
  ) => {
    onChange(current.filter((u) => u.url !== url));
  };

  const renderEndAdornment = (
    loading: boolean,
    arr: Array<{ url: string; filename: string }>,
    identifier: string,
    disabled: boolean | undefined,
    onChange: (value: Array<{ url: string; filename: string }>) => void,
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

    if (arr.length) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          data-test-id={`clear-btn-${identifier}`}
          onClick={(e) => {
            e.stopPropagation();
            clearAll(onChange);
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
      render={({ field: { onChange, onBlur, value = [] }, fieldState: { error } }) => {
        const arr = Array.isArray(value) ? value : [];
        const hasError = !!error;
        const isDisabled = disabled || loading;

        return (
          <div className="flex flex-col gap-2 w-full" data-test-id={identifier}>
            <div className="flex flex-col gap-1.5 w-full">
              {label && (
                <Label
                  className={clsx(
                    hasError && "text-destructive",
                    isDisabled && "opacity-50"
                  )}
                  data-test-id={`label-${identifier}`}
                >
                  {label}
                </Label>
              )}

              <div 
                className="relative flex items-center"
                onClick={openFilePicker}
              >
                <Input
                  readOnly
                  disabled={isDisabled}
                  value={arr.length ? `${arr.length} file(s) selected` : ""}
                  placeholder="Select files"
                  className={clsx(
                    "cursor-pointer pr-10",
                    hasError && "border-destructive focus-visible:ring-destructive",
                    !arr.length && "text-muted-foreground"
                  )}
                  aria-invalid={hasError}
                  data-test-id={`text-input-${identifier}`}
                />
                <div className="absolute right-1 flex items-center">
                  {renderEndAdornment(loading, arr, identifier, disabled, onChange)}
                </div>
              </div>

              {hasError && (
                <p
                  className="text-xs font-medium text-destructive mt-0.5"
                  data-test-id={`error-${identifier}`}
                >
                  {error.message}
                </p>
              )}
            </div>

            {arr.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {arr.map((item: any, index: number) => (
                  <div
                    key={`${item.url}-${index}`}
                    className="relative group w-12 h-12 rounded-xl overflow-hidden border border-border/60 bg-muted/20 shadow-sm animate-in fade-in zoom-in-95 duration-200 shrink-0"
                  >
                    <img
                      src={item.url}
                      alt={item.filename || "Uploaded photo"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {!isDisabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOne(item.url, arr, onChange);
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
                ))}
              </div>
            )}

            <input
              ref={inputRef}
              data-test-id={`input-${identifier}`}
              onChange={(e) => {
                handleFileChange(e, onChange, arr);
                onBlur();
              }}
              accept={accept}
              hidden
              type="file"
              multiple
            />
          </div>
        );
      }}
    />
  );
};

export default FileMultiPicker;
