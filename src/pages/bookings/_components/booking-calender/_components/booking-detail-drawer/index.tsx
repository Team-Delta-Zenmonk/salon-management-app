import { Box, Button, Chip, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMemo, useState } from "react";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import { BOOKING_STATUS } from "../../../../../../common/enums/booking-status.enum";
import { BOOKING_SOURCE } from "../../../../../../common/enums/booking-source.enum";
import InfoRow from "./_components/drawer-info-row";
import CancelBookingDialog from "./_components/cancel-booking-dialog";
import DeleteBookingDialog from "./_components/delete-booking-dialog";
import { formatTimeRange } from "../../../../utils/format-time-range";
import { deleteBookingAction } from "../../../../../../features/booking/delete-booking/delete-booking.action";
import { updateBookingAction } from "../../../../../../features/booking/update-booking/update-booking.action";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BookingDialog from "../../../booking-dialog";
import { useAppDispatch } from "../../../../../../store/hooks";
import { callSnack } from "../../../../../../components/snackbar";

type BookingDetailsDrawerProps = {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  getStatusColor: (status: BookingStatus) => string;
  onCancel: (bookingUuid: string, reason?: string) => void;
};

export default function BookingDetailsDrawer({
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
    onClose();
  };

  const handleDeleteConfirmed = async () => {
    if (!booking) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBookingAction({ uuid: booking.uuid })).unwrap();
      setDeleteConfirmOpen(false);
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || "Failed to save booking";
      callSnack(errorMessage, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            className: "w-full sm:w-[440px] md:w-[480px] bg-white border-l border-gray-200",
          },
        }}
      >
        <Box className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <Box className="flex items-start justify-between p-4">
            <Box className="min-w-0">
              <Typography variant="h6" className="text-gray-900 font-semibold truncate">
                Booking Details
              </Typography>
              <Typography variant="body2" className="text-gray-500 mt-1">
                {booking ? `#${booking.uuid}` : "—"}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className="px-4 pb-4 flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <Chip
                label={booking?.status ? booking.status.toUpperCase() : "—"}
                size="small"
                sx={{
                  bgcolor: `${statusColor}15`,
                  color: statusColor,
                  border: `1px solid ${statusColor}40`,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                }}
              />
              {booking?.payment_policy === "pay_at_venue" && (
                <Chip
                  label="Unpaid (Pay at Venue)"
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 700 }}
                />
              )}
              {booking?.payment_policy === "partial_deposit" && booking?.deposit_amount != null && (
                <Chip
                  label={`Deposit: ₹${booking.deposit_amount}`}
                  size="small"
                  color="info"
                  sx={{ fontWeight: 700 }}
                />
              )}
              {booking?.payment_policy === "full_upfront" && booking?.amount_paid_online != null && (
                <Chip
                  label={`Paid Full: ₹${booking.amount_paid_online}`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            {timeInfo && (
              <Box className="flex items-center gap-2 text-gray-600">
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2">
                  {timeInfo.startTime} – {timeInfo.endTime}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box className="p-4 space-y-4">
          <Box className="rounded-xl border border-gray-200 p-4 shadow-sm">
            <Typography variant="body2" className="text-gray-500 mb-2" fontWeight="bold">
              Customer
            </Typography>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow
                icon={<PersonOutlineIcon fontSize="small" />}
                label="Name"
                value={booking?.customer_name ?? "—"}
              />
              {booking?.customer_email && (
                <InfoRow icon={<EmailOutlinedIcon fontSize="small" />} label="Email" value={booking.customer_email} />
              )}

              {booking?.customer_phone && (
                <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />} label="Phone" value={booking.customer_phone} />
              )}
            </Box>
            <Typography className="text-gray-500 mt-3" variant="body2">
              {timeInfo ? timeInfo.date : "—"}
            </Typography>
          </Box>

          <Box className="space-y-2">
            <Typography variant="body2" className="text-gray-500 px-1" fontWeight="bold">
              Services ({booking?.booking_services?.length ?? 0})
            </Typography>
            {(booking?.booking_services ?? []).map((bs: any, idx: number) => (
              <Box key={bs.service?.uuid ?? bs.service?.name} className="rounded-xl border border-gray-200 p-3 shadow-sm">
                <Box className="flex items-center justify-between">
                  <Typography variant="body1" fontWeight="fontWeightMedium" textTransform="capitalize" className="text-gray-900">
                    {bs.service?.name || "Unknown Service"}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    ₹{Math.round(Number(bs.price) || 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box className="flex items-center gap-3 mt-1">
                  <InfoRow
                    icon={<WorkOutlineIcon sx={{ fontSize: 16 }} />}
                    label="Staff"
                    value={`${bs.staff?.first_name || "Unknown"} ${bs.staff?.last_name || ""}`.trim()}
                  />
                  <Typography variant="caption" className="text-gray-500">
                    {Number(bs.duration_minutes) || 0} mins
                  </Typography>
                </Box>
              </Box>
            ))}

            {(booking?.booking_services?.length ?? 0) > 0 && (
              <Box className="rounded-lg py-2 px-3 flex items-center justify-between" sx={{ bgcolor: "grey.100" }}>
                <Typography variant="caption" className="text-gray-600">
                  {booking?.total_duration} mins total
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  ₹{Math.round(Number(booking?.total_price) || 0).toLocaleString("en-IN")}
                </Typography>
              </Box>
            )}
          </Box>

          <Box className="rounded-xl border border-gray-200 p-4">
            <Typography className="text-gray-900 font-semibold">Notes</Typography>
            <Typography className="text-gray-600 mt-2 whitespace-pre-wrap">
              {booking?.notes?.trim() ? booking.notes : "No notes added."}
            </Typography>
          </Box>

          <Box className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
            <Typography className="text-gray-900 font-semibold">Actions</Typography>

            <Box className="flex flex-col gap-4">
              <Box className="grid grid-cols-2 gap-2">
                {isAdminBooking && (
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => setEditOpen(true)}
                    disabled={isCancelled || isCompleted}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                )}

                {!isCompleted && !isCancelled && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      if (booking) {
                        dispatch(
                          updateBookingAction({
                            uuid: booking.uuid,
                            body: { status: BOOKING_STATUS.COMPLETED },
                          }),
                        );
                        onClose();
                      }
                    }}
                    sx={{ color: "white" }}
                    className="flex-1"
                  >
                    Complete
                  </Button>
                )}
              </Box>

              <Box className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Button
                  variant="outlined"
                  color="error"
                  disabled={!booking || isCancelled || isCompleted}
                  onClick={() => setConfirmOpen(true)}
                  fullWidth
                >
                  Cancel booking
                </Button>

                {isAdminBooking && (
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={isDeleting}
                    fullWidth
                    size="small"
                  >
                    Permanently Delete
                  </Button>
                )}
              </Box>
            </Box>

            {(isCancelled || isCompleted) && (
              <Typography variant="body2" className="text-gray-500">
                This booking is already {booking?.status}.
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>

      <CancelBookingDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleCancelConfirmed} />

      <DeleteBookingDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
        isDeleting={isDeleting}
      />

      {booking && <BookingDialog open={editOpen} onClose={() => setEditOpen(false)} mode="update" booking={booking} />}
    </>
  );
}
