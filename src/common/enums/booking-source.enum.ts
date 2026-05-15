export const BOOKING_SOURCE = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;

export type BookingSource = (typeof BOOKING_SOURCE)[keyof typeof BOOKING_SOURCE];
