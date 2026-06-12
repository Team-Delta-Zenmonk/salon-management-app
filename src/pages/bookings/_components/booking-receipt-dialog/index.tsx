import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import dayjs from "dayjs";
import type { Booking } from "../../types/booking.type";
import { BOOKING_STATUS } from "../../../../common/enums/booking-status.enum";

interface BookingReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function BookingReceiptDialog({ open, onClose, booking }: Readonly<BookingReceiptDialogProps>) {
  if (!booking) return null;

  const getPaymentDetails = () => {
    const total = booking.total_price || booking.booking_services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0;
    const policy = booking.payment_policy;
    const onlinePaid = booking.amount_paid_online || 0;

    let paid = 0;
    let label = "UNKNOWN";
    let strategy = "Unknown";
    let themeKey: "success" | "warning" | "experimental" | "secondary" = "secondary";

    if (policy === "full_upfront" || (onlinePaid > 0 && onlinePaid >= total)) {
      paid = total;
      label = "PAID UPFRONT";
      strategy = "Paid Upfront";
      themeKey = "success";
    } else if (policy === "partial_deposit" || (onlinePaid > 0 && onlinePaid < total)) {
      paid = onlinePaid || booking.deposit_amount || 0;
      const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
      label = `${percent}% DEPOSITED`;
      strategy = "Partial Deposit";
      themeKey = "warning";
    } else if (policy === "pay_at_venue" || (!policy && onlinePaid === 0)) {
      paid = 0;
      label = "PAY AT VENUE";
      strategy = "Pay at Venue";
      themeKey = "experimental";
    }

    const remaining = Math.max(0, total - paid);
    const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;

    const themeStyles = {
      success: { bg: "bg-[var(--success-50)]", text: "text-[var(--success-800)]", border: "border-[var(--success-200)]", dot: "bg-[var(--success-500)]", progress: "bg-[var(--success-600)]" },
      warning: { bg: "bg-[var(--warning-50)]", text: "text-[var(--warning-800)]", border: "border-[var(--warning-300)]", dot: "bg-[var(--warning-500)]", progress: "bg-[var(--warning-500)]" },
      experimental: { bg: "bg-[var(--experimental-50)]", text: "text-[var(--experimental-800)]", border: "border-[var(--experimental-200)]", dot: "bg-[var(--experimental-500)]", progress: "bg-[var(--experimental-800)]" },
      secondary: { bg: "bg-[var(--secondary-50)]", text: "text-[var(--secondary-800)]", border: "border-[var(--secondary-200)]", dot: "bg-[var(--secondary-500)]", progress: "bg-[var(--secondary-400)]" }
    };

    const styles = themeStyles[themeKey];

    return { total, paid, remaining, label, percentage, strategy, styles };
  };

  const getStatusDetails = (status: string) => {
    let themeKey: "success" | "info" | "error" | "secondary" = "secondary";
    if (status === BOOKING_STATUS.CONFIRMED) themeKey = "success";
    else if (status === BOOKING_STATUS.COMPLETED) themeKey = "info";
    else if (status === BOOKING_STATUS.CANCELLED) themeKey = "error";

    const themeStyles = {
      success: { text: "text-[var(--success-800)]", dot: "bg-[var(--success-500)]" },
      info: { text: "text-[var(--info-800)]", dot: "bg-[var(--info-500)]" },
      error: { text: "text-[var(--error-800)]", dot: "bg-[var(--error-500)]" },
      secondary: { text: "text-[var(--secondary-800)]", dot: "bg-[var(--secondary-500)]" }
    };

    return {
      label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      ...themeStyles[themeKey]
    };
  };

  const { total, paid, remaining, label, percentage, strategy, styles } = getPaymentDetails();
  const statusDetails = getStatusDetails(booking.status);

