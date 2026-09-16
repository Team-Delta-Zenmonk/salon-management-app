import { CalendarDays, Clock, User, X } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BOOKING_STATUS, type BookingStatus } from "@/common/enums/booking-status.enum";
import type { Booking } from "@/pages/bookings/types/booking.type";

interface BookingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  bookings: Booking[];
  getStatusColor: (status: BookingStatus) => string;
  onEventClick: (booking: Booking) => void;
}

export default function BookingListModal({
  isOpen,
  onClose,
  title,
  bookings,
  getStatusColor,
  onEventClick,
}: Readonly<BookingListModalProps>) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92vw] sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden border-border/60 shadow-2xl [&>button]:hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-muted/30 border-b border-border/50">
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <CalendarDays className="w-4 h-4 text-primary" />
              {title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground ml-6">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="flex flex-col gap-2 p-4">
            {bookings.map((booking, idx) => {
              const color = getStatusColor(booking.status);
              const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;
              return (
                <button
                  key={`${booking.uuid}-${idx}`}
                  type="button"
                  onClick={() => {
                    onClose();
                    onEventClick(booking);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:brightness-110 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 text-white"
                  style={{ backgroundColor: color }}
                >
                  <div className={`text-xs font-bold tabular-nums shrink-0 ${isCancelled ? "line-through opacity-70" : ""}`}>
                    <Clock className="w-3 h-3 inline mr-1 opacity-80" />
                    {format(new Date(booking.start_time), "h:mm a")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate flex items-center gap-1.5 ${isCancelled ? "line-through opacity-70" : ""}`}>
                      <User className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      {booking.customer_name}
                    </div>
                    {booking.service_name && (
                      <div className="text-[11px] opacity-75 truncate mt-0.5">
                        {booking.service_name}
                        {booking.staff_name && <span> · {booking.staff_name}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {booking.is_walk_in && (
                      <div className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-400 text-amber-950 font-extrabold shadow-sm">
                        Walk-in
                      </div>
                    )}
                    <div className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/20 border border-white/10">
                      {booking.status}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
