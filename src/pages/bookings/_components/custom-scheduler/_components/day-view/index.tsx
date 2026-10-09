import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import {
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  User,
  Scissors,
  Loader2,
  CalendarX2,
} from "lucide-react";
import { BOOKING_STATUS } from "@/common/enums/booking-status.enum";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import EllipsisCell from "@/components/ellipse-cell";

interface DayViewProps {
  currentDate: Date;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
  updatingBookingUuid?: string | null;
}

const COLUMNS = [
  {
    id: "upcoming",
    label: "Upcoming",
    icon: Circle,
    iconClass: "text-amber-500",
    headerBg: "bg-amber-500/10 border-amber-500/20",
    statuses: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] as string[],
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    headerBg: "bg-emerald-500/10 border-emerald-500/20",
    statuses: [BOOKING_STATUS.COMPLETED] as string[],
  },
  {
    id: "cancelled",
    label: "Cancelled / Expired",
    icon: XCircle,
    iconClass: "text-rose-500",
    headerBg: "bg-rose-500/10 border-rose-500/20",
    statuses: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.EXPIRED] as string[],
  },
] as const;

function BookingCard({
  booking,
  getStatusColor,
  onEventClick,
  isUpdating,
}: {
  booking: Booking;
  getStatusColor: (s: BookingStatus) => string;
  onEventClick: (b: Booking) => void;
  isUpdating: boolean;
}) {
  const color = getStatusColor(booking.status);
  const isCancelled = [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.EXPIRED].includes(
    booking.status as any
  );

  return (
    <button
      type="button"
      onClick={() => onEventClick(booking)}
      className={`w-full text-left flex flex-col gap-1.5 p-3 rounded-xl bg-card border border-border/40 hover:shadow-md hover:border-border/60 transition-all group ${isCancelled ? "opacity-60" : ""
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span
            className={`text-xs font-bold text-foreground capitalize truncate ${isCancelled ? "line-through" : ""
              }`}
          >
            {booking.customer_name}
          </span>
        </div>
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
        ) : booking.is_walk_in ? (
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 uppercase shrink-0">
            Walk-in
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="w-3 h-3 shrink-0" />
        <span className="text-[11px] tabular-nums">
          {format(new Date(booking.start_time), "h:mm a")}
          {booking.end_time && ` – ${format(new Date(booking.end_time), "h:mm a")}`}
        </span>
      </div>

      {booking.service_name && booking.service_name !== "Unknown Service" && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Scissors className="w-3 h-3 shrink-0" />
          <EllipsisCell value={booking.service_name} maxChars={20} className="text-[11px] capitalize" />
        </div>
      )}

      {booking.staff_name && booking.staff_name !== "Unknown" && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <User className="w-3 h-3 shrink-0" />
          <EllipsisCell value={booking.staff_name} maxChars={20} className="text-[11px] capitalize" />
        </div>
      )}

      {booking.total_price != null && (
        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground">Total</span>
          <EllipsisCell value={`₹${booking.total_price}`} maxChars={20} className="text-xs font-bold text-foreground" />
        </div>
      )}
    </button>
  );
}

export default function DayView({
  currentDate,
  bookings,
  getStatusColor,
  onEventClick,
  updatingBookingUuid,
}: Readonly<DayViewProps>) {
  const isToday = isSameDay(currentDate, new Date());

  const dayBookings = useMemo(
    () =>
      bookings
        .filter((b) => isSameDay(new Date(b.start_time), currentDate))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [bookings, currentDate]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarX2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">
            {format(currentDate, "EEEE, MMMM d")}
          </span>
          {isToday && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
              Today
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{dayBookings.length}</span> total
        </span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row min-h-0">
        {COLUMNS.map((col, idx) => {
          const Icon = col.icon;
          const colBookings = dayBookings
            .filter((b) => col.statuses.includes(b.status))
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
          const hasBookings = colBookings.length > 0;

          return (
            <div
              key={col.id}
              className={`flex flex-col shrink-0 sm:shrink sm:flex-1 min-h-0 overflow-hidden ${hasBookings ? "h-[250px] sm:h-auto" : "h-auto"
                } ${idx < COLUMNS.length - 1
                  ? "border-b sm:border-b-0 sm:border-r border-border/30"
                  : ""
                }`}
            >
              <div
                className={`flex items-center gap-2 px-3 py-2.5 border-b border-border/30 ${col.headerBg} shrink-0`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${col.iconClass}`} />
                <span className="text-xs font-bold text-foreground">{col.label}</span>
                <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-background/60 border border-border/40 text-foreground">
                  {colBookings.length}
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {colBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/30">
                    <Icon className={`w-8 h-8 mb-2 opacity-20 ${col.iconClass}`} />
                    <p className="text-xs font-medium">None</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-3">
                    {colBookings.map((b) => (
                      <BookingCard
                        key={b.uuid}
                        booking={b}
                        getStatusColor={getStatusColor}
                        onEventClick={onEventClick}
                        isUpdating={b.uuid === updatingBookingUuid}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
