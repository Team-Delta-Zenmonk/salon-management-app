import { useState } from "react";
import dayjs from "dayjs";
import { Clock, User, ShieldCheck, Loader2, FileText } from "lucide-react";
import type { Booking } from "../../types/booking.type";
import { BOOKING_STATUS } from "../../../../common/enums/booking-status.enum";
import { useAppDispatch } from "../../../../store/hooks";
import { collectRemainingPaymentAction } from "../../../../features/booking/collect-remaning-payment/collect-remaining-payment.action";
import { downloadInvoiceService } from "../../../../features/invoice/download-invoice/download-invoice.service";
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
import EllipsisCell from "@/components/ellipse-cell";

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
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!booking) return;
    const identifier = booking.uuid;
    if (!identifier) {
      callSnack("Booking identifier not found", "error");
      return;
    }

    setIsDownloadingInvoice(true);
    try {
      const res = await downloadInvoiceService(identifier);
      if (res?.url) {
        window.open(res.url, "_blank");
      } else {
        callSnack("Invoice URL not available", "error");
      }
    } catch (err: any) {
      console.error("Failed to download invoice:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to download invoice";
      callSnack(msg, "error");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (!booking) return null;

  const total =
    booking.total_price ||
    booking.booking_services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) ||
    0;
  const onlinePaid = booking.amount_paid_online || 0;
  const policy = booking.payment_preference || booking.payment_policy;

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
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-border/60 bg-card p-4 sm:p-6 shadow-xl max-w-full">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40 pr-8 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={variant} className="font-bold text-xs py-0.5 px-3 rounded-full">
              {label}
            </Badge>
          </div>
          <DialogTitle className="text-sm sm:text-base font-bold text-foreground truncate min-w-0">
            Receipt #{booking.uuid?.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 pt-3 min-w-0 max-w-full">
          <div className="min-w-0 max-w-full">
            <EllipsisCell value={booking.customer_name} className="text-lg sm:text-xl font-bold text-foreground block min-w-0" />
            <EllipsisCell value={booking.service_name || "-"} className="text-xs text-muted-foreground mt-0.5 block min-w-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border/40 min-w-0 max-w-full">
            <div className="space-y-1 min-w-0 max-w-full">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Appointment Time
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground min-w-0">
                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <EllipsisCell value={`${formattedDate} • ${formattedTime}`} className="text-xs font-semibold text-foreground min-w-0 flex-1" />
              </div>
            </div>

            <div className="space-y-1 min-w-0 max-w-full">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Assigned Staff
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground min-w-0">
                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <EllipsisCell value={booking.staff_name || "-"} className="text-xs font-semibold text-foreground min-w-0 flex-1" />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-muted/30 border border-border/40 min-w-0 max-w-full">
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

          <div className="space-y-2 text-xs min-w-0 max-w-full">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground font-medium">Service Total</span>
              <span className="font-bold text-foreground font-mono">₹{total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground font-medium">Booking Status</span>
              <Badge variant="outline" className="capitalize font-bold text-xs">
                {booking.status?.toLowerCase()}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/40 gap-2.5 flex-col-reverse sm:flex-row sm:justify-between sm:items-center -mx-4 -mb-4 p-4 sm:mx-0 sm:mb-0 sm:p-0 bg-transparent rounded-none">
          <Button
            variant="outline"
            onClick={handleDownloadInvoice}
            disabled={isDownloadingInvoice}
            className="rounded-xl text-xs font-semibold gap-2 border-primary/30 text-primary hover:bg-primary/10 w-full sm:w-auto"
          >
            {isDownloadingInvoice ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            Download Invoice
          </Button>

          {remaining > 0 && booking.status !== BOOKING_STATUS.CANCELLED ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold w-full sm:w-auto">
                Dismiss
              </Button>
              <Button
                onClick={handleCollectRemaining}
                disabled={isCollecting}
                className="rounded-xl text-xs font-bold gap-2 bg-primary text-primary-foreground w-full sm:w-auto"
              >
                {isCollecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                Collect Remaining ₹{remaining.toFixed(0)}
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={onClose} className="rounded-xl text-xs font-semibold w-full sm:w-auto">
              Close Receipt
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
