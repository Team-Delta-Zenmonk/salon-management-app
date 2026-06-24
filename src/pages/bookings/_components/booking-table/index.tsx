import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Booking } from "../../types/booking.type";
import { BOOKING_STATUS } from "../../../../common/enums/booking-status.enum";
import dayjs from "dayjs";
import { DataTable, type DataTableColumn } from "../../../../components/data-table";

interface BookingTableProps {
  bookings: Booking[];
  onViewReceipt: (booking: Booking) => void;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  loading?: boolean;
}

const getPaymentDetails = (booking: Booking) => {
  const total = booking.total_price || booking.booking_services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0;
  const policy = booking.payment_policy;
  const onlinePaid = booking.amount_paid_online || 0;
  let paid = 0;
  let label = "Unknown";
  let themeKey: "success" | "warning" | "experimental" | "error" | "secondary" | "primary" = "secondary";

  if (policy === "full_upfront" || (onlinePaid > 0 && onlinePaid >= total)) {
    paid = total;
    label = "Paid Upfront";
    themeKey = "success";
  } else if (policy === "partial_deposit" || (onlinePaid > 0 && onlinePaid < total)) {
    paid = onlinePaid || booking.deposit_amount || 0;
    label = "Partial Deposit";
    themeKey = "primary";
  } else if (policy === "pay_at_venue" || (!policy && onlinePaid === 0)) {
    paid = booking.deposit_amount || 0;
    label = "Pay at Venue";
    themeKey = "experimental";
  }

  const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;

  let progressThemeKey: "success" | "warning" | "error" | "secondary" = "secondary";
  if (percentage === 100) progressThemeKey = "success";
  else if (percentage > 0) progressThemeKey = "warning";
  else progressThemeKey = "error";

  const themeStyles = {
    success: { bg: "bg-[var(--success-50)]", text: "text-[var(--success-800)]", border: "border-[var(--success-200)]", dot: "bg-[var(--success-500)]", progress: "bg-[var(--success-600)]" },
    warning: { bg: "bg-[var(--warning-50)]", text: "text-[var(--warning-800)]", border: "border-[var(--warning-300)]", dot: "bg-[var(--warning-500)]", progress: "bg-[var(--warning-500)]" },
    experimental: { bg: "bg-[var(--experimental-50)]", text: "text-[var(--experimental-800)]", border: "border-[var(--experimental-200)]", dot: "bg-[var(--experimental-500)]", progress: "bg-[var(--experimental-800)]" },
    error: { bg: "bg-[var(--error-50)]", text: "text-[var(--error-800)]", border: "border-[var(--error-200)]", dot: "bg-[var(--error-500)]", progress: "bg-[var(--error-600)]" },
    primary: { bg: "bg-[var(--primary-50)]", text: "text-[var(--primary-800)]", border: "border-[var(--primary-200)]", dot: "bg-[var(--primary-500)]", progress: "bg-[var(--primary-600)]" },
    secondary: { bg: "bg-[var(--secondary-50)]", text: "text-[var(--secondary-800)]", border: "border-[var(--secondary-200)]", dot: "bg-[var(--secondary-500)]", progress: "bg-[var(--secondary-400)]" }
  };

  const styles = themeStyles[themeKey];
  const progressStyles = themeStyles[progressThemeKey];

  return { total, paid, label, percentage, styles, progressStyles };
};

const getStatusColor = (status: string) => {
  let themeKey: "success" | "info" | "error" | "secondary" = "secondary";
  if (status === BOOKING_STATUS.CONFIRMED) themeKey = "success";
  else if (status === BOOKING_STATUS.COMPLETED) themeKey = "info";
  else if (status === BOOKING_STATUS.CANCELLED) themeKey = "error";

  const themeStyles = {
    success: { bg: "bg-[var(--success-50)]", text: "text-[var(--success-800)]", dot: "bg-[var(--success-500)]" },
    info: { bg: "bg-[var(--info-50)]", text: "text-[var(--info-800)]", dot: "bg-[var(--info-500)]" },
    error: { bg: "bg-[var(--error-50)]", text: "text-[var(--error-800)]", dot: "bg-[var(--error-500)]" },
    secondary: { bg: "bg-[var(--secondary-50)]", text: "text-[var(--secondary-800)]", dot: "bg-[var(--secondary-500)]" }
  };

  return themeStyles[themeKey];
};

