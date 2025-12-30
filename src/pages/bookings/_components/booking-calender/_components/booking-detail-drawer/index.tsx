import { Box, Button, Chip, Divider, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMemo, useState } from "react";
import type { Booking, BookingStatus } from "../../../../types/booking.type";
import InfoRow from "./_components/drawer-info-row";
import CancelBookingDialog from "./_components/cancel-booking-dialog";

type BookingDetailsDrawerProps = {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  getStatusColor: (status: BookingStatus) => string;
  onCancel: (bookingUuid: string, reason?: string) => void;
};

function formatTimeRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const startTime = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const endTime = end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return { date, startTime, endTime };
}

export default function BookingDetailsDrawer({ open, booking, onClose, getStatusColor, onCancel }: BookingDetailsDrawerProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const statusColor = booking ? getStatusColor(booking.status) : "#6b7280";
  const isCancelled = booking?.status === "cancelled";

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
          <Box className="rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-2">
            <Box className="flex items-center gap-2 text-gray-900">
              <Typography variant="h5" fontWeight="fontWeightMedium">
                {booking ? booking.service_name : "—"}
              </Typography>
            </Box>

            <Typography className="text-gray-600 mt-1">{timeInfo ? timeInfo.date : "—"}</Typography>

            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow
                icon={<PersonOutlineIcon fontSize="small" />}
                label="Customer"
                value={booking?.customer_name ?? "—"}
              />
              <InfoRow
                icon={<EmailOutlinedIcon fontSize="small" />}
                label="Email"
                value={booking?.customer_email ?? "—"}
              />
              <InfoRow icon={<WorkOutlineIcon fontSize="small" />} label="Staff" value={booking?.staff_name ?? "—"} />
            </Box>
          </Box>

          <Box className="rounded-xl border border-gray-200 p-4">
            <Typography className="text-gray-900 font-semibold">Notes</Typography>
            <Typography className="text-gray-600 mt-2 whitespace-pre-wrap">
              {booking?.notes?.trim() ? booking.notes : "No notes added."}
            </Typography>
          </Box>

          <Box className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
            <Typography className="text-gray-900 font-semibold">Actions</Typography>

            <Button
              variant="contained"
              color="error"
              disabled={!booking || isCancelled}
              onClick={() => setConfirmOpen(true)}
            >
              Cancel booking
            </Button>

            {isCancelled && (
              <Typography variant="body2" className="text-gray-500">
                This booking is already cancelled.
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>

      <CancelBookingDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleCancelConfirmed} />
    </>
  );
}
