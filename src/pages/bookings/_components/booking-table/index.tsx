import { Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, CircularProgress } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Booking } from "../../types/booking.type";
import { BOOKING_STATUS } from "../../../../common/enums/booking-status.enum";
import dayjs from "dayjs";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";

interface BookingTableProps {
  bookings: Booking[];
  onViewReceipt: (booking: Booking) => void;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  loading?: boolean;
}

export default function BookingTable({ 
  bookings, 
  onViewReceipt,
  total = 0,
  page = 1,
  limit = 12,
  onPageChange,
  loading = false
}: Readonly<BookingTableProps>) {
  const getPaymentDetails = (booking: Booking) => {
    const total = booking.total_price || booking.booking_services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0;
    const policy = booking.payment_policy;
    const onlinePaid = booking.amount_paid_online || 0;
    let paid = 0;
    let label = "Unknown";
    let themeKey: "success" | "warning" | "experimental" | "secondary" = "secondary";

    if (policy === "full_upfront" || (onlinePaid > 0 && onlinePaid >= total)) {
      paid = total;
      label = "Paid Upfront";
      themeKey = "success";
    } else if (policy === "partial_deposit" || (onlinePaid > 0 && onlinePaid < total)) {
      paid = onlinePaid || booking.deposit_amount || 0;
      const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
      label = `${percent}% Deposited`;
      themeKey = "warning";
    } else if (policy === "pay_at_venue" || (!policy && onlinePaid === 0)) {
      paid = 0;
      label = "Pay at Venue";
      themeKey = "experimental";
    }

    const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;

    const themeStyles = {
      success: { bg: "bg-[var(--success-50)]", text: "text-[var(--success-800)]", border: "border-[var(--success-200)]", dot: "bg-[var(--success-500)]", progress: "bg-[var(--success-600)]" },
      warning: { bg: "bg-[var(--warning-50)]", text: "text-[var(--warning-800)]", border: "border-[var(--warning-300)]", dot: "bg-[var(--warning-500)]", progress: "bg-[var(--warning-500)]" },
      experimental: { bg: "bg-[var(--experimental-50)]", text: "text-[var(--experimental-800)]", border: "border-[var(--experimental-200)]", dot: "bg-[var(--experimental-500)]", progress: "bg-[var(--experimental-800)]" },
      secondary: { bg: "bg-[var(--secondary-50)]", text: "text-[var(--secondary-800)]", border: "border-[var(--secondary-200)]", dot: "bg-[var(--secondary-500)]", progress: "bg-[var(--secondary-400)]" }
    };

    const styles = themeStyles[themeKey];

    return { total, paid, label, percentage, styles };
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

  if (loading && bookings.length === 0) {
    return (
      <Box className="w-full bg-white rounded-lg border border-gray-200 flex items-center justify-center py-10">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="w-full bg-white rounded-lg border border-gray-200">
      <Box className="flex justify-between items-center p-6 border-b border-gray-200">
        <Typography variant="h6" fontWeight="bold" className="text-[var(--secondary-900)]">
          Detailed Payments Audit List
        </Typography>
        <Box className="px-3 py-1 rounded-full bg-[#F4EFFC] text-[#513D87] text-xs font-semibold">
          {total > 0 ? `${total} total bookings` : `${bookings.length} bookings showing`}
        </Box>
      </Box>

      <TableContainer className="max-h-[calc(100vh-450px)] overflow-auto custom-scrollbar">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className="bg-white text-xs font-bold text-gray-400 border-b border-gray-100 tracking-wider">CLIENT & SERVICE</TableCell>
              <TableCell className="bg-white text-xs font-bold text-gray-400 border-b border-gray-100 tracking-wider">STAFF ASSIGNED</TableCell>
              <TableCell className="bg-white text-xs font-bold text-gray-400 border-b border-gray-100 tracking-wider">STATUS</TableCell>
              <TableCell className="bg-white text-xs font-bold text-gray-400 border-b border-gray-100 tracking-wider">PAYMENT TYPE</TableCell>
              <TableCell className="bg-white text-xs font-bold text-gray-400 border-b border-gray-100 tracking-wider">AMOUNT DETAILS</TableCell>
              <TableCell className="bg-white text-xs font-bold text-gray-400 border-b border-gray-100 tracking-wider text-right pr-8">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500 border-b-0">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => {
                const { total, paid, label, percentage, styles } = getPaymentDetails(booking);
                const statusColors = getStatusColor(booking.status);

                return (
                  <TableRow key={booking.uuid} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="border-b border-gray-100 py-4">
                      <Typography variant="body2" fontWeight="bold" className="text-gray-900">
                        {booking.customer_name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {booking.service_name}
                      </Typography>
                      <Typography variant="body2">
                        ({dayjs(booking.start_time).format("MMMM D, YYYY")} • {dayjs(booking.start_time).format("h:mm A")})
                      </Typography>
                    </TableCell>
                    <TableCell className="border-b border-gray-100 py-4">
                      <Typography variant="body2" className="text-gray-700">
                        {booking.staff_name}
                      </Typography>
                    </TableCell>
                    <TableCell className="border-b border-gray-100 py-4">
                      <Box className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusColors.bg}`}>
                        <Box className={`w-2 h-2 rounded-full ${statusColors.dot}`}></Box>
                        <Typography variant="caption" fontWeight="bold" className={statusColors.text + " capitalize"}>
                          {booking.status.toLowerCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell className="border-b border-gray-100 py-4">
                      <Box className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${styles.bg} ${styles.border} ${styles.text}`}>
                        <Box className={`w-2 h-2 rounded-full ${styles.dot}`}></Box>
                        <Typography variant="caption" fontWeight="bold">
                          {label}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell className="border-b border-gray-100 py-4 w-[250px]">
                      <Box className="flex flex-col gap-1 w-full max-w-[180px]">
                        <Box className="flex justify-between items-center w-full">
                          <Typography variant="caption" fontWeight="bold" className="text-gray-800">
                            ₹{paid.toFixed(2)} / ₹{total.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold" className={`text-xs ${styles.text}`}>
                            {percentage}%
                          </Typography>
                        </Box>
                        <Box className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <Box
                            className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
                            style={{ width: `${percentage}%` }}
                          ></Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell className="border-b border-gray-100 py-4 text-right pr-8">
                      <IconButton size="small" onClick={() => onViewReceipt(booking)} className="text-gray-400 hover:text-gray-700">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {total > 0 && onPageChange && (
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={onPageChange}
          rowsPerPage={limit}
          rowsPerPageOptions={[limit]}
        />
      )}
    </Box>
  );
}