export default function BookingTable({
  bookings,
  onViewReceipt,
  total = 0,
  page = 1,
  limit = 12,
  onPageChange,
  loading = false
}: Readonly<BookingTableProps>) {

  const columns: DataTableColumn<Booking>[] = [
    {
      key: "client",
      label: "CLIENT",
      render: (booking) => (
        <Typography variant="body2" fontWeight="600" className="text-[var(--text-primary)]">
          {booking.customer_name}
        </Typography>
      ),
    },
    {
      key: "service",
      label: "SERVICE",
      render: (booking) => (
        <Typography variant="body2" className="text-[var(--text-muted)]">
          {booking.service_name}
        </Typography>
      ),
    },
    {
      key: "staff",
      label: "STAFF ASSIGNED",
      render: (booking) => (
        <Typography variant="body2" className="text-[var(--text-primary)]">
          {booking.staff_name}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (booking) => {
        const statusColors = getStatusColor(booking.status);
        return (
          <Box className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusColors.bg}`}>
            <Box className={`w-2 h-2 rounded-full ${statusColors.dot}`}></Box>
            <Typography variant="caption" fontWeight="bold" className={statusColors.text + " capitalize"}>
              {booking.status.toLowerCase()}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "payment_type",
      label: "PAYMENT MODE",
      render: (booking) => {
        const { label, styles } = getPaymentDetails(booking);
        return (
          <Box className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${styles.bg} ${styles.border} ${styles.text}`}>
            <Box className={`w-2 h-2 rounded-full ${styles.dot}`}></Box>
            <Typography variant="caption" fontWeight="bold">
              {label}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "amount",
      label: "AMOUNT DETAILS",
      width: 250,
      render: (booking) => {
        const { total, paid, percentage, styles, progressStyles } = getPaymentDetails(booking);
        return (
          <Box className="flex flex-col gap-1.5 w-full max-w-[180px]">
            <Box className="flex justify-between items-center w-full">
              <Typography variant="caption" fontWeight="600" className="text-[var(--text-primary)]">
                ₹{paid.toFixed(2)} / ₹{total.toFixed(2)}
              </Typography>
              <Typography variant="caption" fontWeight="bold" className={`text-xs ${progressStyles.text}`}>
                {percentage}%
              </Typography>
            </Box>
            <Box className="w-full bg-[var(--surface-muted)] rounded-full h-2 overflow-hidden">
              <Box
                className={`h-full rounded-full transition-all duration-500 ${progressStyles.progress}`}
                style={{ width: `${percentage}%` }}
              ></Box>
            </Box>
          </Box>
        );
      },
    },
    {
      key: "appointment_date",
      label: "APPOINTMENT DATE",
      render: (booking) => (
        <>
          <Typography variant="body2" fontWeight="600" className="text-[var(--text-primary)]">
            {dayjs(booking.start_time).format("MMM D, YYYY")}
          </Typography>
          <Typography variant="caption" className="text-[var(--text-muted)] mt-0.5 block">
            {dayjs(booking.start_time).format("h:mm A")}
          </Typography>
        </>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      width: "100px",
      render: (booking) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onViewReceipt(booking);
          }}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <DataTable<Booking>
      title="Booking List"
      badge={total > 0 ? `${total} total bookings` : `${bookings.length} bookings showing`}
      columns={columns}
      data={bookings}
      getRowKey={(row) => row.uuid}
      loading={loading}
      emptyMessage="No bookings found."
      total={total}
      page={page}
      limit={limit}
      onPageChange={onPageChange}
    />
  );
}
