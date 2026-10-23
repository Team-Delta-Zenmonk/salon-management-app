import axios from "axios";

const FALLBACK_ERROR_MESSAGE = "An unexpected error occurred. Please try again.";

export function isHtmlPayload(data: unknown): boolean {
  if (typeof data !== "string") return false;
  const trimmed = data.trim();
  return (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    (trimmed.startsWith("<") && trimmed.endsWith(">"))
  );
}

function extractFromObject(data: Record<string, unknown>): string | null {
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim().slice(0, 300);
  }
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim().slice(0, 300);
  }
  if (typeof data.data === "string" && data.data.trim()) {
    return data.data.trim().slice(0, 300);
  }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string" && first.trim()) return first.trim().slice(0, 300);
    if (
      first &&
      typeof first === "object" &&
      "message" in first &&
      typeof first.message === "string" &&
      first.message.trim()
    ) {
      return first.message.trim().slice(0, 300);
    }
  }
  return null;
}

export function extractErrorMessage(error: unknown, fallback = FALLBACK_ERROR_MESSAGE): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  if (axios.isCancel(error)) {
    return "";
  }

  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.message.toLowerCase().includes("timeout")) {
      return "Request timed out. Please check your connection and try again.";
    }
    if (
      error.code === "ERR_NETWORK" ||
      (!error.response && typeof window !== "undefined" && !window.navigator.onLine)
    ) {
      return "No internet connection. Please verify your network.";
    }

    const responseData = error.response?.data;

    if (isHtmlPayload(responseData)) {
      const status = error.response?.status;
      if (status === 502 || status === 503 || status === 504) {
        return "Server is temporarily unavailable. Please try again shortly.";
      }
      return "Server error occurred. Please try again.";
    }

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData.trim().slice(0, 300);
    }

    if (responseData && typeof responseData === "object") {
      const parsed = extractFromObject(responseData as Record<string, unknown>);
      if (parsed) return parsed;
    }

    if (error.response?.status) {
      const status = error.response.status;
      if (status === 401) return "Session expired. Please log in again.";
      if (status === 403) return "You do not have permission to perform this action.";
      if (status === 404) return "The requested resource was not found.";
      if (status === 429) return "Too many requests. Please slow down and try again later.";
      if (status >= 500) return "Internal server error. Please try again later.";
    }

    if (error.message && !error.message.toLowerCase().includes("status code")) {
      return error.message.slice(0, 300);
    }
  }

  if (error instanceof Error && error.message) {
    return error.message.slice(0, 300);
  }

  if (typeof error === "object" && error !== null) {
    const parsed = extractFromObject(error as Record<string, unknown>);
    if (parsed) return parsed;
  }

  return fallback;
}
