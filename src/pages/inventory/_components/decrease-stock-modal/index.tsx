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
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../../components/form/textfield";
import { useAppDispatch } from "../../../../store/hooks";
import { decreaseStockAction } from "../../../../features/inventory/decrease-items-stock/decrease-items-stock.action";
import { callSnack } from "../../../../components/snackbar";
import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";
import { FIELD_LIMITS } from "../../../../common/field-limits";
import {
  getDecreaseStockSchema,
  type DecreaseStockForm,
} from "../schema/decrease-stock.schema";

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
  const currentStock = inventoryItem?.current_stock ?? 0;

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<DecreaseStockForm>({
    defaultValues: {
      quantity: 1,
    },
    resolver: zodResolver(getDecreaseStockSchema(currentStock)) as unknown as Resolver<DecreaseStockForm>,
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({ quantity: 1 });
    }
  }, [open, inventoryItem, reset]);

  const onSubmit = async (data: DecreaseStockForm) => {
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
      <DialogContent className="w-[95vw] sm:max-w-md p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b bg-muted/20 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Decrease Stock
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
              maxLength={FIELD_LIMITS.QUANTITY}
              disabled={currentStock <= 0}
            />
          </div>
          <DialogFooter className="m-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t bg-muted/10 gap-2.5 sm:gap-3 flex flex-row items-center justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-1/2 sm:w-auto flex-1 sm:flex-none rounded-full px-4 sm:px-6 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || currentStock <= 0}
              className="w-1/2 sm:w-auto flex-1 sm:flex-none rounded-full px-4 sm:px-6 font-semibold shadow-md hover:shadow-lg transition-all"
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
