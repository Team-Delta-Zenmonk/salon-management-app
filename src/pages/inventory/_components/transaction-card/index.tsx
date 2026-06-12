import React, { useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import type { InventoryTransaction } from "../../../../features/inventory/inventory-log.slice";
import styles from "../inventory-cards.module.scss";
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
    <Box
      className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer mb-4"
      onClick={() => onRowClick?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onRowClick?.(item);
      }}
    >
      <Box className="mb-4">
        <Tooltip
          title={fullTitle}
          open={titleTooltipOpen}
          onClose={() => setTitleTooltipOpen(false)}
          disableHoverListener
          arrow
          placement="top"
        >
          <Typography
            onMouseEnter={(e) => {
              if (shouldShowTooltip(e.currentTarget)) setTitleTooltipOpen(true);
            }}
            onMouseLeave={() => setTitleTooltipOpen(false)}
            fontWeight="800"
            className="text-[var(--text-primary)] capitalize truncate block w-full mb-3"
          >
            {fullTitle || "-"}
          </Typography>
        </Tooltip>

        <Box className="flex justify-between items-center flex-wrap gap-1 mt-1">
          <Typography variant="caption" className="text-[var(--text-muted)] tracking-wider">
            ORDERED ON: <span className="font-semibold text-[var(--text-primary)]">{item.ordered_date ? dayjs(item.ordered_date).format("MMM DD, YYYY") : "N/A"}</span>
          </Typography>
          <Typography variant="caption" className="text-[var(--text-muted)] tracking-wider">
            RECEIVED ON: <span className="font-semibold text-[var(--text-primary)]">{item.received_date ? dayjs(item.received_date).format("MMM DD, YYYY") : "N/A"}</span>
          </Typography>
        </Box>
      </Box>

      <Box className="flex justify-between items-start pt-4 border-t border-[var(--border-subtle)]">
         <Box>
            <Typography variant="caption" className="text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">Ordered Quantity</Typography>
            <Typography variant="subtitle1" fontWeight="bold" className="text-[var(--text-primary)]">
              {item.ordered_quantity}
            </Typography>
         </Box>
         <Box className="text-right">
            <Typography variant="caption" className="text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">Received Quantity</Typography>
            <Typography variant="subtitle1" fontWeight="bold" className="text-[var(--primary)]">
              {item.received_quantity}
            </Typography>
         </Box>
      </Box>

      <Box className="flex justify-between items-start mt-4 mb-2">
         <Box>
            <Typography variant="caption" className="text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">Damaged / Returned</Typography>
            <Typography variant="subtitle1" fontWeight="bold" className="text-[var(--error-600)]">
              {item.damaged_quantity} / {item.returned_quantity}
            </Typography>
         </Box>
         <Box className="text-right">
            <Typography variant="caption" className="text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">Bill Amount</Typography>
            <Typography variant="subtitle1" fontWeight="bold" className="text-[var(--text-primary)]">
              ₹{Number.parseFloat(item.bill_amount || "0").toFixed(0)}
            </Typography>
         </Box>
      </Box>
    </Box>
  );
};