  const formattedDate = dayjs(booking.start_time).format("MMMM D, YYYY");
  const formattedTime = dayjs(booking.start_time).format("h:mm A");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 16 } }}>
      <DialogTitle className="flex justify-between items-start pb-0 pt-6 px-6">
        <Box className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${styles.bg} ${styles.border} ${styles.text}`}>
          <Box className={`w-2 h-2 rounded-full ${styles.dot}`}></Box>
          <Typography variant="caption" fontWeight="bold">
            {label}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} className="text-[var(--text-muted)]">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="px-6 pb-2 pt-4">
        <Box className="mb-6">
          <Typography variant="h5" fontWeight="bold" className="text-[var(--text-primary)] mb-1">
            {booking.customer_name}
          </Typography>
          <Typography variant="body2" className="text-[var(--text-muted)]">
            {booking.service_name}
          </Typography>
        </Box>

        <Box className="grid grid-cols-2 gap-4 mb-6">
          <Box>
            <Typography variant="caption" fontWeight="bold" className="text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              APPOINTMENT TIME
            </Typography>
            <Box className="flex items-center gap-2 text-[var(--text-primary)]">
              <AccessTimeIcon fontSize="small" className="text-[var(--text-muted)]" />
              <Typography variant="body2" fontWeight="medium">
                {formattedDate} • {formattedTime}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" fontWeight="bold" className="text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              ASSIGNED STAFF
            </Typography>
            <Box className="flex items-center gap-2 text-[var(--text-primary)]">
              <PersonOutlineIcon fontSize="small" className="text-[var(--text-muted)]" />
              <Typography variant="body2" fontWeight="medium">
                {booking.staff_name}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="bg-[var(--surface-muted)] rounded-xl p-5 mb-6">
          <Typography variant="body2" fontWeight="bold" className="text-[var(--text-muted)] mb-3">
            Payment Progress
          </Typography>
          <Box className="w-full bg-[var(--secondary-200)] rounded-full h-2.5 mb-3 overflow-hidden">
            <Box
              className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
              style={{ width: `${percentage}%` }}
            ></Box>
          </Box>
          <Box className="flex justify-between items-center text-sm">
            <Typography variant="body2" className="text-[var(--text-muted)]">
              Paid: <span className="font-bold text-[var(--text-primary)]">₹{paid.toFixed(2)}</span>
            </Typography>
            <Typography variant="body2" className="text-[var(--text-muted)]">
              Remaining: <span className="font-bold text-[var(--text-primary)]">₹{remaining.toFixed(2)}</span>
            </Typography>
          </Box>
        </Box>

        <Box className="flex justify-between items-center py-4 border-b border-[var(--border-subtle)]">
          <Typography variant="body2" className="text-[var(--text-muted)]">
            Service Cost
          </Typography>
          <Typography variant="body1" fontWeight="bold" className="text-[var(--text-primary)]">
            ₹{total.toFixed(2)}
          </Typography>
        </Box>

        <Box className="flex justify-between items-center py-4 border-b border-[var(--border-subtle)]">
          <Typography variant="body2" className="text-[var(--text-muted)]">
            Payment Strategy
          </Typography>
          <Box className={`px-2.5 py-1 rounded-md text-xs font-bold border ${styles.bg} ${styles.border} ${styles.text}`}>
            {strategy === "Partial Deposit" ? `${percentage}% Deposited` : strategy}
          </Box>
        </Box>

        <Box className="flex justify-between items-center py-4">
          <Typography variant="body2" className="text-[var(--text-muted)]">
            Transaction Status
          </Typography>
          <Box className="flex items-center gap-1.5">
            <Box className={`w-2 h-2 rounded-full ${statusDetails.dot}`}></Box>
            <Typography variant="body2" fontWeight="bold" className={statusDetails.text}>
              {statusDetails.label}
            </Typography>
          </Box>
        </Box>

      </DialogContent>
      <DialogActions className="p-4 bg-[var(--surface-muted)] flex justify-end gap-3 rounded-b-2xl border-t border-[var(--border-subtle)]">
        {remaining > 0 && booking.status !== BOOKING_STATUS.CANCELLED ? (
          <>
            <Button onClick={onClose} variant="outlined" className="text-[var(--text-muted)] border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] shadow-none font-semibold px-6 py-2 rounded-xl capitalize">
              Dismiss
            </Button>
            <Button variant="contained" className="bg-[var(--info-600)] text-white shadow-none font-semibold px-6 py-2 rounded-xl capitalize flex items-center gap-2">
              Collect Remaining ₹{remaining.toFixed(0)}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="contained" className="bg-[var(--secondary-200)] text-[var(--text-primary)] hover:bg-[var(--secondary-300)] shadow-none font-semibold px-6 py-2 rounded-lg capitalize">
            Close Receipt
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
