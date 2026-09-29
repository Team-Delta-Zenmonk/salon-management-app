import React from "react";
import dayjs from "dayjs";
import type { InventoryTransaction } from "../../../../features/inventory/inventory-log.slice";
import { EllipsisCell } from "@/components/ellipse-cell";
import { Button } from "../../../../components/ui/button";
import { Eye, Loader2 } from "lucide-react";

interface TransactionCardProps {
  item: InventoryTransaction;
  onRowClick?: (item: InventoryTransaction) => void;
  loadingLogUuid?: string | null;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ item, onRowClick, loadingLogUuid }) => {
  const isCardLoading = loadingLogUuid === item.uuid;

  const variantLabel = (item.item?.variant_name && item.item?.unit)
    ? `${item.item.variant_name} ${item.item.unit}`
    : null;

  const variantSuffix = variantLabel ? ` (${variantLabel})` : "";
  const fullTitle = `${item.item.name}${variantSuffix}`;

  return (
    <div
      className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="p-4 border-b border-border/50 min-w-0 w-full overflow-hidden relative">
        <div className="flex items-start justify-between gap-3 mb-2">
          <EllipsisCell value={fullTitle || "-"} maxChars={25} className="font-bold text-foreground text-sm capitalize block min-w-0 flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-full text-xs font-semibold gap-1.5 border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer shrink-0 w-[76px] justify-center flex items-center"
            onClick={() => onRowClick?.(item)}
            disabled={isCardLoading}
            title="View Log Details"
          >
            {isCardLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span>View</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider mr-1.5">
              Ordered:
            </span>
            <span className="font-bold text-foreground/80">
              {item.ordered_date
                ? dayjs(item.ordered_date).format("MMM DD, YYYY")
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider mr-1.5">
              Received:
            </span>
            <span className="font-bold text-foreground/80">
              {item.received_date
                ? dayjs(item.received_date).format("MMM DD, YYYY")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Ordered Qty
          </span>
          <span className="text-sm font-extrabold text-foreground">
            {item.ordered_quantity}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Received Qty
          </span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {item.received_quantity}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Damaged / Returned
          </span>
          <span className="text-sm font-extrabold text-destructive/90">
            {item.damaged_quantity} / {item.returned_quantity}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Bill Amount
          </span>
          <span className="text-sm font-extrabold text-foreground">
            ₹{Number.parseFloat(item.bill_amount || "0").toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
};
