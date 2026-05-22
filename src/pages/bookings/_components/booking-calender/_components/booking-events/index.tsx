import { Box } from "@mui/material";
import type { Booking } from "../../../../types/booking.type";
import styles from "./booking-events.module.scss";

interface BookingEventProps {
  booking: Booking;
  color: string;
  isCancelled: boolean;
}

export default function BookingEvent({ booking, color, isCancelled }: Readonly<BookingEventProps>) {
  return (
    <Box
      className={`${styles.bookingEvent} ${isCancelled ? styles.cancelled : styles.confirmed}`}
      sx={{ borderLeft: `4px solid ${color}` }}
    >
      <Box className={styles.customerName}>{booking.customer_name}</Box>
      <Box className={styles.serviceName}>{booking.service_name}</Box>

      <Box className={styles.statusBadge} sx={{ backgroundColor: `${color}20` }}>
        <Box className={styles.statusText} sx={{ color: color }}>
          {booking.status}
        </Box>
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
