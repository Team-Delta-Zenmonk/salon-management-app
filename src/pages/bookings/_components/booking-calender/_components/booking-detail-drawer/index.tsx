import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../../../../../components/ui/dialog";
import { Button } from "../../../../../../components/ui/button";
import {
  User,
  Mail,
  Phone,
  Clock,
  Scissors,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Calendar,
  IndianRupee,
  Timer,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Booking, BookingStatus, BookingServiceItem } from "../../../../types/booking.type";
import { BOOKING_STATUS } from "../../../../../../common/enums/booking-status.enum";
import { BOOKING_SOURCE } from "../../../../../../common/enums/booking-source.enum";
import { formatTimeRange } from "../../../../utils/format-time-range";
import { deleteBookingAction } from "../../../../../../features/booking/delete-booking/delete-booking.action";
import { updateBookingAction } from "../../../../../../features/booking/update-booking/update-booking.action";
import { useAppDispatch } from "../../../../../../store/hooks";
import { callSnack } from "../../../../../../components/snackbar";
import BookingDialog from "../../../booking-dialog";
import BookingActionConfirmDialog from "../booking-action-confirm-dialog";

type BookingDetailsDrawerProps = {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  getStatusColor: (status: BookingStatus) => string;
  onCancel: (bookingUuid: string, reason?: string) => void;
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  pending: "Pending",
  expired: "Expired",
};

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
      <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/30 flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailsDialog({
  open,
  booking,
  onClose,
  getStatusColor,
  onCancel,
}: Readonly<BookingDetailsDrawerProps>) {
  const dispatch = useAppDispatch();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusColor = booking ? getStatusColor(booking.status) : "#6b7280";
  const isCancelled = booking?.status === BOOKING_STATUS.CANCELLED;
  const isCompleted = booking?.status === BOOKING_STATUS.COMPLETED;
  const isAdminBooking = booking?.created_by === BOOKING_SOURCE.ADMIN;

  const timeInfo = useMemo(() => {
    if (!booking) return null;
    return formatTimeRange(booking.start_time, booking.end_time);
  }, [booking]);

  const handleCancelConfirmed = () => {
    if (!booking) return;
    onCancel(booking.uuid, cancelReason.trim() || undefined);
    setConfirmOpen(false);
    setCancelReason("");
  };

  const handleDeleteConfirmed = async () => {
    if (!booking) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBookingAction({ uuid: booking.uuid })).unwrap();
      callSnack("Booking deleted successfully", "success");
      setDeleteConfirmOpen(false);
      onClose();
    } catch {
      callSnack("Failed to delete booking", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleComplete = () => {
    if (!booking) return;
    dispatch(updateBookingAction({ uuid: booking.uuid, body: { status: BOOKING_STATUS.COMPLETED } }));
    onClose();
  };

  const totalPrice = (booking?.booking_services ?? []).reduce(
    (sum: number, bs: BookingServiceItem) => sum + (Number(bs.price) || 0),
    0,
  );
  const totalDuration = (booking?.booking_services ?? []).reduce(
    (sum: number, bs: BookingServiceItem) => sum + (Number(bs.duration_minutes) || 0),
    0,
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="w-[95vw] sm:max-w-[480px] p-0 gap-0 flex flex-col overflow-hidden border-border/60 shadow-2xl rounded-2xl [&>button]:hidden">
          <DialogDescription className="sr-only">Booking Details Modal</DialogDescription>
          <AnimatePresence>
            {open && booking && (
              <motion.div
                className="flex flex-col h-full"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="shrink-0 relative overflow-hidden bg-muted/20 border-b border-border/50">
                  <div className="relative flex items-start justify-between px-6 pt-5 pb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                          style={{
                            color: statusColor,
                            backgroundColor: `color-mix(in srgb, ${statusColor} 20%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${statusColor} 40%, transparent)`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                            style={{ backgroundColor: statusColor }}
                          />
                          {STATUS_LABELS[booking.status] ?? booking.status}
                        </span>
                      </div>
                      <DialogTitle className="text-lg font-bold text-foreground leading-tight">Booking Details</DialogTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        #{booking.uuid.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ml-2 shrink-0 mt-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {timeInfo && (
                    <div className="relative flex items-center gap-2 px-6 pb-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-background border border-border/60 shadow-sm text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{timeInfo.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-background border border-border/60 shadow-sm text-foreground">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{timeInfo.startTime} – {timeInfo.endTime}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 space-y-5">
                  <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.2 }}
                  >
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5 px-0.5">Customer</p>
                    <div className="flex flex-col gap-2">
                      <InfoCard icon={<User className="h-4 w-4" />} label="Name" value={booking.customer_name ?? "—"} />
                      {booking.customer_email && (
                        <InfoCard icon={<Mail className="h-4 w-4" />} label="Email" value={booking.customer_email} />
                      )}
                      {booking.customer_phone && (
                        <InfoCard icon={<Phone className="h-4 w-4" />} label="Phone" value={booking.customer_phone} />
                      )}
                    </div>
                  </motion.section>

                  <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5 px-0.5">
                      Services ({booking.booking_services?.length ?? 0})
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {(booking.booking_services ?? []).map((bs: BookingServiceItem, i: number) => (
                        <motion.div
                          key={bs.service?.uuid ?? `${bs.service?.name}-${i}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.04, duration: 0.2 }}
                          className="rounded-xl border border-border/40 p-4 bg-card shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Scissors className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="font-semibold text-sm text-foreground leading-tight">
                                {bs.service?.name || "Unknown Service"}
                              </span>
                            </div>
                            <span className="text-sm font-bold shrink-0 px-2 py-0.5 rounded-lg bg-muted/60 text-foreground border border-border/40">
                              ₹{Math.round(Number(bs.price) || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                              <UserCheck className="h-3 w-3" />
                              <span>{`${bs.staff?.first_name || "Unknown"} ${bs.staff?.last_name || ""}`.trim()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                              <Timer className="h-3 w-3" />
                              <span>{Number(bs.duration_minutes) || 0} mins</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {(booking.booking_services?.length ?? 0) > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="mt-3 rounded-xl py-3 px-4 flex items-center justify-between border border-border/50 bg-muted/20"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Timer className="h-3.5 w-3.5" />
                          {totalDuration} mins total
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                          <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                          {Math.round(totalPrice).toLocaleString("en-IN")}
                        </div>
                      </motion.div>
                    )}
                  </motion.section>

                  {booking.notes?.trim() && (
                    <motion.section
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.2 }}
                    >
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5 px-0.5">Notes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap rounded-xl bg-muted/30 border border-border/40 p-3.5 leading-relaxed">
                        {booking.notes}
                      </p>
                    </motion.section>
                  )}

                  {(isCancelled || isCompleted) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl px-4 py-3 text-center text-sm font-medium border border-border/60 bg-muted/30 text-foreground"
                    >
                      This booking is{" "}
                      <span className="font-bold capitalize">{STATUS_LABELS[booking.status] ?? booking.status}</span>.
                    </motion.div>
                  )}
                </div>

                {!isCancelled && !isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className="shrink-0 px-5 py-4 border-t bg-muted/10 space-y-2"
                  >
                    <div className={`grid gap-2 ${isAdminBooking ? "grid-cols-2" : "grid-cols-1"}`}>
                      {isAdminBooking && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditOpen(true)}
                          className="rounded-xl gap-2 h-10 font-medium"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={handleComplete}
                        className="rounded-xl gap-2 h-10 font-semibold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Complete
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-border/40" />
                      <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">Danger Zone</span>
                      <div className="flex-1 h-px bg-border/40" />
                    </div>

                    <div className={`grid gap-2 ${isAdminBooking ? "grid-cols-2" : "grid-cols-1"}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmOpen(true)}
                        className="rounded-xl h-10 font-medium border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all gap-2"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                      {isAdminBooking && (
                        <Button
                          size="sm"
                          onClick={() => setDeleteConfirmOpen(true)}
                          disabled={isDeleting}
                          className="rounded-xl h-10 font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all gap-2 border-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <BookingActionConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancelConfirmed}
        title="Cancel this booking?"
        description={
          <>
            This will mark the appointment as <span className="font-bold text-destructive">cancelled</span>. This
            cannot be undone.
          </>
        }
        confirmText="Confirm cancel"
      />
      <BookingActionConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Permanently Delete Booking?"
        description={
          <>
            This will{" "}
            <span className="font-bold text-destructive">permanently remove</span> this booking from the system.
            This action cannot be undone.
          </>
        }
        confirmText="Permanently Delete"
        isLoading={isDeleting}
      />
      {booking && (
        <BookingDialog open={editOpen} onClose={() => setEditOpen(false)} mode="update" booking={booking} />
      )}
    </>
  );
}