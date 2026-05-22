import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from "@mui/material";

type CancelBookingDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CancelBookingDialog({ open, onClose, onConfirm }: Readonly<CancelBookingDialogProps>) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="font-semibold">Cancel this booking?</DialogTitle>

      <DialogContent className="space-y-3">
        <Typography className="text-gray-600">
          This will mark the appointment as <span className="font-semibold">cancelled</span>.
        </Typography>
      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={onClose} variant="outlined">
          Keep booking
        </Button>
        <Button onClick={onConfirm} variant="contained" className="bg-red-600! hover:bg-red-700!">
          Confirm cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
