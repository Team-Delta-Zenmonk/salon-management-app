import dayjs from "dayjs";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking } from "../../types/booking.type";
import { BOOKING_STATUS } from "../../../../common/enums/booking-status.enum";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingTableProps {
  bookings: Booking[];
  onViewReceipt: (booking: Booking) => void;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (newPage: number) => void;
  loading?: boolean;
}

const getPaymentDetails = (booking: Booking) => {
  const total =
    booking.total_price ||
    booking.booking_services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) ||
    0;
  const policy = booking.payment_policy;
  const onlinePaid = booking.amount_paid_online || 0;
  let paid = 0;
  let label = "Pay at Venue";
  let variant: "default" | "secondary" | "outline" | "destructive" = "secondary";

  if (policy === "full_upfront" || (onlinePaid > 0 && onlinePaid >= total)) {
    paid = total;
    label = "Paid Upfront";
    variant = "default";
  } else if (policy === "partial_deposit" || (onlinePaid > 0 && onlinePaid < total)) {
    paid = onlinePaid || booking.deposit_amount || 0;
    label = "Partial Deposit";
    variant = "outline";
  } else if (policy === "pay_at_venue" || (!policy && onlinePaid === 0)) {
    paid = booking.deposit_amount || 0;
    label = "Pay at Venue";
    variant = "secondary";
  }

  const percentage = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return { total, paid, label, percentage, variant };
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case BOOKING_STATUS.CONFIRMED:
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Confirmed
        </Badge>
      );
    case BOOKING_STATUS.COMPLETED:
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Completed
        </Badge>
      );
    case BOOKING_STATUS.CANCELLED:
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20 gap-1.5 font-bold capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          {status.toLowerCase()}
        </Badge>
      );
  }
};

export default function BookingTable({
  bookings,
  onViewReceipt,
  total = 0,
  page = 1,
  limit = 12,
  onPageChange,
  loading = false,
}: Readonly<BookingTableProps>) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="w-full space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="text-xs uppercase font-bold text-muted-foreground py-3.5">Client</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground py-3.5">Service</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground py-3.5">Staff Assigned</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground py-3.5">Status</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground py-3.5">Payment Mode</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground py-3.5 w-[200px]">Amount Details</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground py-3.5">Appointment Date</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground py-3.5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell colSpan={8} className="py-4">
                    <div className="h-6 w-full bg-muted/30 animate-pulse rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                  No bookings found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => {
                const { total, paid, label, percentage, variant } = getPaymentDetails(booking);

                return (
                  <TableRow
                    key={booking.uuid}
                    className="border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-semibold text-foreground text-sm">
                      {booking.customer_name}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {booking.service_name}
                    </TableCell>

                    <TableCell className="text-foreground text-sm font-medium">
                      {booking.staff_name}
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>

                    <TableCell>
                      <Badge variant={variant} className="font-semibold text-xs py-0.5">
                        {label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1.5 w-full max-w-[170px]">
                        <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                          <span>₹{paid.toFixed(2)} / ₹{total.toFixed(2)}</span>
                          <span className={cn(
                            "text-[11px] font-bold",
                            percentage === 100 ? "text-emerald-500" : percentage > 0 ? "text-amber-500" : "text-muted-foreground"
                          )}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              percentage === 100 ? "bg-emerald-500" : percentage > 0 ? "bg-amber-500" : "bg-neutral-400"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">
                          {dayjs(booking.start_time).format("MMM D, YYYY")}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {dayjs(booking.start_time).format("h:mm A")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onViewReceipt(booking)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        title="View Receipt & Payment Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      {total > 0 && onPageChange && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{bookings.length}</strong> of{" "}
            <strong className="text-foreground">{total}</strong> bookings
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="h-8 px-2.5 rounded-lg border-border/60"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="font-bold text-foreground px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="xs"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="h-8 px-2.5 rounded-lg border-border/60"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
