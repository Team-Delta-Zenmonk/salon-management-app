import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from "@mui/material";


interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  itemName: string;
  isLoading: boolean;
  onDelete: () => void | Promise<void>;
}

export default function DeleteDialog({
  open,
  onClose,
  title = "Delete Item?",
  itemName,
  isLoading,
  onDelete,
}: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
    >
      <DialogTitle>
        <Typography fontWeight="fontWeightBold">{title}</Typography>
      </DialogTitle>

      <DialogContent className="py-2">
        <Typography>
          Are you sure you want to delete <strong>"{itemName}"</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions className="gap-2 p-3">
        <Button onClick={onClose} disabled={isLoading} variant="outlined">
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onDelete}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
