import type { Booking } from "../types/booking.type";

export function isBookingFullyPaid(booking: Booking | null | undefined): boolean {
  if (!booking) return false;

  const invoice = booking.invoice as { payment_status?: string; status?: string } | undefined;
  const paymentStatus = (
    booking.payment_status ||
    invoice?.payment_status ||
    invoice?.status
  )?.toLowerCase();

  if (paymentStatus === "paid") {
    return true;
  }

  if (booking.is_paid === true) {
    return true;
  }

  const total =
    Number(booking.total_price) ||
    booking.booking_services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) ||
    0;

  if (total <= 0) return false;

  const onlinePaid = Number(booking.amount_paid_online) || 0;
  if (onlinePaid >= total) {
    return true;
  }

  const policy = booking.payment_preference || booking.payment_policy;
  if (policy === "full_upfront") {
    return true;
  }

  let paid = 0;
  if (policy === "partial_deposit") {
    paid = onlinePaid || Number(booking.deposit_amount) || 0;
  } else if (policy === "pay_at_venue") {
    paid = Number(booking.deposit_amount) || 0;
  }

  const remaining = Math.max(0, total - paid);
  return remaining === 0;
}

