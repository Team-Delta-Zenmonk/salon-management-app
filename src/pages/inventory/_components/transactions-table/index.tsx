import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import type { InventoryTransaction } from "../../../../features/inventory/inventory-log.slice";
import styles from "../inventory-cards.module.scss";
import { TransactionCard } from "../transaction-card";
import { shouldShowTooltip } from "../../../../common/shouldShowTooltip";
import { DataTable, type DataTableColumn } from "../../../../components/data-table";

const TooltipCell: React.FC<{ text: string; maxLength?: number }> = ({ text, maxLength }) => {
  const [open, setOpen] = useState(false);
  const isTruncated = maxLength && text.length > maxLength;
  const displayText = isTruncated ? `${text.substring(0, maxLength)}...` : text;

  return (
    <Tooltip
      title={text}
      open={open}
      onClose={() => setOpen(false)}
      disableHoverListener
      arrow
      placement="top"
    >
      <Box
        onMouseEnter={(e) => {
          if (text !== "-" && (isTruncated || shouldShowTooltip(e.currentTarget))) setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: 600,
        }}
      >
        {displayText}
      </Box>
    </Tooltip>
  );
};

const transactionColumns: DataTableColumn<InventoryTransaction>[] = [
  {
    key: "product_name",
    label: "PRODUCT NAME",
    width: "16%",
    sticky: true,
    truncate: true,
    render: (item) => <TooltipCell text={item.item.name} maxLength={20} />,
  },
  {
    key: "variant",
    label: "VARIANT",
    width: "12%",
    truncate: true,
    render: (item) => {
      const text =
        item.item?.variant_name && item.item?.unit
          ? `${item.item.variant_name} ${item.item.unit}`
          : "-";
      return <TooltipCell text={text} />;
    },
  },
  {
    key: "ordered_on",
    label: "ORDERED ON",
    width: "11%",
    render: (item) => (
      <Typography variant="body2" className="text-[var(--text-primary)]">
        {item.ordered_date ? dayjs(item.ordered_date).format("MMM DD, YYYY") : "N/A"}
      </Typography>
    ),
  },
  {
    key: "received_on",
    label: "RECEIVED ON",
    width: "11%",
    render: (item) => (
      <Typography variant="body2" className="text-[var(--text-primary)]">
        {item.received_date ? dayjs(item.received_date).format("MMM DD, YYYY") : "N/A"}
      </Typography>
    ),
  },
  {
    key: "ordered_quantity",
    label: "ORDERED QTY",
    width: "10%",
    align: "right",
    render: (item) => (
      <Typography variant="body2" fontWeight="600" className="text-[var(--text-primary)]">
        {item.ordered_quantity}
      </Typography>
    ),
  },
  {
    key: "received_quantity",
    label: "RECEIVED QTY",
    width: "10%",
    align: "right",
    render: (item) => (
      <Typography variant="body2" fontWeight="bold" className="text-[var(--primary)]">
        {item.received_quantity}
      </Typography>
    ),
  },
  {
    key: "damaged_quantity",
    label: "DAMAGED QTY",
    width: "10%",
    align: "right",
    render: (item) => (
      <Typography variant="body2" fontWeight="600" className="text-[var(--text-primary)]">
        {item.damaged_quantity}
      </Typography>
    ),
  },
  {
    key: "returned_quantity",
    label: "RETURNED QTY",
    width: "10%",
    align: "right",
    render: (item) => (
      <Typography variant="body2" fontWeight="600" className="text-[var(--text-primary)]">
        {item.returned_quantity}
      </Typography>
    ),
  },
  {
    key: "bill_amount",
    label: "BILL AMOUNT",
    width: "10%",
    align: "right",
    render: (item) => (
      <Typography variant="body2" fontWeight="bold" className="text-[var(--text-primary)]">
        ₹{Number.parseFloat(item.bill_amount || "0").toFixed(2)}
      </Typography>
    ),
  },
];

interface TransactionsTableProps {
  data: InventoryTransaction[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (event: unknown, newPage: number) => void;
  loading: boolean;
  onRowClick?: (item: any) => void;
  isMobile: boolean;
  hasMore: boolean;
  fetchMore: () => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  data,
  total,
  page,
  limit,
  onPageChange,
  loading,
  onRowClick,
  isMobile,
  hasMore,
  fetchMore,
}) => {
  const displayData = !isMobile ? data.slice((page - 1) * limit, page * limit) : data;

  if (isMobile) {
    if (loading && displayData.length === 0) {
      return (
        <div className={styles.loadingWrapper}>
          <CircularProgress />
        </div>
      );
    }

    return (
      <Box sx={{ width: "100%", maxWidth: "100%", overflow: "hidden", minWidth: 0, display: "block" }}>
        <InfiniteScroll
          dataLength={displayData.length}
          next={fetchMore}
          hasMore={hasMore}
          scrollableTarget="inventoryScrollableDiv"
          style={{ width: "100%", overflow: "visible" }}
          loader={
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          }
          endMessage={
            !hasMore && displayData.length > 0 ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="paragraphSm" color="text.secondary">
                  No more transactions to load
                </Typography>
              </Box>
            ) : null
          }
        >
          <div className={styles.cardList}>
            {displayData.map((item) => (
              <TransactionCard key={item.uuid} item={item} onRowClick={onRowClick} />
            ))}
            {displayData.length === 0 && (
              <div className={styles.emptyState}>
                <Typography variant="paragraphMd" color="text.secondary">
                  No transactions found.
                </Typography>
              </div>
            )}
          </div>
        </InfiniteScroll>
      </Box>
    );
  }

  return (
    <DataTable<InventoryTransaction>
      title="Inventory Logs"
      badge={total > 0 ? `${total} total transactions` : undefined}
      columns={transactionColumns}
      data={displayData}
      getRowKey={(row) => row.uuid}
      loading={loading}
      emptyMessage="No transactions found."
      total={total}
      page={page}
      limit={limit}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
      maxHeight="calc(100vh - 450px)"
    />
  );
};
