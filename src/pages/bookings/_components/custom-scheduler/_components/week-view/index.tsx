import { useMemo, useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, CalendarX2 } from "lucide-react";
import { BOOKING_STATUS } from "@/common/enums/booking-status.enum";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import BookingListModal from "../booking-list-modal";

interface WeekViewProps {
  currentDate: Date;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
  updatingBookingUuid?: string | null;
}

export default function WeekView({
  currentDate,
  bookings,
  getStatusColor,
  onEventClick,
}: Readonly<WeekViewProps>) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(start);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const idx = days.findIndex((d) => isSameDay(d, new Date()));
    return idx >= 0 ? idx : 0;
  });

  const [modalInfo, setModalInfo] = useState<{
    title: string;
    bookings: Booking[];
  } | null>(null);

  const activeDay = days[activeDayIndex] ?? days[0];

  const getBookingsForDay = (day: Date): Booking[] =>
    bookings
      .filter((b) => isSameDay(new Date(b.start_time), day))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden bg-card">
        <div className="flex sm:hidden items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/20 shrink-0">
          <button
            type="button"
            onClick={() => setActiveDayIndex((i) => Math.max(0, i - 1))}
            disabled={activeDayIndex === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">{format(activeDay, "EEEE")}</p>
            <p className="text-xs text-muted-foreground">{format(activeDay, "MMMM d")}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveDayIndex((i) => Math.min(days.length - 1, i + 1))}
            disabled={activeDayIndex === days.length - 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex sm:hidden overflow-x-auto custom-scrollbar gap-1.5 px-3 py-2 border-b border-border/30 shrink-0">
          {days.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const isActive = i === activeDayIndex;
            const count = getBookingsForDay(day).length;
            return (
              <button
                key={day.toString()}
                type="button"
                onClick={() => setActiveDayIndex(i)}
                className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg shrink-0 text-xs transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="font-bold text-[10px] uppercase tracking-wide">{format(day, "EEE")}</span>
                <span className="font-black text-sm">{format(day, "d")}</span>
                {count > 0 ? (
                  <span
                    className={`text-[9px] font-extrabold px-1 rounded-full leading-tight ${
                      isActive ? "bg-white/25 text-white" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {count}
                  </span>
                ) : (
                  <span className="h-4" />
                )}
                {isToday && !isActive && <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </button>
            );
          })}
        </div>

        <div className="flex sm:hidden flex-col flex-1 overflow-y-auto custom-scrollbar p-3">
          {(() => {
            const dayBookings = getBookingsForDay(activeDay);
            if (dayBookings.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40">
                  <CalendarX2 className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs italic">No bookings on this day</p>
                </div>
              );
            }
            return (
              <div className="flex flex-col gap-2">
                {dayBookings.map((b) => {
                  const color = getStatusColor(b.status);
                  const isCancelled = b.status === BOOKING_STATUS.CANCELLED;
                  return (
                    <button
                      key={b.uuid}
                      type="button"
                      onClick={() => onEventClick(b)}
                      className="flex items-center gap-3 p-3 rounded-xl text-white text-left hover:brightness-110 transition-all shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      <div className="flex flex-col items-center shrink-0 gap-0.5 min-w-[40px]">
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            isCancelled ? "line-through opacity-70" : ""
                          }`}
                        >
                          {format(new Date(b.start_time), "h:mm a")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs font-bold capitalize block truncate ${
                            isCancelled ? "line-through opacity-70" : ""
                          }`}
                        >
                          {b.customer_name}
                        </span>
                        {b.service_name && (
                          <span className="text-[11px] opacity-80 truncate block capitalize">
                            {b.service_name}
                          </span>
                        )}
                        {b.staff_name && b.staff_name !== "Unknown" && (
                          <span className="text-[10px] opacity-65 truncate block capitalize">
                            {b.staff_name}
                          </span>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/10 uppercase">
                          {b.status}
                        </span>
                        {b.is_walk_in && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 uppercase">
                            Walk-in
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="hidden sm:flex flex-col flex-1 overflow-hidden">
          <div
            className="grid border-b border-border/40 bg-muted/40 shrink-0 grid-cols-7"
          >
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toString()}
                  className="py-2.5 text-center border-r border-border/30 last:border-r-0"
                >
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isToday ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "EEE")}
                  </p>
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mt-0.5 ${
                      isToday
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 grid grid-cols-7 overflow-y-auto custom-scrollbar">
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              const cellBookings = getBookingsForDay(day);

              return (
                <div
                  key={day.toString()}
                  className={`border-r border-border/25 last:border-r-0 p-2 flex flex-col gap-1.5 min-h-[300px] ${
                    isToday ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  {cellBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                      <CalendarX2 className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground">No bookings</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 pb-2">
                      {cellBookings.map((b) => {
                        const color = getStatusColor(b.status);
                        const isCancelled = b.status === BOOKING_STATUS.CANCELLED;
                        return (
                          <button
                            key={b.uuid}
                            type="button"
                            onClick={() => onEventClick(b)}
                            className="w-full flex flex-col p-2 rounded-lg text-white hover:brightness-110 transition-all text-left shadow-xs shrink-0 gap-0.5"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${color} 90%, transparent)`,
                            }}
                          >
                            <div className="flex items-center justify-between min-w-0">
                              <span
                                className={`text-[9px] font-black tabular-nums ${
                                  isCancelled ? "line-through opacity-70" : ""
                                }`}
                              >
                                {format(new Date(b.start_time), "h:mm a")}
                              </span>
                              {b.is_walk_in && (
                                <span className="text-[8px] font-extrabold px-1 rounded-xs bg-amber-400 text-amber-950 uppercase">
                                  W
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-bold truncate leading-tight capitalize ${
                                isCancelled ? "line-through opacity-60" : ""
                              }`}
                            >
                              {b.customer_name}
                            </span>
                            {b.service_name && (
                              <span className="text-[9px] opacity-75 truncate block capitalize leading-tight">
                                {b.service_name}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BookingListModal
        isOpen={!!modalInfo}
        onClose={() => setModalInfo(null)}
        title={modalInfo?.title ?? ""}
        bookings={modalInfo?.bookings ?? []}
        getStatusColor={getStatusColor}
        onEventClick={onEventClick}
      />
    </>
  );
}
