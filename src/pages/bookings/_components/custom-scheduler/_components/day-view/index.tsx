import { useEffect, useMemo, useRef, useState } from "react";
import { User, CalendarX2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import { BOOKING_STATUS } from "../../../../../../common/enums/booking-status.enum";
import EllipsisCell from "@/components/ellipse-cell";
import BookingListModal from "../booking-list-modal";

interface DayViewProps {
  currentDate: Date;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
}

const HOUR_HEIGHT_PX = 80;

export default function DayView({
  currentDate,
  bookings,
  getStatusColor,
  onEventClick,
}: Readonly<DayViewProps>) {
  const [selectedHourDialog, setSelectedHourDialog] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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

  const bookingsByHour = useMemo(() => {
    const map = new Map<number, Booking[]>();
    for (const b of dayBookings) {
      const h = new Date(b.start_time).getHours();
      if (!map.has(h)) map.set(h, []);
      map.get(h)?.push(b);
    }
    return map;
  }, [dayBookings]);

  const modalHourBookings = useMemo(() => {
    if (selectedHourDialog === null) return [];
    return bookingsByHour.get(selectedHourDialog) ?? [];
  }, [selectedHourDialog, bookingsByHour]);

  const modalTitle = useMemo(() => {
    if (selectedHourDialog === null) return "";
    return `${format(currentDate, "MMMM d")} at ${format(new Date().setHours(selectedHourDialog, 0), "hh:mm a")}`;
  }, [currentDate, selectedHourDialog]);

  const isToday = isSameDay(currentDate, new Date());
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const minHour = hours[0] ?? 8;

  const CARD_MIN_WIDTH = 180;
  const SEE_ALL_BTN_WIDTH = 110;
  const GAP = 8;

  const getVisibleCount = (totalItems: number) => {
    if (containerWidth <= 0 || totalItems === 0) return totalItems;

    const totalWidthAll = totalItems * CARD_MIN_WIDTH + (totalItems - 1) * GAP;
    if (totalWidthAll <= containerWidth - 16) {
      return totalItems;
    }

    const availableWidthForCards = containerWidth - SEE_ALL_BTN_WIDTH - 24;
    if (availableWidthForCards < CARD_MIN_WIDTH) {
      return 0;
    }

    const count = Math.floor((availableWidthForCards + GAP) / (CARD_MIN_WIDTH + GAP));
    return Math.max(0, count);
  };

  return (
    <>
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
            <div className="flex pr-2" style={{ minHeight: `${hours.length * HOUR_HEIGHT_PX}px` }}>

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

              <div ref={containerRef} className="flex-1 relative border-l border-border/40">
                {hours.map((hour) => {
                  const hourBookings = bookingsByHour.get(hour) ?? [];
                  const maxVisible = getVisibleCount(hourBookings.length);
                  const hasOverflow = hourBookings.length > maxVisible;
                  const visibleBookings = hasOverflow
                    ? hourBookings.slice(0, maxVisible)
                    : hourBookings;
                  const overflowCount = hourBookings.length - visibleBookings.length;

                  const topPx = (hour - minHour) * HOUR_HEIGHT_PX;

                  return (
                    <div
                      key={hour}
                      className="absolute w-full border-b border-dashed border-border/40 flex items-start px-2 gap-2 py-1.5 overflow-x-auto custom-scrollbar"
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
                          <div
                            key={`${booking.uuid}-${idx}`}
                            onClick={() => onEventClick(booking)}
                            className="relative rounded-lg cursor-pointer transition-all hover:brightness-110 hover:shadow-md text-white flex items-center justify-between border border-white/10 shrink-0 flex-1 min-w-[160px] sm:min-w-[200px] max-w-[280px] h-[54px] z-10 overflow-hidden"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${color} 85%, transparent)`,
                              padding: "6px 10px",
                            }}
                          >
                            <div className="flex-1 min-w-0 pl-1.5 flex flex-col justify-center gap-0.5">
                              <div className={`text-[11px] font-bold tabular-nums leading-tight ${isCancelled ? "line-through opacity-70" : ""}`}>
                                {format(startDate, "HH:mm")}
                                {endDate && (
                                  <span className="font-normal opacity-80 ml-1">
                                    – {format(endDate, "HH:mm")}
                                  </span>
                                )}
                              </div>

                              <div className={`font-semibold text-xs flex items-center gap-1 leading-tight min-w-0 ${isCancelled ? "line-through opacity-70" : ""}`}>
                                <User className="w-3 h-3 shrink-0 opacity-80" />
                                <EllipsisCell
                                  value={booking.customer_name}
                                  maxChars={18}
                                  className="text-xs font-semibold text-white min-w-0 flex-1 capitalize"
                                />
                              </div>

                              {booking.service_name && (
                                <EllipsisCell
                                  value={`${booking.service_name}${booking.staff_name ? ` · ${booking.staff_name}` : ""}`}
                                  maxChars={22}
                                  className="text-[10px] opacity-80 leading-tight text-white/90 min-w-0 block capitalize"
                                />
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-1.5">
                              {booking.is_walk_in && (
                                <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-400 text-amber-950 font-extrabold shadow-sm">
                                  Walk-in
                                </div>
                              )}
                              <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-white/20 border border-white/10">
                                {booking.status}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {overflowCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedHourDialog(hour)}
                          className="shrink-0 z-10 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm focus:outline-none"
                        >
                          See all (+{overflowCount})
                        </button>
                      )}
                    </div>
                  );
                })}

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
              </div>
            </div>
          )}
        </div>
      </div>

      <BookingListModal
        isOpen={selectedHourDialog !== null}
        onClose={() => setSelectedHourDialog(null)}
        title={modalTitle}
        bookings={modalHourBookings}
        getStatusColor={getStatusColor}
        onEventClick={onEventClick}
      />
    </>
  );
}
