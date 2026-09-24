import { useCallback, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import { BOOKING_STATUS } from "../../../../../../common/enums/booking-status.enum";
import EllipsisCell from "@/components/ellipse-cell";
import BookingListModal from "../booking-list-modal";

interface MonthViewProps {
  currentDate: Date;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
}

const MAX_VISIBLE_EVENTS = 2;

export default function MonthView({
  currentDate,
  bookings,
  getStatusColor,
  onEventClick,
}: Readonly<MonthViewProps>) {
  const [moreDayDate, setMoreDayDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [days]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getBookingsForDay = useCallback(
    (day: Date) =>
      bookings
        .filter((b) => isSameDay(new Date(b.start_time), day))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [bookings]
  );

  const moreDayBookings = useMemo(
    () => (moreDayDate ? getBookingsForDay(moreDayDate) : []),
    [moreDayDate, getBookingsForDay],
  );

  return (
    <>
      <div className="flex flex-col h-full bg-card border-t border-border">
        <div className="grid grid-cols-7 shrink-0 border-b border-border bg-muted/40">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider ${
                i === 0 || i === 6 ? "text-muted-foreground/70" : "text-muted-foreground"
              } ${i < 6 ? "border-r border-border/50" : ""}`}
            >
              {day}
            </div>
          ))}
        </div>

        <div
          className="flex-1 grid overflow-hidden"
          style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}
        >
          {weeks.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className={`grid grid-cols-7 min-h-0 ${
                weekIdx < weeks.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              {week.map((day, dayIdx) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isWeekend = dayIdx === 0 || dayIdx === 6;
                const dayBookings = getBookingsForDay(day);
                const hasOverflow = dayBookings.length > MAX_VISIBLE_EVENTS;
                const visibleBookings = dayBookings.slice(0, hasOverflow ? 1 : MAX_VISIBLE_EVENTS);
                const overflowCount = dayBookings.length - visibleBookings.length;

                return (
                  <div
                    key={day.toString()}
                    onClick={() => dayBookings.length > 0 && setMoreDayDate(day)}
                    className={`flex flex-col min-h-0 overflow-hidden p-2 justify-between transition-colors cursor-pointer group ${
                      dayIdx < 6 ? "border-r border-border/50" : ""
                    } ${
                      !isCurrentMonth
                        ? "bg-muted/20"
                        : isWeekend
                        ? "bg-muted/10"
                        : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex justify-between items-center shrink-0">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors ${
                          isToday
                            ? "bg-primary text-primary-foreground shadow-sm font-bold"
                            : isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground/40"
                        }`}
                      >
                        {format(day, "d")}
                      </span>

                    </div>
                      {/* Mobile total count badge */}
                      {dayBookings.length > 0 && (
                        <span className="sm:hidden inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                          {dayBookings.length}
                        </span>
                      )}

                    {/* Desktop detailed booking chips */}
                    <div className="hidden sm:flex flex-col gap-1 min-h-0 overflow-hidden">
                      {visibleBookings.map((booking) => {
                        const color = getStatusColor(booking.status);
                        const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;
                        return (
                          <button
                            key={booking.uuid}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(booking);
                            }}
                            className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 hover:brightness-110 hover:shadow-sm shrink-0 text-white"
                            style={{ backgroundColor: color }}
                          >
                            <span className={`font-bold tabular-nums shrink-0 ${isCancelled ? "line-through opacity-70" : ""}`}>
                              {format(new Date(booking.start_time), "HH:mm")}
                            </span>
                            <EllipsisCell
                              value={booking.customer_name}
                              maxChars={12}
                              className={`flex-1 min-w-0 text-[11px] font-medium text-white opacity-90 capitalize ${isCancelled ? "line-through opacity-60" : ""}`}
                            />
                            {booking.is_walk_in && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-sm" title="Walk-in Booking" />
                            )}
                          </button>
                        );
                      })}

                      {overflowCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMoreDayDate(day);
                          }}
                          className="w-full shrink-0 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm focus:outline-none"
                        >
                          See all (+{overflowCount})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <BookingListModal
        isOpen={!!moreDayDate}
        onClose={() => setMoreDayDate(null)}
        title={moreDayDate ? format(moreDayDate, "EEEE, MMMM d") : ""}
        bookings={moreDayBookings}
        getStatusColor={getStatusColor}
        onEventClick={onEventClick}
      />
    </>
  );
}
