import { BOOKING_STATUS, type BookingStatus } from "../../../common/enums/booking-status.enum";

export const ALL_STAFF_VALUE = "all";
export const ALL_SERVICES_VALUE = "all";

export const DEFAULT_SLOT_DURATION = "00:30:00";
export const DEFAULT_SLOT_MIN_TIME = "08:00:00";
export const DEFAULT_SLOT_MAX_TIME = "22:00:00";

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BOOKING_STATUS.CONFIRMED]: "#059669",
  [BOOKING_STATUS.CANCELLED]: "#dc2626",
  [BOOKING_STATUS.PENDING]: "#d97706",
  [BOOKING_STATUS.COMPLETED]: "#2563eb",
  [BOOKING_STATUS.EXPIRED]: "#9ca3af",
};
