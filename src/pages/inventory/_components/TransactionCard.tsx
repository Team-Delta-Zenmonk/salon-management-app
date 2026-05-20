import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import type { InventoryTransaction } from "../../../features/inventory/inventory-log.slice";
import styles from "./inventory-cards.module.scss";
import { shouldShowTooltip } from "../../../common/shouldShowTooltip";

interface TransactionCardProps {
  item: InventoryTransaction;
  onRowClick?: (item: InventoryTransaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ item, onRowClick }) => {
  const variantLabel = (item.item?.variant_name && item.item?.unit)
    ? `${item.item.variant_name} ${item.item.unit}`
    : null;

  const fullTitle = `${item.item.name}${variantLabel ? ` (${variantLabel})` : ""}`;
  return (
    <div
      className={styles.transactionCard}
      onClick={() => onRowClick?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onRowClick?.(item);
      }}
    >

      <Box
        p={2}
        borderBottom="1px solid"
        borderColor="divider"
        sx={{ minWidth: 0, width: "100%", overflow: "hidden", boxSizing: "border-box" }}
      >
        <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
          <Tooltip
            title={fullTitle}
            disableHoverListener={!shouldShowTooltip(fullTitle, "250px")}
            arrow
            placement="top"
            enterDelay={200}
            leaveDelay={0}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="secondary.900"
              sx={{
                mb: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              {fullTitle || "-"}
            </Typography>
          </Tooltip>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center">
            <Typography component="span" variant="paragraphXs" fontWeight="semiBold" color="secondary.500"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5, mr: 1 }}>
              Ordered On:
            </Typography>
            <Typography component="span" variant="paragraphMd" color="secondary.800">
              {item.ordered_date ? dayjs(item.ordered_date).format("MMM DD, YYYY") : "N/A"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography component="span" variant="paragraphXs" fontWeight="semiBold" color="secondary.500"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5, mr: 1 }}>
              Received On:
            </Typography>
            <Typography component="span" variant="paragraphSm" color="secondary.800">
              {item.received_date ? dayjs(item.received_date).format("MMM DD, YYYY") : "N/A"}
            </Typography>
          </Box>
        </Box>
      </Box>


      <div className={styles.transactionCardBody}>
        <div className={styles.transactionField}>
          <Typography variant="paragraphXs" fontWeight="semiBold" color="secondary.500"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Ordered Quantity</Typography>
          <Typography variant="paragraphMd" fontWeight="semiBold" color="secondary.800">
            {item.ordered_quantity}
          </Typography>
        </div>
        <div className={styles.transactionFieldRight}>
          <Typography variant="paragraphXs" fontWeight="semiBold" color="secondary.500"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Received Quantity</Typography>
          <Typography variant="paragraphMd" fontWeight="bold" color="primary.700">
            {item.received_quantity}
          </Typography>
        </div>
        <div className={styles.transactionField}>
          <Typography variant="paragraphXs" fontWeight="semiBold" color="secondary.500"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Damaged/Returned</Typography>
          <Typography variant="paragraphMd" fontWeight="semiBold" color="error.main">
            {item.damaged_quantity} / {item.returned_quantity}
          </Typography>
        </div>
        <div className={styles.transactionFieldRight}>
          <Typography variant="paragraphXs" fontWeight="semiBold" color="secondary.500"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Bill Amount</Typography>
          <Typography variant="paragraphLg" fontWeight="semiBold" color="secondary.800">
            ₹{parseFloat(item.bill_amount || "0").toFixed(0)}
          </Typography>
        </div>
      </div>
    </div>
  );
};
