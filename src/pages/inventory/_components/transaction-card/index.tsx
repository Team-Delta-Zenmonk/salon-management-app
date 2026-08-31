import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";

import type { InventoryTransaction } from "../../../../features/inventory/inventory-log.slice";
import { shouldShowTooltip } from "../../../../common/shouldShowTooltip";

interface TransactionCardProps {
  item: InventoryTransaction;
  onRowClick?: (item: InventoryTransaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ item, onRowClick }) => {
  const variantLabel = (item.item?.variant_name && item.item?.unit)
    ? `${item.item.variant_name} ${item.item.unit}`
    : null;

  const variantSuffix = variantLabel ? ` (${variantLabel})` : "";
  const fullTitle = `${item.item.name}${variantSuffix}`;

  const [titleTooltipOpen, setTitleTooltipOpen] = useState(false);

  return (
    <div
      className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative group cursor-pointer"
      onClick={() => onRowClick?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onRowClick?.(item);
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="p-4 border-b border-border/40 min-w-0 w-full overflow-hidden relative">
        <div className="w-full min-w-0 overflow-hidden mb-3">
          <TooltipProvider delay={200}>
            <Tooltip
              open={titleTooltipOpen}
              onOpenChange={setTitleTooltipOpen}
            >
              <TooltipTrigger className="text-left w-full">
                <span
                  onMouseEnter={(e) => {
                    if (shouldShowTooltip(e.currentTarget)) setTitleTooltipOpen(true);
                  }}
                  onMouseLeave={() => setTitleTooltipOpen(false)}
                  className="font-bold text-base text-foreground overflow-hidden text-ellipsis whitespace-nowrap block w-full capitalize"
                >
                  {fullTitle || "-"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{fullTitle}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider mr-1.5">
              Ordered:
            </span>
            <span className="font-bold text-foreground/80">
              {item.ordered_date ? dayjs(item.ordered_date).format("MMM DD, YYYY") : "N/A"}
            </span>
          </div>
          <div className="flex items-center text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider mr-1.5">
              Received:
            </span>
            <span className="font-bold text-foreground/80">
              {item.received_date ? dayjs(item.received_date).format("MMM DD, YYYY") : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ordered Qty</span>
          <span className="text-sm font-extrabold text-foreground">
            {item.ordered_quantity}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Received Qty</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {item.received_quantity}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Damaged / Returned</span>
          <span className="text-sm font-extrabold text-destructive/90">
            {item.damaged_quantity} / {item.returned_quantity}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bill Amount</span>
          <span className="text-sm font-extrabold text-foreground">
            ₹{Number.parseFloat(item.bill_amount || "0").toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
};
