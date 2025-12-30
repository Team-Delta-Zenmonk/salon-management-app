import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { useAppDispatch } from "../../../../store/hooks";
import { callSnack } from "../../../../components/snackbar";
import styles from "./booking-dialog.module.scss";
import { useState } from "react";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  booking?: any;
}

export default function BookingDialog({ open, onClose, mode, booking }: BookingDialogProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle
        className={clsx(styles.dialogTitle)}
        id="alert-dialog-title"
        fontWeight="fontWeightMedium"
        variant="h5"
      >
        {mode === "create" ? "Create Category" : "Update Category"}
      </DialogTitle>

      {/* <FormProvider> */}
        <form >
          <DialogContent
            className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}
            id="alert-dialog-description"
          >

          </DialogContent>

          <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
            <Button onClick={onClose} disabled={isLoading}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogActions>
        </form>
      {/* </FormProvider> */}
    </Dialog>
  );
}
