import { useMemo } from "react";
import { User } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import { BOOKING_STATUS } from "../../../../../../common/enums/booking-status.enum";
import { assignSlots } from "../../utils/overlap-utils";

interface WeekViewProps {
  currentDate: Date;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
}

export default function WeekView({
  currentDate,
  bookings,
  getStatusColor,
  onEventClick,
}: Readonly<WeekViewProps>) {
  const days = useMemo(() => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(startDate);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Dynamic hour range: always covers 8–22 but extends to cover any booking outside
  const hours = useMemo(() => {
    const defaultStart = 8;
    const defaultEnd = 22;
    const weekBookings = bookings.filter((b) =>
      days.some((d) => isSameDay(new Date(b.start_time), d))
    );
    if (weekBookings.length === 0) {
      return Array.from({ length: defaultEnd - defaultStart + 1 }, (_, i) => i + defaultStart);
    }
    const bookingHours = weekBookings.map((b) => new Date(b.start_time).getHours());
    const minHour = Math.min(defaultStart, ...bookingHours);
    const maxHour = Math.max(defaultEnd, ...bookingHours);
    return Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour);
  }, [bookings, days]);

  // Pre-compute slot assignments per day so overlapping bookings get columns
  const slotsByDay = useMemo(() => {
    const map = new Map<string, ReturnType<typeof assignSlots<Booking>>>();
    days.forEach((day) => {
      const dayBookings = bookings.filter((b) => isSameDay(new Date(b.start_time), day));
      map.set(day.toDateString(), assignSlots(dayBookings));
    });
    return map;
  }, [bookings, days]);

  const hourHeightPx = 96; // h-24 = 6rem = 96px

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-card">
        <div className="grid grid-cols-[56px_repeat(7,1fr)] min-w-full">

          {/* ── Sticky Days Header ── */}
          <div className="sticky top-0 z-20 bg-muted/40 border-r border-b border-border/60 backdrop-blur-sm" />
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={`head-${day.toString()}`}
                className="sticky top-0 z-20 py-2.5 text-center border-r border-b border-border/60 last:border-r-0 bg-muted/40 backdrop-blur-sm"
              >
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] transition-all ${
                    isToday
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
                      : "text-foreground font-medium hover:bg-muted/40"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}

          {/* ── Time Labels column ── */}
          <div className="bg-muted/10 border-r border-border/60">
            {hours.map((hour) => (
              <div key={hour} className="h-24 border-b border-border/60 relative">
                <span className="absolute -top-2.5 right-2 text-[10px] font-medium text-muted-foreground/70 tabular-nums">
                  {format(new Date().setHours(hour, 0), "HH:mm")}
                </span>
              </div>
            ))}
          </div>

          {/* ── Day columns ── */}
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            const daySlots = slotsByDay.get(day.toDateString()) ?? [];
            const minHour = hours[0];

            return (
              <div
                key={day.toString()}
                className={`border-r border-border/60 last:border-r-0 relative ${
                  isToday ? "bg-primary/[0.04]" : "bg-card"
                }`}
                style={{ height: `${hours.length * hourHeightPx}px` }}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-b border-border/60 hover:bg-muted/10 transition-colors"
                    style={{
                      top: `${(hour - minHour) * hourHeightPx}px`,
                      height: `${hourHeightPx}px`,
                    }}
                  />
                ))}

                {/* Booking chips — absolutely positioned by time */}
                {daySlots.map(({ booking, column, totalColumns }) => {
                  const color = getStatusColor(booking.status);
                  const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;

                  const startDate = new Date(booking.start_time);
                  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
                  const minMinutes = minHour * 60;
                  const topPx = ((startMinutes - minMinutes) / 60) * hourHeightPx;

                  // Duration: use end_time if available, else default 60 min
                  const endDate = booking.end_time ? new Date(booking.end_time) : null;
                  const durationMinutes = endDate
                    ? (endDate.getHours() * 60 + endDate.getMinutes()) - startMinutes
                    : 60;
                  const heightPx = Math.max((durationMinutes / 60) * hourHeightPx - 4, 52);

                  // Column positioning with small gap between siblings
                  const GAP = 3;
                  const widthPct = (1 / totalColumns) * 100;
                  const leftPct = (column / totalColumns) * 100;

                  return (
                    <button
                      key={booking.uuid}
                      type="button"
                      onClick={() => onEventClick(booking)}
                      className="absolute rounded-md overflow-hidden cursor-pointer text-left transition-all flex flex-col gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 hover:brightness-110 hover:shadow-md text-white"
                      style={{
                        top: `${topPx + 2}px`,
                        height: `${heightPx}px`,
                        left: `calc(${leftPct}% + ${GAP}px)`,
                        width: `calc(${widthPct}% - ${GAP * 2}px)`,
                        backgroundColor: `color-mix(in srgb, ${color} 80%, transparent)`,
                        zIndex: 10 + column,
                        outline: "none",
                        padding: "5px 7px",
                      }}
                    >
                      <span
                        className={`font-bold tabular-nums text-[12px] leading-tight shrink-0 ${
                          isCancelled ? "line-through opacity-70" : ""
                        }`}
                      >
                        {format(startDate, "HH:mm")}
                        {endDate && (
                          <span className="font-normal opacity-80 text-[10px] ml-1">
                            – {format(endDate, "HH:mm")}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1 opacity-90 min-w-0">
                        <User className="w-3 h-3 shrink-0" />
                        <span
                          className={`truncate font-medium text-[11px] leading-tight ${
                            isCancelled ? "line-through opacity-70" : ""
                          }`}
                        >
                          {booking.customer_name}
                        </span>
                      </div>
                      {booking.service_name && heightPx > 70 && (
                        <span className="text-[10px] opacity-75 truncate leading-tight">
                          {booking.service_name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
