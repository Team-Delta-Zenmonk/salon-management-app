import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";
import { DecreaseStockModal } from "../decrease-stock-modal";
import { EditProductModal } from "../edit-product-modal";
import { shouldShowTooltip } from "../../../../common/shouldShowTooltip";
import styles from "../inventory-cards.module.scss";

interface StockTableProps {
  data: InventoryItem[];
  loading: boolean;
  onSuccess: () => void;
  hasMore: boolean;
  fetchMore: () => void;
}


const StockCard: React.FC<{
  item: InventoryItem;
  onDecreaseClick: (e: React.MouseEvent, item: InventoryItem) => void;
  onEditClick: (e: React.MouseEvent, item: InventoryItem) => void;
  getStockColor: (item: InventoryItem) => string;
  theme: any;
}> = ({ item, onDecreaseClick, onEditClick, getStockColor }) => {
  const brandLabel = item.brand || "";
  const categoryLabel = item.category?.name || "";
  const variantLabel = [item.variant_name, item.unit].filter(Boolean).join(" ");
  const [titleTooltipOpen, setTitleTooltipOpen] = useState(false);
  const [brandTooltipOpen, setBrandTooltipOpen] = useState(false);

  return (
    <Box className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[20px] p-6 shadow-sm flex flex-col h-full min-w-0">
      <Box className="flex items-center gap-3 mb-3">
        <Avatar
          src={item.logo || undefined}
          alt={item.name}
          sx={{ width: 48, height: 48, backgroundColor: "var(--surface-muted)", color: "var(--text-primary)", fontWeight: "bold" }}
        >
          {!item.logo && item.name ? item.name.charAt(0).toUpperCase() : null}
        </Avatar>
        <Box className="flex-1 min-w-0">
          <Tooltip
            title={item.name}
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
              fontWeight="700"
              className="text-[var(--text-primary)] capitalize truncate block w-full text-lg"
            >
              {item.name}
            </Typography>
          </Tooltip>
          {brandLabel && (
            <Tooltip
              title={brandLabel}
              open={brandTooltipOpen}
              onClose={() => setBrandTooltipOpen(false)}
              disableHoverListener
              arrow
              placement="top"
            >
              <Typography
                variant="caption"
                onMouseEnter={(e) => {
                  if (shouldShowTooltip(e.currentTarget)) setBrandTooltipOpen(true);
                }}
                onMouseLeave={() => setBrandTooltipOpen(false)}
                className="text-[var(--text-muted)] truncate block w-full uppercase tracking-wider mt-0.5"
              >
                {brandLabel}
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box className="flex-1 min-w-0">
        <Typography className="text-[var(--text-muted)] text-sm mb-3 truncate block w-full">
          {categoryLabel} {variantLabel ? ` (${variantLabel})` : ''}
        </Typography>

        <Box className="flex justify-between items-start mt-4 mb-2">
          <Box>
            <Typography variant="caption" className="text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">In Stock</Typography>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: getStockColor(item) }}>
              {item.current_stock}
            </Typography>
          </Box>
          <Box className="text-center">
            <Typography variant="caption" className="text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">Min Stock</Typography>
            <Typography variant="subtitle1" fontWeight="bold" className="text-[var(--error-600)]">
              {item.min_stock_level || "-"}
            </Typography>
          </Box>
          <Box className="text-right">
            <Typography variant="caption" className="text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">Price</Typography>
            <Typography variant="subtitle1" fontWeight="bold" className="text-[var(--text-primary)]">
              ₹{Number(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="flex justify-between items-center mt-5 pt-4 border-t border-dashed border-[var(--border-subtle)]">
        <Typography variant="caption" className="text-[var(--text-muted)] capitalize">
          {item.item_type || "Product"}
        </Typography>
        <Box className="flex gap-1">
          <IconButton size="small" onClick={(e) => onEditClick(e, item)} className="text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-50)] border border-[var(--border-subtle)] rounded-xl" sx={{ width: 34, height: 34 }}>
            <EditOutlinedIcon sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton size="small" onClick={(e) => onDecreaseClick(e, item)} className="text-[var(--text-muted)] hover:text-[var(--error-600)] hover:bg-[var(--error-50)] border border-[var(--border-subtle)] rounded-xl" sx={{ width: 34, height: 34 }}>
            <RemoveCircleOutlineIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export const StockTable: React.FC<StockTableProps> = ({
  data,
  loading,
  onSuccess,
  hasMore,
  fetchMore,
}) => {
  const theme = useTheme();
  const [decreaseModalOpen, setDecreaseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const handleDecreaseClick = (e: React.MouseEvent, item: InventoryItem) => {
    e.stopPropagation();
    setSelectedItem(item);
    setDecreaseModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, item: InventoryItem) => {
    e.stopPropagation();
    setEditItem(item);
    setEditModalOpen(true);
  };

  const getStockColor = (item: InventoryItem) => {
    if (item.current_stock <= 0) return theme.palette.error.main;
    if (item.min_stock_level && item.current_stock <= item.min_stock_level) {
      return theme.palette.error.main;
    }
    return theme.palette.success.main;
  };

  if (loading && data.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Box>
      <InfiniteScroll
        dataLength={data.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          <Box className="flex justify-center py-4">
            <CircularProgress size={24} />
          </Box>
        }
        scrollableTarget="inventoryScrollableDiv"
        endMessage={
          !hasMore && data.length > 0 ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="paragraphSm" color="text.secondary">
                No more products to load
              </Typography>
            </Box>
          ) : null
        }
      >
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={2}>
          {data.map((item) => (
            <StockCard
              key={item.uuid}
              item={item}
              onDecreaseClick={handleDecreaseClick}
              onEditClick={handleEditClick}
              getStockColor={getStockColor}
              theme={theme}
            />
          ))}

          {data.length === 0 && (
            <Box gridColumn="1 / -1" textAlign="center" py={4}>
              <Typography variant="paragraphMd" color="text.secondary">
                No stock data found.
              </Typography>
            </Box>
          )}
        </Box>
      </InfiniteScroll>
      <DecreaseStockModal
        open={decreaseModalOpen}
        onClose={() => setDecreaseModalOpen(false)}
        inventoryItem={selectedItem}
        onSuccess={onSuccess}
      />
      <EditProductModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditItem(null);
        }}
        inventoryItem={editItem}
        onSuccess={onSuccess}
      />
    </Box>
  );
};
