import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from "@mui/material";

type DeleteBookingDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

export default function DeleteBookingDialog({ open, onClose, onConfirm, isDeleting }: DeleteBookingDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="font-semibold">Permanently Delete Booking?</DialogTitle>

      <DialogContent className="space-y-3">
        <Typography className="text-gray-600">
          This will <span className="font-semibold text-red-600">permanently remove</span> this booking from the system.
          This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={onClose} variant="outlined" disabled={isDeleting}>
          Keep booking
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          className="bg-red-600! hover:bg-red-700!"
        >
          {isDeleting ? "Deleting..." : "Permanently Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
