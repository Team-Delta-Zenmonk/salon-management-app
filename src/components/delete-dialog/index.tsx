import { Dialog, DialogContent, DialogActions, Button, Typography, CircularProgress, Box } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";


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
}: Readonly<DeleteDialogProps>) {
  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      PaperProps={{
        sx: {
          padding: "12px",
          borderRadius: "16px",
          maxWidth: "420px",
          width: "100%"
        }
      }}
    >
      <Box className="flex flex-col items-center pt-6 pb-2 px-4">
        <Box className="w-14 h-14 rounded-full bg-[var(--error-50)] flex items-center justify-center mb-4 ring-8 ring-[var(--error-50)]/50">
          <WarningAmberIcon className="text-[var(--error-600)]" fontSize="large" />
        </Box>
        <Typography variant="h5" fontWeight="bold" className="text-center text-[var(--text-primary)] mb-2">
          {title}
        </Typography>
      </Box>

      <DialogContent className="py-2 px-6 text-center overflow-visible">
        <Typography variant="body2" className="text-[var(--text-muted)] leading-relaxed">
          Are you sure you want to delete <strong>"{itemName}"</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions className="gap-3 p-6 flex-col sm:flex-row mt-2">
        <Button onClick={onClose} disabled={isLoading} variant="outlined" className="w-full sm:w-1/2" sx={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onDelete}
          disabled={isLoading}
          className="w-full sm:w-1/2"
          disableElevation
          startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
