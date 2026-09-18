import { useState } from "react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import type { Booking, BookingStatus } from "../../types/booking.type";
import MonthView from "./_components/month-view";
import WeekView from "./_components/week-view";
import DayView from "./_components/day-view";
import EllipsisCell from "@/components/ellipse-cell";

interface CustomSchedulerProps {
  bookings: Booking[];
  updateBookingStatus: (bookingUuid: string, newStatus: BookingStatus) => void;
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
}

type ViewType = "month" | "week" | "day";

export default function CustomScheduler({
  bookings,
  getStatusColor,
  onEventClick,
  currentDate: controlledDate,
  onDateChange,
}: Readonly<CustomSchedulerProps>) {
  const [internalDate, setInternalDate] = useState(new Date());
  const currentDate = controlledDate ?? internalDate;

  const setDate = (newDate: Date | ((prev: Date) => Date)) => {
    const updated = typeof newDate === "function" ? newDate(currentDate) : newDate;
    if (onDateChange) {
      onDateChange(updated);
    } else {
      setInternalDate(updated);
    }
  };

  const [view, setView] = useState<ViewType>("month");
  const [direction, setDirection] = useState(0);

  const handlePrevious = () => {
    setDirection(-1);
    if (view === "month") setDate((d) => subMonths(d, 1));
    else if (view === "week") setDate((d) => subWeeks(d, 1));
    else setDate((d) => subDays(d, 1));
  };

  const handleNext = () => {
    setDirection(1);
    if (view === "month") setDate((d) => addMonths(d, 1));
    else if (view === "week") setDate((d) => addWeeks(d, 1));
    else setDate((d) => addDays(d, 1));
  };

  const handleToday = () => {
    setDirection(0);
    setDate(new Date());
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : dir < 0 ? -50 : 0, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 50 : dir > 0 ? -50 : 0, opacity: 0 }),
  };

  return (
    <div className="flex flex-col flex-1 min-h-[550px] sm:min-h-[600px] h-full bg-card rounded-xl border border-border shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:px-5 border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-primary/10 text-primary shrink-0">
              <CalendarIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <h2 className="text-sm sm:text-lg md:text-xl text-foreground flex items-baseline gap-1 min-w-0">
              <EllipsisCell value={format(currentDate, "MMMM")} className="font-bold text-foreground min-w-0 flex-1" />
              <span className="font-medium text-muted-foreground text-xs sm:text-base shrink-0">{format(currentDate, "yyyy")}</span>
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              onClick={handlePrevious}
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="h-8 px-2.5 sm:px-3.5 text-xs sm:text-sm font-semibold rounded-lg border-border/60 text-foreground hover:bg-muted/40 transition-colors"
              onClick={handleToday}
            >
              Today
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/50 relative justify-center sm:justify-start">
          {(["month", "week", "day"] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 sm:flex-initial relative px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md capitalize z-10 transition-colors ${
                view === v
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {view === v && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-card rounded-md shadow-sm border border-border/50"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-card min-h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${view}-${currentDate.getTime()}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            {view === "month" && (
              <MonthView
                currentDate={currentDate}
                bookings={bookings}
                getStatusColor={getStatusColor}
                onEventClick={onEventClick}
              />
            )}
            {view === "week" && (
              <WeekView
                currentDate={currentDate}
                bookings={bookings}
                getStatusColor={getStatusColor}
                onEventClick={onEventClick}
              />
            )}
            {view === "day" && (
              <DayView
                currentDate={currentDate}
                bookings={bookings}
                getStatusColor={getStatusColor}
                onEventClick={onEventClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}