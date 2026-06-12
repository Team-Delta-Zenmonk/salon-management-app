import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { callSnack } from "../../../../components/snackbar";
import { createInventoryLogService as logTransaction } from "../../../../features/inventory/create-inventory-log/create-inventory-log.service";
import { useAppSelector } from "../../../../store/hooks";
import { updateInventoryLogService as updateTransaction } from "../../../../features/inventory/update.inventory-log.ts/update.inventory-log.service";
import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";
import type { InventoryTransaction } from "../../../../features/inventory/inventory-log.slice";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../../components/form/textfield";
import DatePicker from "../../../../components/form/date-picker";
import Select from "../../../../components/form/select";
import { inventoryLogSchema } from "../schema/inventory-log.schema";

interface LogTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: InventoryTransaction | null;
  createdItem?: any;
  onAddNewItem?: () => void;
}

export const LogTransactionModal: React.FC<LogTransactionModalProps> = ({ open, onClose, onSuccess, transactionToEdit, createdItem, onAddNewItem }) => {
  const [loading, setLoading] = useState(false);
  const stockItems = useAppSelector((state) => state.inventoryItem.data);

  const { control, handleSubmit, reset, watch, trigger } = useForm({
    resolver: zodResolver(inventoryLogSchema),
    defaultValues: {
      item_uuid: "",
      ordered_date: "",
      received_date: "",
      ordered_quantity: 1,
      received_quantity: 0,
      damaged_quantity: 0,
      returned_quantity: 0,
      bill_amount: 0,
    },
  });

  const itemUuid = watch("item_uuid");
  const orderedDate = watch("ordered_date");
  const receivedDate = watch("received_date");

  const options = stockItems.map((item: InventoryItem) => {
    const variantStr = [item.variant_name, item.unit].filter(Boolean).join(" ");
    return {
      label: `${item.name} - ${variantStr || 'Standard'}`,
      value: item.uuid,
      item_uuid: item.uuid,
    };
  });

  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        reset({
          item_uuid: transactionToEdit.item.uuid,
          ordered_date: transactionToEdit.ordered_date ? dayjs(transactionToEdit.ordered_date).format("YYYY-MM-DD") : "",
          received_date: transactionToEdit.received_date ? dayjs(transactionToEdit.received_date).format("YYYY-MM-DD") : "",
          ordered_quantity: transactionToEdit.ordered_quantity || 1,
          received_quantity: transactionToEdit.received_quantity || 0,
          damaged_quantity: transactionToEdit.damaged_quantity || 0,
          returned_quantity: transactionToEdit.returned_quantity || 0,
          bill_amount: transactionToEdit.bill_amount || 0,
        });
      } else if (createdItem) {
        reset({
          item_uuid: createdItem.uuid,
          ordered_date: "",
          received_date: "",
          ordered_quantity: 1,
          received_quantity: 0,
          damaged_quantity: 0,
          returned_quantity: 0,
          bill_amount: 0,
        });
      } else {
        reset({
          item_uuid: "",
          ordered_date: "",
          received_date: "",
          ordered_quantity: 1,
          received_quantity: 0,
          damaged_quantity: 0,
          returned_quantity: 0,
          bill_amount: 0,
        });
      }
    }
  }, [open, reset, transactionToEdit, createdItem]);


  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        item_uuid: data.item_uuid,
        ordered_date: data.ordered_date ? dayjs(data.ordered_date).format("YYYY-MM-DD") : undefined,
        received_date: data.received_date ? dayjs(data.received_date).format("YYYY-MM-DD") : undefined,
        ordered_quantity: Number(data.ordered_quantity),
        received_quantity: Number(data.received_quantity),
        damaged_quantity: Number(data.damaged_quantity),
        returned_quantity: Number(data.returned_quantity),
        bill_amount: Number(data.bill_amount),
      };

      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.uuid, payload);
        callSnack("Transaction updated successfully", "success");
      } else {
        await logTransaction(payload);
        callSnack("Transaction logged successfully", "success");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      callSnack(error?.response?.data?.errors?.[0]?.message || `Failed to ${transactionToEdit ? "update" : "log"} transaction`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            orderRadius: "8px",
            overflow: "hidden",
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
          {transactionToEdit ? "Edit Stock Entry" : "Add Stock Entry"}
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} alignItems={{ xs: "stretch", sm: "center" }}>
              <Box className="flex flex-col gap-2" flex={1}>
                <Typography variant="titleSm" fontWeight="bold">Select Inventory Item</Typography>
                <Select
                  name="item_uuid"
                  control={control}
                  placeholder="Select Inventory Item"
                  identifier="transaction-item-select"
                  options={options}
                  disabled={false}
                />
              </Box>
              {!transactionToEdit && (
                <Button variant="outlined" onClick={onAddNewItem} sx={{ mt: { xs: 0, sm: 4 } }}>
                  <Typography>+ New Item</Typography>
                </Button>
              )}
            </Box>

            {itemUuid && (
              <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                  <Box flex={1} className="flex flex-col gap-2">
                    <Typography variant="titleSm" fontWeight="bold">Ordered Date</Typography>
                    <DatePicker
                      identifier="ordered_date"
                      name="ordered_date"
                      control={control}
                      placeholder="Ordered Date"
                      format="YYYY-MM-DD"
                      disableFuture
                      handleChange={() => {
                        if (receivedDate) {
                          trigger("received_date");
                        }
                      }}
                    />
                  </Box>
                  <Box flex={1} className="flex flex-col gap-2">
                    <Typography variant="titleSm" fontWeight="bold">Received Date</Typography>
                    <DatePicker
                      identifier="received_date"
                      name="received_date"
                      control={control}
                      placeholder="Received Date"
                      format="YYYY-MM-DD"
                      disableFuture
                      minDate={orderedDate ? dayjs(orderedDate) : undefined}
                    />
                  </Box>
                </Box>
                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                  <Box flex={1} className="flex flex-col gap-2">
                    <Typography variant="titleSm" fontWeight="bold">Ordered Quantity</Typography>
                    <TextField
                      identifier="ordered_quantity"
                      name="ordered_quantity"
                      control={control}
                      type="number"
                      label="Ordered Quantity"
                    />
                  </Box>
                  <Box flex={1} className="flex flex-col gap-2">
                    <Typography variant="titleSm" fontWeight="bold">Received Quantity</Typography>
                    <TextField
                      identifier="received_quantity"
                      name="received_quantity"
                      control={control}
                      type="number"
                      label="Received Quantity"
                    />
                  </Box>
                </Box>
                <Box display="flex" gap={2}>
                  <Box flex={1} className="flex flex-col gap-2">
                    <Typography variant="titleSm" fontWeight="bold">Damaged Quantity</Typography>
                    <TextField
                      identifier="damaged_quantity"
                      name="damaged_quantity"
                      control={control}
                      type="number"
                      label="Damaged Quantity"
                    />
                  </Box>
                  <Box flex={1} className="flex flex-col gap-2">
                    <Typography variant="titleSm" fontWeight="bold">Returned Quantity</Typography>
                    <TextField
                      identifier="returned_quantity"
                      name="returned_quantity"
                      control={control}
                      type="number"
                      label="Returned Quantity"
                    />
                  </Box>
                </Box>
                <Box className="flex flex-col gap-2">
                  <Typography variant="titleSm" fontWeight="bold">Bill Amount</Typography>
                  <TextField
                    identifier="bill_amount"
                    name="bill_amount"
                    control={control}
                    type="number"
                    label="Bill Amount"
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={onClose} disabled={loading} sx={{ fontWeight: "bold" }}>
            CANCEL
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !itemUuid} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined} sx={{ fontWeight: "bold", px: 3 }}>
            {loading ? "SAVING..." : (transactionToEdit ? "Save" : "Add")}
          </Button>
        </DialogActions>

      </form>
    </Dialog>
  );
};
