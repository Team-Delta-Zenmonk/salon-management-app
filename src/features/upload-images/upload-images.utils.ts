export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return Number.isInteger(mb) ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: readonly string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(
  file: File,
  options?: FileValidationOptions
): FileValidationResult {
  const maxBytes = options?.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File Too Large. Maximum file size allowed is ${formatFileSize(maxBytes)}.`,
    };
  }

  if (options?.allowedTypes && options.allowedTypes.length > 0) {
    const isAllowed = options.allowedTypes.some((t) => {
      if (t.endsWith("/*")) {
        const prefix = t.slice(0, -1);
        return file.type.startsWith(prefix);
      }
      return file.type === t;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: "Invalid file type. Only images are allowed.",
      };
    }
  }

  return { valid: true };
}

export function validateUploadFiles(
  files: File[] | FileList,
  options?: FileValidationOptions
): FileValidationResult {
  const fileArray = Array.from(files);
  for (const file of fileArray) {
    const result = validateUploadFile(file, options);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

export function extractUploadErrorMessage(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        error?: string | { message?: string };
        message?: string;
      };
    };
    message?: string;
  };

  const errorObj = err?.response?.data?.error;
  if (typeof errorObj === "object" && errorObj?.message) {
    return errorObj.message;
  }

  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (typeof errorObj === "string") {
    return errorObj;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Failed to upload file. Please try again.";
}

