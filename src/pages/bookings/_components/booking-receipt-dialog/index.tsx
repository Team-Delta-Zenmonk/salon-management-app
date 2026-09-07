import { useState } from "react";
import dayjs from "dayjs";
import { Clock, User, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import type { Booking } from "../../types/booking.type";
import { BOOKING_STATUS } from "../../../../common/enums/booking-status.enum";
import { useAppDispatch } from "../../../../store/hooks";
import { collectRemainingPaymentAction } from "../../../../features/booking/collect-remaning-payment/collect-remaining-payment.action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { callSnack } from "../../../../components/snackbar";

interface BookingReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function BookingReceiptDialog({
  open,
  onClose,
  booking,
}: Readonly<BookingReceiptDialogProps>) {
  const dispatch = useAppDispatch();
  const [isCollecting, setIsCollecting] = useState(false);

  if (!booking) return null;

  const total =
    booking.total_price ||
    booking.booking_services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) ||
    0;
  const onlinePaid = booking.amount_paid_online || 0;
  const policy = booking.payment_policy;

  let paid = 0;
  let label = "Pay at Venue";
  let variant: "default" | "secondary" | "outline" | "destructive" = "secondary";

  if (policy === "full_upfront" || (onlinePaid > 0 && onlinePaid >= total)) {
    paid = total;
    label = "Paid Upfront";
    variant = "default";
  } else if (policy === "partial_deposit" || (onlinePaid > 0 && onlinePaid < total)) {
    paid = onlinePaid || booking.deposit_amount || 0;
    label = "Partial Deposit";
    variant = "outline";
  } else if (policy === "pay_at_venue" || (!policy && onlinePaid === 0)) {
    paid = booking.deposit_amount || 0;
    label = "Pay at Venue";
    variant = "secondary";
  }

  const remaining = Math.max(0, total - paid);
  const percentage = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  const formattedDate = dayjs(booking.start_time).format("MMMM D, YYYY");
  const formattedTime = dayjs(booking.start_time).format("h:mm A");

  const handleCollectRemaining = async () => {
    setIsCollecting(true);
    try {
      const result = await dispatch(collectRemainingPaymentAction({ uuid: booking.uuid }));
      if (collectRemainingPaymentAction.fulfilled.match(result)) {
        callSnack("Remaining payment collected successfully!", "success");
        onClose();
      } else {
        callSnack("Failed to collect payment", "error");
      }
    } catch {
      callSnack("An error occurred while processing payment", "error");
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl border-border/60 bg-card p-6 shadow-xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Badge variant={variant} className="font-bold text-xs py-0.5 px-3 rounded-full">
              {label}
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Receipt #{booking.uuid?.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Customer & Service Info */}
          <div>
            <h3 className="text-xl font-bold text-foreground">{booking.customer_name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{booking.service_name}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/40">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Appointment Time
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{formattedDate} • {formattedTime}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Assigned Staff
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{booking.staff_name}</span>
              </div>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
            <div className="flex justify-between items-center text-xs font-bold text-foreground">
              <span>Payment Progress</span>
              <span className={cn(
                percentage === 100 ? "text-emerald-500" : percentage > 0 ? "text-amber-500" : "text-muted-foreground"
              )}>
                {percentage}% Paid
              </span>
            </div>

            <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  percentage === 100 ? "bg-emerald-500" : percentage > 0 ? "bg-amber-500" : "bg-neutral-400"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">
                Paid: <strong className="text-foreground">₹{paid.toFixed(2)}</strong>
              </span>
              <span className="text-muted-foreground">
                Remaining: <strong className="text-foreground">₹{remaining.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground font-medium">Service Total</span>
              <span className="font-bold text-foreground">₹{total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground font-medium">Booking Status</span>
              <Badge variant="outline" className="capitalize font-bold text-xs">
                {booking.status?.toLowerCase()}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/40 gap-2">
          {remaining > 0 && booking.status !== BOOKING_STATUS.CANCELLED ? (
            <>
              <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
                Dismiss
              </Button>
              <Button
                onClick={handleCollectRemaining}
                disabled={isCollecting}
                className="rounded-xl text-xs font-bold gap-2 bg-primary text-primary-foreground"
              >
                {isCollecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                Collect Remaining ₹{remaining.toFixed(0)}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose} className="w-full rounded-xl text-xs font-semibold">
              Close Receipt
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
