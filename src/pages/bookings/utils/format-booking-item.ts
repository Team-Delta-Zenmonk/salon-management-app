import type { Booking, BookingStatus, RawBooking } from "../types/booking.type";
import { BOOKING_SOURCE } from "../../../common/enums/booking-source.enum";
import { BOOKING_STATUS } from "../../../common/enums/booking-status.enum";

export const formatBookingItem = (booking: RawBooking): Booking => {
  const bookingServices = booking.booking_services ?? [];
  const isCustomerBooking = booking.created_by === BOOKING_SOURCE.CUSTOMER;

  const customerName = isCustomerBooking
    ? booking.customer?.name || "Registered Customer"
    : booking.admin_booking?.name || "Walk-in Customer";

  const customerEmail = isCustomerBooking ? booking.customer?.email || "" : "";
  const customerPhone = isCustomerBooking
    ? booking.customer?.phone || ""
    : booking.admin_booking?.phone || "";

  const serviceNames = bookingServices
    .map((bs) => bs.service?.name)
    .filter((name): name is string => Boolean(name));

  const staffNames = [
    ...new Set(
      bookingServices
        .map((bs) => `${bs.staff?.first_name || ""} ${bs.staff?.last_name || ""}`.trim())
        .filter(Boolean)
    ),
  ];

  return {
    ...booking,
    status: (booking.status as BookingStatus) || BOOKING_STATUS.PENDING,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    service_name: serviceNames.length > 0 ? serviceNames.join(", ") : "Unknown Service",
    staff_name: staffNames.length > 0 ? staffNames.join(", ") : "Unknown",
    start_time: booking.booking_start_time?.endsWith("Z")
      ? booking.booking_start_time.slice(0, -1)
      : booking.booking_start_time || "",
    end_time: booking.booking_end_time?.endsWith("Z")
      ? booking.booking_end_time.slice(0, -1)
      : booking.booking_end_time || "",
    created_by: booking.created_by || "",
  };
};

