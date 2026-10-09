import { useCallback, useMemo, useRef, useState, useLayoutEffect } from "react";
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
import { CalendarX2, Clock, User, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BOOKING_STATUS } from "@/common/enums/booking-status.enum";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import EllipsisCell from "@/components/ellipse-cell";

interface MonthViewProps {
  currentDate: Date;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
  updatingBookingUuid?: string | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthView({
  currentDate,
  bookings,
  getStatusColor,
  onEventClick,
}: Readonly<MonthViewProps>) {
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weeks = useMemo(() => {
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [days]);

  const getBookingsForDay = useCallback(
    (day: Date) =>
      bookings
        .filter((b) => isSameDay(new Date(b.start_time), day))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [bookings]
  );

  const expandedBookings = useMemo(
    () => (expandedDay ? getBookingsForDay(expandedDay) : []),
    [expandedDay, getBookingsForDay]
  );

  const totalBookings = bookings.filter((b) =>
    isSameMonth(new Date(b.start_time), currentDate)
  ).length;

  return (
    <div className="relative flex flex-col h-full bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-muted/20 shrink-0">
        <span className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{totalBookings}</span> bookings this month
        </span>
        {expandedDay && (
          <button
            type="button"
            onClick={() => setExpandedDay(null)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Close drawer
          </button>
        )}
      </div>

      <div className="grid grid-cols-7 border-b border-border/40 shrink-0 bg-muted/40">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${i === 0 || i === 6 ? "text-muted-foreground/60" : "text-muted-foreground"
              }`}
          >
            <span className="sm:hidden">{d.slice(0, 2)}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      <div
        className="flex-1 grid min-h-0"
        style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}
      >
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className={`grid grid-cols-7 min-h-0 ${wi < weeks.length - 1 ? "border-b border-border/40" : ""
              }`}
          >
            {week.map((day, di) => {
              const inMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isWeekend = di === 0 || di === 6;
              const dayBkgs = getBookingsForDay(day);
              const isExpanded = expandedDay != null && isSameDay(day, expandedDay);

              const statusCounts = dayBkgs.reduce(
                (acc, b) => {
                  acc[b.status] = (acc[b.status] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>
              );

              return (
                <div
                  key={day.toString()}
                  onClick={() => dayBkgs.length > 0 && setExpandedDay(isExpanded ? null : day)}
                  className={`
                    relative flex flex-col justify-between min-h-0 overflow-hidden
                    p-1 sm:p-2 cursor-pointer transition-colors select-none
                    border-r border-border/40 last:border-r-0
                    ${!inMonth
                      ? "bg-muted/20 opacity-40"
                      : isWeekend
                        ? "bg-muted/10"
                        : "bg-card hover:bg-muted/20"
                    }
                    ${isExpanded ? "ring-2 ring-inset ring-primary/50 bg-primary/5" : ""}
                  `}
                >
                  <div className="flex items-start justify-between gap-0.5 shrink-0">
                    <span
                      className={`
                        inline-flex items-center justify-center
                        w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0
                        text-[10px] sm:text-xs font-bold transition-colors
                        ${isToday
                          ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
                          : inMonth
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      `}
                    >
                      {format(day, "d")}
                    </span>
                    {dayBkgs.length > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[16px] h-4.5 rounded-full text-[9px] sm:text-[10px] font-extrabold px-1 bg-primary/15 text-primary border border-primary/20 leading-none shrink-0 mt-0.5">
                        {dayBkgs.length}
                      </span>
                    )}
                  </div>

                  {dayBkgs.length > 0 && (
                    <div className="flex flex-col gap-1 mt-auto shrink-0">
                      <div className="flex flex-wrap gap-1 items-center justify-center sm:justify-start">
                        {Object.entries(statusCounts).map(([status, count]) => (
                          <span
                            key={status}
                            className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: getStatusColor(status as BookingStatus) }}
                          >
                            <span>{count}</span>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-center sm:justify-start">
                        <span className="text-[9px] sm:text-[10px] font-bold text-primary flex items-center gap-0.5 hover:underline pt-0.5">
                          {isExpanded ? "Close" : "View"}
                          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {expandedDay && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/25 backdrop-blur-[1px] z-10"
              onClick={() => setExpandedDay(null)}
            />

            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="absolute bottom-0 left-0 right-0 z-20 flex flex-col bg-card border-t-2 border-primary/30 shadow-2xl rounded-t-2xl max-h-[60%] min-h-[40%]"
            >
              <div className="flex justify-center pt-2 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <CalendarX2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm sm:text-base font-bold text-foreground truncate">
                    {format(expandedDay, "EEEE, MMMM d")}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    · {expandedBookings.length} {expandedBookings.length === 1 ? "booking" : "bookings"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedDay(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3 pb-6">
                  {expandedBookings.map((b) => {
                    const color = getStatusColor(b.status);
                    const isCancelled = b.status === BOOKING_STATUS.CANCELLED;
                    const duration = b.end_time
                      ? Math.round(
                        (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 60000
                      )
                      : null;

                    return (
                      <button
                        key={b.uuid}
                        type="button"
                        onClick={() => {
                          setExpandedDay(null);
                          onEventClick(b);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl text-white text-left hover:brightness-110 hover:shadow-md transition-all"
                        style={{ backgroundColor: color }}
                      >
                        <div className="flex flex-col items-center shrink-0 gap-0.5 min-w-[36px]">
                          <Clock className="w-3.5 h-3.5 opacity-80" />
                          <span
                            className={`text-xs font-bold tabular-nums leading-tight ${isCancelled ? "line-through opacity-70" : ""
                              }`}
                          >
                            {format(new Date(b.start_time), "h:mm a")}
                          </span>
                          {duration != null && (
                            <span className="text-[10px] opacity-70 leading-tight">{duration}m</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isCancelled ? "line-through opacity-70" : ""
                              }`}
                          >
                            <User className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <EllipsisCell value={b.customer_name} maxChars={20} />
                          </div>
                          {b.service_name && (
                            <EllipsisCell value={b.service_name} maxChars={20} className="text-xs opacity-80 block capitalize mt-0.5" />
                          )}
                          {b.staff_name && b.staff_name !== "Unknown" && (
                            <EllipsisCell value={b.service_name} maxChars={20} className="text-[11px] opacity-70 block capitalize" />
                          )}
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/10 uppercase tracking-wider">
                            {b.status}
                          </span>
                          {b.is_walk_in && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 uppercase">
                              Walk-in
                            </span>
                          )}
                          {b.total_price != null && (
                            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                              ₹{b.total_price}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

