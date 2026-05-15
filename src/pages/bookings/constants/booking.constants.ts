import { BOOKING_STATUS, type BookingStatus } from "../../../common/enums/booking-status.enum";

export const ALL_STAFF_VALUE = "all";
export const ALL_SERVICES_VALUE = "all";

export const DEFAULT_SLOT_DURATION = "00:30:00";
export const DEFAULT_SLOT_MIN_TIME = "08:00:00";
export const DEFAULT_SLOT_MAX_TIME = "22:00:00";

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BOOKING_STATUS.CONFIRMED]: "var(--success)",
  [BOOKING_STATUS.CANCELLED]: "var(--error)",
  [BOOKING_STATUS.PENDING]: "var(--warning)",
  [BOOKING_STATUS.COMPLETED]: "var(--info)",
  [BOOKING_STATUS.EXPIRED]: "var(--secondary-500)",
};
