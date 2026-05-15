export const BOOKING_FILTER = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
} as const;

export type BookingFilter = (typeof BOOKING_FILTER)[keyof typeof BOOKING_FILTER];
