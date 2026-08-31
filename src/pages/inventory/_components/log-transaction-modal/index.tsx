import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { callSnack } from "../../../../components/snackbar";
import { createInventoryLogService as logTransaction } from "../../../../features/inventory/create-inventory-log/create-inventory-log.service";
import { useAppSelector } from "../../../../store/hooks";
import { updateInventoryLogService as updateTransaction } from "../../../../features/inventory/update.inventory-log.ts/update.inventory-log.service";
import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";
import type { InventoryTransaction } from "../../../../features/inventory/inventory-log.slice";
import dayjs from "dayjs";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../../components/form/textfield";
import DatePicker from "../../../../components/form/date-picker";
import Select from "../../../../components/form/select";
import { inventoryLogSchema, type InventoryLogForm } from "../schema/inventory-log.schema";

interface LogTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: InventoryTransaction | null;
  createdItem?: InventoryItem | null;
  onAddNewItem?: () => void;
}

export const LogTransactionModal: React.FC<LogTransactionModalProps> = ({ open, onClose, onSuccess, transactionToEdit, createdItem, onAddNewItem }) => {
  const [loading, setLoading] = useState(false);
  const stockItems = useAppSelector((state) => state.inventoryItem.data);

  const { control, handleSubmit, reset, watch, trigger } = useForm<InventoryLogForm>({
    resolver: zodResolver(inventoryLogSchema) as unknown as Resolver<InventoryLogForm>,
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
      label: `${item.name} - ${variantStr || 'Standard'} (${item.brand || 'No Brand'})`,
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
          bill_amount: Number(transactionToEdit.bill_amount) || 0,
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


  const onSubmit = async (data: InventoryLogForm) => {
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: { message: string }[] } } };
      callSnack(err?.response?.data?.errors?.[0]?.message || `Failed to ${transactionToEdit ? "update" : "log"} transaction`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {transactionToEdit ? "Edit Stock Entry" : "Add Stock Entry"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col py-5 px-6 gap-5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Select
                  name="item_uuid"
                  control={control}
                  placeholder="Select Inventory Item"
                  identifier="transaction-item-select"
                  label="Search Inventory Item"
                  options={options}
                  disabled={false}
                />
              </div>
              {!transactionToEdit && (
                <Button type="button" variant="outline" onClick={onAddNewItem} className="font-bold shrink-0 h-10 px-4">
                  + Add New Item
                </Button>
              )}
            </div>

            {itemUuid && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <DatePicker
                      identifier="ordered_date"
                      name="ordered_date"
                      control={control}
                      label="Ordered Date"
                      placeholder="Ordered Date"
                      format="YYYY-MM-DD"
                      disableFuture
                      handleChange={() => {
                        if (receivedDate) {
                          trigger("received_date");
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <DatePicker
                      identifier="received_date"
                      name="received_date"
                      control={control}
                      label="Received Date"
                      placeholder="Received Date"
                      format="YYYY-MM-DD"
                      disableFuture
                      minDate={orderedDate ? dayjs(orderedDate) : undefined}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <TextField
                      identifier="ordered_quantity"
                      name="ordered_quantity"
                      control={control}
                      type="number"
                      label="Ordered Quantity"
                    />
                  </div>
                  <div className="flex-1">
                    <TextField
                      identifier="received_quantity"
                      name="received_quantity"
                      control={control}
                      type="number"
                      label="Received Quantity"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <TextField
                      identifier="damaged_quantity"
                      name="damaged_quantity"
                      control={control}
                      type="number"
                      label="Damaged Quantity"
                    />
                  </div>
                  <div className="flex-1">
                    <TextField
                      identifier="returned_quantity"
                      name="returned_quantity"
                      control={control}
                      type="number"
                      label="Returned Quantity"
                    />
                  </div>
                </div>
                <div>
                  <TextField
                    identifier="bill_amount"
                    name="bill_amount"
                    control={control}
                    type="number"
                    label="Bill Amount"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-full px-6 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !itemUuid}
              className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : (transactionToEdit ? "Save Transaction" : "Log Transaction")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
