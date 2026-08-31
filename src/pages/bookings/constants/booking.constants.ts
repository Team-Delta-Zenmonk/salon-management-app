import { BOOKING_STATUS, type BookingStatus } from "../../../common/enums/booking-status.enum";

export const ALL_STAFF_VALUE = "all";
export const ALL_SERVICES_VALUE = "all";

export const DEFAULT_SLOT_DURATION = "00:30:00";
export const DEFAULT_SLOT_MIN_TIME = "08:00:00";
export const DEFAULT_SLOT_MAX_TIME = "22:00:00";

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BOOKING_STATUS.CONFIRMED]: "#059669",  // Professional emerald green
  [BOOKING_STATUS.CANCELLED]: "#dc2626",  // Softer, less saturated red
  [BOOKING_STATUS.PENDING]: "#d97706",    // Amber
  [BOOKING_STATUS.COMPLETED]: "#2563eb",  // Modern blue
  [BOOKING_STATUS.EXPIRED]: "#9ca3af",    // Neutral grey
};
