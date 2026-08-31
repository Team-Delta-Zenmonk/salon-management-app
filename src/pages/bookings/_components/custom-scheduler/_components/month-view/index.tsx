import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Clock, User, X } from "lucide-react";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // Track which day's "more" dialog is open — null = none
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

  // Bookings for the currently open "more" dialog
  const moreDayBookings = useMemo(
    () => (moreDayDate ? getBookingsForDay(moreDayDate) : []),
    [moreDayDate, getBookingsForDay],
  );

  const handleMoreEventClick = (booking: Booking) => {
    onEventClick(booking);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-card border-t border-border">
        {/* ── Weekday header ── */}
        <div className="grid grid-cols-7 shrink-0 border-b border-border bg-muted/40">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider ${
                i === 0 || i === 6 ? "text-muted-foreground/70" : "text-muted-foreground"
              } ${i < 6 ? "border-r border-border/60" : ""}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ── */}
        <div
          className="flex-1 grid overflow-hidden"
          style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}
        >
          {weeks.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className={`grid grid-cols-7 min-h-0 ${
                weekIdx < weeks.length - 1 ? "border-b border-border/60" : ""
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
                    className={`flex flex-col min-h-0 overflow-hidden p-1.5 gap-1 transition-colors ${
                      dayIdx < 6 ? "border-r border-border/60" : ""
                    } ${
                      !isCurrentMonth
                        ? "bg-muted/20"
                        : isWeekend
                        ? "bg-muted/10"
                        : "bg-card hover:bg-muted/20"
                    }`}
                  >
                    {/* Day number */}
                    <div className="flex justify-between items-center shrink-0">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors ${
                          isToday
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground/40"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    {/* Event pills */}
                    <div className="flex flex-col gap-1 min-h-0 overflow-hidden">
                      {visibleBookings.map((booking) => {
                        const color = getStatusColor(booking.status);
                        const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;
                        return (
                          <button
                            key={booking.uuid}
                            type="button"
                            onClick={() => onEventClick(booking)}
                            className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 hover:brightness-110 hover:shadow-sm shrink-0 text-white"
                            style={{ backgroundColor: color }}
                          >
                            <span className={`font-bold tabular-nums shrink-0 ${isCancelled ? "line-through opacity-70" : ""}`}>
                              {format(new Date(booking.start_time), "HH:mm")}
                            </span>
                            <span className={`truncate flex-1 opacity-90 ${isCancelled ? "line-through opacity-60" : ""}`}>
                              {booking.customer_name}
                            </span>
                          </button>
                        );
                      })}

                      {overflowCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setMoreDayDate(day)}
                          className="w-full shrink-0 flex items-center justify-center px-2 py-1 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none"
                        >
                          +{overflowCount} more
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

      {/* ── "More events" Dialog — separate from calendar DOM ── */}
      <Dialog open={!!moreDayDate} onOpenChange={(o) => !o && setMoreDayDate(null)}>
        <DialogContent className="w-[92vw] sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden border-border/60 shadow-2xl [&>button]:hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-muted/30 border-b border-border/50">
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <CalendarDays className="w-4 h-4 text-primary" />
                {moreDayDate && format(moreDayDate, "EEEE, MMMM d")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground ml-6">
                {moreDayBookings.length} {moreDayBookings.length === 1 ? "booking" : "bookings"}
              </p>
            </div>
            <button
              onClick={() => setMoreDayDate(null)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable booking list */}
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-2 p-4">
              {moreDayBookings.map((booking) => {
                const color = getStatusColor(booking.status);
                const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;
                return (
                  <button
                    key={booking.uuid}
                    type="button"
                    onClick={() => handleMoreEventClick(booking)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:brightness-110 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 text-white"
                    style={{ backgroundColor: color }}
                  >
                    {/* Time */}
                    <div className={`text-xs font-bold tabular-nums shrink-0 ${isCancelled ? "line-through opacity-70" : ""}`}>
                      <Clock className="w-3 h-3 inline mr-1 opacity-80" />
                      {format(new Date(booking.start_time), "h:mm a")}
                    </div>

                    {/* Customer + service */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate flex items-center gap-1.5 ${isCancelled ? "line-through opacity-70" : ""}`}>
                        <User className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        {booking.customer_name}
                      </div>
                      {booking.service_name && (
                        <div className="text-[11px] opacity-75 truncate mt-0.5">
                          {booking.service_name}
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 bg-white/20 border border-white/10">
                      {booking.status}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
