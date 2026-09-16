import { useMemo, useState } from "react";
import { User } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import { BOOKING_STATUS } from "../../../../../../common/enums/booking-status.enum";
import BookingListModal from "../booking-list-modal";

interface WeekViewProps {
  currentDate: Date;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
}

const HOUR_HEIGHT_PX = 90;
const MAX_VISIBLE_BOOKINGS = 1;

export default function WeekView({
  currentDate,
  bookings,
  getStatusColor,
  onEventClick,
}: Readonly<WeekViewProps>) {
  const [selectedSlot, setSelectedSlot] = useState<{ day: Date; hour: number } | null>(null);

  const days = useMemo(() => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(startDate);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Dynamic hour range: covers 8–22 or extends to cover early/late bookings
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

  // Group bookings by Day -> Hour
  const bookingsByDayAndHour = useMemo(() => {
    const map = new Map<string, Map<number, Booking[]>>();
    days.forEach((day) => {
      const dayKey = day.toDateString();
      const hourMap = new Map<number, Booking[]>();
      const dayBookings = bookings.filter((b) => isSameDay(new Date(b.start_time), day));

      for (const b of dayBookings) {
        const h = new Date(b.start_time).getHours();
        if (!hourMap.has(h)) hourMap.set(h, []);
        hourMap.get(h)?.push(b);
      }
      map.set(dayKey, hourMap);
    });
    return map;
  }, [bookings, days]);

  const modalBookings = useMemo(() => {
    if (!selectedSlot) return [];
    const hourMap = bookingsByDayAndHour.get(selectedSlot.day.toDateString());
    return hourMap?.get(selectedSlot.hour) ?? [];
  }, [selectedSlot, bookingsByDayAndHour]);

  const modalTitle = useMemo(() => {
    if (!selectedSlot) return "";
    return `${format(selectedSlot.day, "EEEE, MMMM d")} at ${format(new Date().setHours(selectedSlot.hour, 0), "hh:mm a")}`;
  }, [selectedSlot]);

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden bg-card w-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-card">
          <div className="grid grid-cols-[56px_repeat(7,minmax(120px,1fr))] min-w-full">

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
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] transition-all ${isToday
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
                <div key={hour} style={{ height: `${HOUR_HEIGHT_PX}px` }} className="border-b border-border/60 relative">
                  <span className="absolute -top-2.5 right-2 text-[10px] font-medium text-muted-foreground/70 tabular-nums">
                    {format(new Date().setHours(hour, 0), "HH:mm")}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Day columns ── */}
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              const hourMap = bookingsByDayAndHour.get(day.toDateString());
              const minHour = hours[0];

              return (
                <div
                  key={day.toString()}
                  className={`border-r border-border/60 last:border-r-0 relative ${isToday ? "bg-primary/[0.04]" : "bg-card"
                    }`}
                  style={{ height: `${hours.length * HOUR_HEIGHT_PX}px` }}
                >
                  {/* Hour slots */}
                  {hours.map((hour) => {
                    const hourBookings = hourMap?.get(hour) ?? [];
                    const hasOverflow = hourBookings.length > MAX_VISIBLE_BOOKINGS;
                    const visibleBookings = hasOverflow
                      ? hourBookings.slice(0, MAX_VISIBLE_BOOKINGS)
                      : hourBookings;
                    const overflowCount = hourBookings.length - visibleBookings.length;
                    const topPx = (hour - minHour) * HOUR_HEIGHT_PX;

                    return (
                      <div
                        key={hour}
                        className="absolute w-full border-b border-border/60 flex flex-col gap-1 p-1 overflow-hidden"
                        style={{
                          top: `${topPx}px`,
                          height: `${HOUR_HEIGHT_PX}px`,
                        }}
                      >
                        {visibleBookings.map((booking, idx) => {
                          const color = getStatusColor(booking.status);
                          const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;
                          const startDate = new Date(booking.start_time);
                          const endDate = booking.end_time ? new Date(booking.end_time) : null;

                          return (
                            <button
                              key={`${booking.uuid}-${idx}`}
                              type="button"
                              onClick={() => onEventClick(booking)}
                              className="w-full rounded-md cursor-pointer text-left transition-all flex flex-col justify-center px-2 py-1 text-white border border-white/10 shrink-0 hover:brightness-110 shadow-sm"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${color} 85%, transparent)`,
                              }}
                            >
                              <span
                                className={`font-bold tabular-nums text-[11px] leading-tight ${isCancelled ? "line-through opacity-70" : ""
                                  }`}
                              >
                                {format(startDate, "HH:mm")}
                                {endDate && (
                                  <span className="font-normal opacity-80 text-[10px] ml-1">
                                    – {format(endDate, "HH:mm")}
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-1 opacity-90 min-w-0 justify-between">
                                <div className="flex items-center gap-1 min-w-0">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span
                                    className={`truncate font-semibold text-[11px] leading-tight ${isCancelled ? "line-through opacity-70" : ""
                                      }`}
                                  >
                                    {booking.customer_name}
                                  </span>
                                </div>
                                {booking.is_walk_in && (
                                  <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-400 text-amber-950 shrink-0 shadow-sm">
                                    Walk-in
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}

                        {/* "See all" button when multiple bookings exist in cell */}
                        {overflowCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedSlot({ day, hour })}
                            className="w-full shrink-0 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm focus:outline-none"
                          >
                            See all (+{overflowCount})
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BookingListModal
        isOpen={selectedSlot !== null}
        onClose={() => setSelectedSlot(null)}
        title={modalTitle}
        bookings={modalBookings}
        getStatusColor={getStatusColor}
        onEventClick={onEventClick}
      />
    </>
  );
}
