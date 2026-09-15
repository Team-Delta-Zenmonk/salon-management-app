import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { itemVariants } from "../utils/dashboard.constants";
import { EllipsisCell } from "../../../components/ellipse-cell";

export interface TodayBookingItem {
  id: number | string;
  uuid: string;
  customer: string;
  service: string;
  time: string;
  status: string;
  initials: string;
}

interface TodayBookingsProps {
  todayBookings: TodayBookingItem[];
  bookingsLoading: boolean;
}

export const TodayBookingsSection = ({ todayBookings, bookingsLoading }: TodayBookingsProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={itemVariants}
      className="p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Today's Bookings</h3>
          {!bookingsLoading && todayBookings.length > 0 && (
            <p className="text-sm text-muted-foreground">
              You have {todayBookings.length} appointment{todayBookings.length !== 1 ? "s" : ""} today.
            </p>
          )}
        </div>
      </div>

      {bookingsLoading ? (
        <div className="grid grid-cols-1 gap-4 flex-1">
          {[1, 2, 3].map((j) => (
            <div
              key={`sk-today-${j}`}
              className="flex items-center justify-between p-3.5 bg-background/30 border border-border/40 rounded-2xl"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-foreground/10 rounded-full shrink-0 animate-pulse" />
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="w-24 h-4 bg-foreground/10 rounded-md animate-pulse" />
                  <div className="w-16 h-3 bg-foreground/5 rounded-md animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                <div className="w-12 h-4 bg-foreground/10 rounded-md animate-pulse" />
                <div className="w-16 h-4 bg-foreground/5 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : todayBookings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-2">
            <CalendarDays className="w-8 h-8 text-primary/40" />
          </div>
          <h1 className="text-xl font-bold text-foreground">No Booking Today</h1>
          <h3 className="text-sm font-medium text-muted-foreground">
            Visit Calendar for seeing whole month booking
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-full border-border/60 hover:bg-background/80 gap-2"
            onClick={() => navigate("/bookings")}
          >
            <CalendarDays className="w-4 h-4" />
            Open Calendar
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 -mr-2 hide-scrollbar">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              `,
              }}
            />
            {todayBookings.map((booking) => (
              <div
                key={booking.uuid}
                className="group flex items-center justify-between p-3.5 bg-background/30 border border-border/40 rounded-2xl hover:border-primary/30 hover:bg-background/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar className="h-10 w-10 border border-primary/10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {booking.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <EllipsisCell value={booking.customer} className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors" />
                    <EllipsisCell value={booking.service} className="text-xs text-muted-foreground font-medium" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                  <p className="font-bold text-sm text-foreground">{booking.time}</p>
                  <span
                    className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full border ${
                      booking.status === "confirmed"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : booking.status === "completed"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        : booking.status === "cancelled" || booking.status === "expired"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4 rounded-full border-border/60 hover:bg-background/80"
            onClick={() => navigate("/bookings")}
          >
            View All Bookings
          </Button>
        </>
      )}
    </motion.div>
  );
};
