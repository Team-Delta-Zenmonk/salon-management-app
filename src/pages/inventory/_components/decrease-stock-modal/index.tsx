import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import TextField from "../../../../components/form/textfield";
import { useAppDispatch } from "../../../../store/hooks";
import { decreaseStockAction } from "../../../../features/inventory/decrease-items-stock/decrease-items-stock.action";
import { callSnack } from "../../../../components/snackbar";
import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";

interface DecreaseStockModalProps {
  open: boolean;
  onClose: () => void;
  inventoryItem: InventoryItem | null;
  onSuccess: () => void;
}

export const DecreaseStockModal: React.FC<DecreaseStockModalProps> = ({
  open,
  onClose,
  inventoryItem,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = async (data: any) => {
    if (!inventoryItem) return;

    setLoading(true);
    try {
      const newStock = Math.max(0, (inventoryItem.current_stock || 0) - Number(data.quantity));
      await dispatch(decreaseStockAction({ uuid: inventoryItem.uuid, newStock })).unwrap();
      callSnack("Stock decreased successfully", "success");
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      callSnack(error?.message || "Failed to decrease stock", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "8px",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 3,
        }}
      >
        <Typography variant="titleMd" fontWeight="bold" color="primary.900">
          Decrease Stock
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="paragraphMd" color="text.secondary" sx={{ fontWeight: 500 }}>
              Enter the quantity you want to subtract from <strong style={{ fontWeight: 600 }}>{inventoryItem?.name}</strong>.
            </Typography>
            <Typography variant="paragraphSm" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Current stock: <strong style={{ fontWeight: 600 }}>{inventoryItem?.current_stock} units</strong>
            </Typography>

            <Box className="flex flex-col gap-2">
              <Typography variant="titleSm" fontWeight="bold">Quantity to Decrease</Typography>
              <TextField
                identifier="decrease-quantity"
                name="quantity"
                control={control}
                type="number"
                label="Quantity to Decrease"
                placeholder="e.g. 5"
                rules={{
                  required: "Required",
                  min: { value: 1, message: "Quantity must be at least 1" },
                  max: { value: inventoryItem?.current_stock || 0, message: "Cannot decrease more than current stock" }
                } as any}
                min={1}
                max={inventoryItem?.current_stock || 1000}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={onClose} disabled={loading} sx={{ fontWeight: "bold" }}>
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ fontWeight: "bold", px: 3 }}
          >
            {loading ? "DECREASING..." : "DECREASE STOCK"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
