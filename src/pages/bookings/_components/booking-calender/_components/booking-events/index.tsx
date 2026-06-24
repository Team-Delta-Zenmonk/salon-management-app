import { Box } from "@mui/material";
import type { Booking } from "../../../../types/booking.type";
import styles from "./booking-events.module.scss";

interface BookingEventProps {
  booking: Booking;
  color: string;
  isCancelled: boolean;
}

export default function BookingEvent({ booking, color, isCancelled }: Readonly<BookingEventProps>) {
  let paymentLabel = "";
  let paymentBg = "";
  let paymentText = "";

  if (booking.payment_policy === "full_upfront" || (booking.amount_paid_online && booking.amount_paid_online >= (booking.total_price || 0))) {
    paymentLabel = "Paid Upfront";
    paymentBg = "var(--success-50)";
    paymentText = "var(--success-800)";
  } else if (booking.payment_policy === "partial_deposit" || (booking.amount_paid_online && booking.amount_paid_online < (booking.total_price || 0))) {
    paymentLabel = "Partial Deposit";
    paymentBg = "var(--primary-50)";
    paymentText = "var(--primary-800)";
  } else if (booking.payment_policy === "pay_at_venue" || (!booking.payment_policy && !booking.amount_paid_online)) {
    paymentLabel = "Pay at Venue";
    paymentBg = "var(--experimental-50)";
    paymentText = "var(--experimental-800)";
  }

  return (
    <Box
      className={`${styles.bookingEvent} ${styles[booking.status] || ""}`}
      sx={{ borderLeft: `4px solid ${color}` }}
    >
      <Box className={styles.customerName}>{booking.customer_name}</Box>
      <Box className={styles.serviceName}>{booking.service_name}</Box>

      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
        <Box className={styles.statusBadge} sx={{ backgroundColor: `${color}20` }}>
          <Box className={styles.statusText} sx={{ color: color }}>
            {booking.status}
          </Box>
        </Box>
        {paymentLabel && (
          <Box className={styles.statusBadge} sx={{ backgroundColor: paymentBg, border: `1px solid ${paymentBg.replace("50", "200")}` }}>
            <Box className={styles.statusText} sx={{ color: paymentText, fontWeight: "bold" }}>
              {paymentLabel}
            </Box>
          </Box>
        )}
      </Box>

      <Box className={styles.staffInfo}>
        <span>👤</span>
        <Box component="span" className={styles.staffName}>
          {booking.staff_name}
        </Box>
      </Box>
    </Box>
  );
}
