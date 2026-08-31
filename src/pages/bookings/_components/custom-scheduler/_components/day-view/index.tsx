import { useMemo } from "react";
import { User, CalendarX2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import { BOOKING_STATUS } from "../../../../../../common/enums/booking-status.enum";
import { assignSlots } from "../../utils/overlap-utils";

interface DayViewProps {
  currentDate: Date;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
}

const HOUR_HEIGHT_PX = 80; // px per hour row

export default function DayView({
  currentDate,
  bookings,
  getStatusColor,
  onEventClick,
}: Readonly<DayViewProps>) {
  const dayBookings = useMemo(
    () =>
      bookings
        .filter((b) => isSameDay(new Date(b.start_time), currentDate))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [bookings, currentDate],
  );

  const hours = useMemo(() => {
    const defaultStart = 8;
    const defaultEnd = 22;
    if (dayBookings.length === 0) {
      return Array.from({ length: defaultEnd - defaultStart + 1 }, (_, i) => i + defaultStart);
    }
    const bookingHours = dayBookings.map((b) => new Date(b.start_time).getHours());
    const minHour = Math.min(defaultStart, ...bookingHours);
    const maxHour = Math.max(defaultEnd, ...bookingHours);
    return Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour);
  }, [dayBookings]);

  const slots = useMemo(() => assignSlots(dayBookings), [dayBookings]);

  const isToday = isSameDay(currentDate, new Date());
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const minHour = hours[0] ?? 8;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {dayBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground/50">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
              <CalendarX2 className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium">No bookings for this day</p>
          </div>
        ) : (
          <div className="flex" style={{ minHeight: `${hours.length * HOUR_HEIGHT_PX}px` }}>

            {/* ── Time labels ── */}
            <div className="w-16 shrink-0 relative">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative"
                  style={{ height: `${HOUR_HEIGHT_PX}px` }}
                >
                  <span
                    className={`absolute -top-2.5 right-3 text-[10px] tabular-nums font-medium ${
                      isToday && currentHour === hour
                        ? "text-primary font-bold"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {format(new Date().setHours(hour, 0), "hh:mm a")}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Grid + events ── */}
            <div className="flex-1 relative border-l border-border/40">
              {/* Hour grid lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full border-b border-dashed border-border/40"
                  style={{ top: `${(hour - minHour) * HOUR_HEIGHT_PX}px`, height: `${HOUR_HEIGHT_PX}px` }}
                />
              ))}

              {/* Current time indicator */}
              {isToday && (
                <div
                  className="absolute w-full z-20 flex items-center pointer-events-none"
                  style={{
                    top: `${((currentHour - minHour) * 60 + currentMinute) / 60 * HOUR_HEIGHT_PX}px`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 -ml-1" />
                  <div className="flex-1 h-px bg-primary opacity-60" />
                </div>
              )}

              {/* Booking chips */}
              {slots.map(({ booking, column, totalColumns }) => {
                const color = getStatusColor(booking.status);
                const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;

                const startDate = new Date(booking.start_time);
                const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
                const minMinutes = minHour * 60;
                const topPx = ((startMinutes - minMinutes) / 60) * HOUR_HEIGHT_PX;

                const endDate = booking.end_time ? new Date(booking.end_time) : null;
                const durationMinutes = endDate
                  ? endDate.getHours() * 60 + endDate.getMinutes() - startMinutes
                  : 60;
                const heightPx = Math.max((durationMinutes / 60) * HOUR_HEIGHT_PX - 4, 48);

                const GAP = 4;
                const widthPct = (1 / totalColumns) * 100;
                const leftPct = (column / totalColumns) * 100;

                return (
                  <div
                    key={booking.uuid}
                    onClick={() => onEventClick(booking)}
                    className="absolute rounded-xl cursor-pointer transition-all hover:brightness-110 hover:shadow-lg text-white flex items-center gap-3"
                    style={{
                      top: `${topPx + 2}px`,
                      height: `${heightPx}px`,
                      left: `calc(${leftPct}% + ${GAP}px)`,
                      width: `calc(${widthPct}% - ${GAP * 2}px)`,
                      backgroundColor: `color-mix(in srgb, ${color} 80%, transparent)`,
                      zIndex: 10 + column,
                      padding: "8px 14px",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-white/30"
                    />

                    <div className="flex-1 min-w-0 pl-2 flex flex-col gap-0.5">
                      {/* Time */}
                      <div className={`text-xs font-bold tabular-nums ${isCancelled ? "line-through opacity-70" : ""}`}>
                        {format(startDate, "HH:mm")}
                        {endDate && (
                          <span className="font-normal opacity-80 ml-1">
                            – {format(endDate, "HH:mm")}
                          </span>
                        )}
                      </div>

                      {/* Customer */}
                      <div className={`font-semibold text-sm truncate flex items-center gap-1.5 ${isCancelled ? "line-through opacity-70" : ""}`}>
                        <User className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        {booking.customer_name}
                      </div>

                      {/* Service + staff — only if tall enough */}
                      {heightPx > 64 && (
                        <div className="text-[11px] opacity-80 truncate">
                          {booking.service_name}
                          {booking.staff_name && (
                            <span className="opacity-70"> · {booking.staff_name}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 bg-white/20 border border-white/10">
                      {booking.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
