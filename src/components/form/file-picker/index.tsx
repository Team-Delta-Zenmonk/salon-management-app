import ClearIcon from "@mui/icons-material/Clear";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  OutlinedInput,
  Stack,
} from "@mui/material";
import { useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import type { FilePickerProps } from "./file-picker.type";
import styles from "./file-picker.module.scss";
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
        <CircularProgress
          data-test-id={`loading-${identifier}`}
          className={styles.adornmentLoading}
          size={20}
        />
      );
    }

    if (value) {
      return (
        <IconButton
          className={styles.adornmentIconButton}
          data-test-id={`clear-btn-${identifier}`}
          onClick={(e) => {
            e.stopPropagation();
            clearFile(onChange);
          }}
          disabled={disabled}
        >
          <ClearIcon data-test-id={`clear-btn-icon-${identifier}`} />
        </IconButton>
      );
    }

    return (
      <IconButton
        disabled={disabled}
        data-test-id={`upload-btn-${identifier}`}
        className={styles.adornmentIconButton}
      >
        <UploadFileIcon data-test-id={`upload-btn-icon-${identifier}`} className="text-secondary-500" />
      </IconButton>
    );
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Stack data-test-id={identifier}>
          <FormControl disabled={disabled || loading} variant="outlined" className={styles.formControl} size="small">
            <InputLabel
              sx={{ marginTop: value ? 0 : "6.5px" }}
              shrink={Boolean(value)}
              error={Boolean(error)}
              data-test-id={`label-${identifier}`}
            >
              {label}
            </InputLabel>

            <OutlinedInput
              error={Boolean(error)}
              onClick={(e: MouseEvent<HTMLDivElement>) => openFilePicker(e, Boolean(value))}
              label={label}
              value={value?.filename ?? ""}
              className={styles.inputField}
              data-test-id={`text-input-${identifier}`}
              inputProps={{
                className: styles.input,
              }}
              slotProps={{
                root: {
                  className: value ? "" : styles.inputRoot,
                },
              }}
              readOnly
              endAdornment={renderEndAdornment(loading, value, identifier, disabled, onChange)}
            />
            {error && (
              <FormHelperText data-test-id={`error-${identifier}`} error={Boolean(error)}>
                {error.message}
              </FormHelperText>
            )}
          </FormControl>

          <input
            ref={inputRef}
            data-test-id={`input-${identifier}`}
            onChange={(e) => handleFileChange(e, onChange)}
            accept={accept}
            hidden
            type="file"
          />
        </Stack>
      )}
    />
  );
};

export default FilePicker;
