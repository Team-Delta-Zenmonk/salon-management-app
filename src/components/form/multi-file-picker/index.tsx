import ClearIcon from "@mui/icons-material/Clear";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Box,
  Chip,
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
import { callSnack } from "../../snackbar";
import type { FileMultiPickerProps } from "./multi-file-picke.type";
import styles from "./multi-file-picker.module.scss";
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
        <CircularProgress
          data-test-id={`loading-${identifier}`}
          className={styles.adornmentLoading}
          size={20}
        />
      );
    }

    if (arr.length) {
      return (
        <IconButton
          className={styles.adornmentIconButton}
          data-test-id={`clear-btn-${identifier}`}
          onClick={(e) => {
            e.stopPropagation();
            clearAll(onChange);
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
      render={({ field: { onChange, value = [] }, fieldState: { error } }) => {
        const arr = Array.isArray(value) ? value : [];

        return (
          <Stack data-test-id={identifier} spacing={1}>
            <FormControl disabled={disabled || loading} variant="outlined" className={styles.formControl} size="small">
              <InputLabel
                sx={{ marginTop: arr.length ? 0 : "6.5px" }}
                shrink={arr.length > 0}
                error={Boolean(error)}
                data-test-id={`label-${identifier}`}
              >
                {label}
              </InputLabel>

              <OutlinedInput
                error={Boolean(error)}
                onClick={openFilePicker}
                label={label}
                value={arr.length ? `${arr.length} file(s) selected` : ""}
                className={styles.inputField}
                data-test-id={`text-input-${identifier}`}
                inputProps={{
                  className: styles.input,
                }}
                slotProps={{
                  root: {
                    className: arr.length ? "" : styles.inputRoot,
                  },
                }}
                readOnly
                endAdornment={renderEndAdornment(loading, arr, identifier, disabled, onChange)}
              />

              {error && (
                <FormHelperText data-test-id={`error-${identifier}`} error>
                  {error.message}
                </FormHelperText>
              )}
            </FormControl>

            {arr.length > 0 && (
              <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                {arr.map((item: any, index: number) => (
                  <Chip
                    key={`${item.url}-${index}`}
                    label={item.filename}
                    size="small"
                    onDelete={() => removeOne(item.url, arr, onChange)}
                  />
                ))}
              </Box>
            )}

            <input
              ref={inputRef}
              data-test-id={`input-${identifier}`}
              onChange={(e) => handleFileChange(e, onChange, arr)}
              accept={accept}
              hidden
              type="file"
              multiple
            />
          </Stack>
        );
      }}
    />
  );
};

export default FileMultiPicker;
