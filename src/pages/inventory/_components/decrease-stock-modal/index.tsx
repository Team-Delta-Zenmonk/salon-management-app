import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Loader2 } from "lucide-react";
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

  const { control, handleSubmit, reset } = useForm<{ quantity: number }>({
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = async (data: { quantity: number }) => {
    if (!inventoryItem) return;

    setLoading(true);
    try {
      const newStock = Math.max(0, (inventoryItem.current_stock || 0) - Number(data.quantity));
      await dispatch(decreaseStockAction({ uuid: inventoryItem.uuid, newStock })).unwrap();
      callSnack("Stock decreased successfully", "success");
      onSuccess();
      onClose();
      reset();
    } catch (error: unknown) {
      const err = error as { message?: string };
      callSnack(err?.message || "Failed to decrease stock", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Decrease Stock
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            <div className="text-sm text-muted-foreground font-medium">
              Enter the quantity you want to subtract from <strong className="font-semibold text-foreground">{inventoryItem?.name}</strong>.
            </div>
            <div className="text-sm text-muted-foreground font-medium mb-2">
              Current stock: <strong className="font-semibold text-foreground">{inventoryItem?.current_stock} units</strong>
            </div>

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
              }}
              min={1}
              max={inventoryItem?.current_stock || 1000}
            />
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
              disabled={loading}
              className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Decreasing..." : "Decrease Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
