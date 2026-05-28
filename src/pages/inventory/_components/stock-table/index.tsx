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

const StockProgressBar = ({
  current,
  min,
  errorColor,
  successColor,
}: {
  current: number;
  min?: number;
  errorColor: string;
  successColor: string;
}) => {
  const isLow = min && min > 0 ? current <= min : current <= 0;
  const color = isLow ? errorColor : successColor;
  const max = min && min > 0 ? min * 2 : Math.max(current, 10);
  const percentage = Math.max(2, Math.min(100, (current / max) * 100));

  return (
    <Box sx={{ width: 60, height: 10, bgcolor: "secondary.100", borderRadius: 1, overflow: "hidden", mr: 1 }}>
      <Box
        sx={{
          width: `${percentage}%`,
          height: "100%",
          bgcolor: color,
          borderRadius: 1,
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </Box>
  );
};

interface StockTableProps {
  data: InventoryItem[];
  loading: boolean;
  onSuccess: () => void;
  hasMore: boolean;
  fetchMore: () => void;
}

/** Wrapper that uses the controlled tooltip pattern for text overflow */
const OverflowTooltipText: React.FC<{
  text: string;
  typographyProps?: Record<string, any>;
}> = ({ text, typographyProps = {} }) => {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip title={text} open={open} onClose={() => setOpen(false)} disableHoverListener>
      <Typography
        onMouseEnter={(e) => {
          if (shouldShowTooltip(e.currentTarget)) setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        {...typographyProps}
      >
        {text}
      </Typography>
    </Tooltip>
  );
};

/** Wrapper for Chip with overflow tooltip */
const OverflowTooltipChip: React.FC<{
  label: string;
  chipSx?: Record<string, any>;
}> = ({ label, chipSx = {} }) => {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip title={label} open={open} onClose={() => setOpen(false)} disableHoverListener>
      <Chip
        onMouseEnter={(e) => {
          const labelEl = e.currentTarget.querySelector('.MuiChip-label') as HTMLElement;
          if (shouldShowTooltip(labelEl)) setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        label={label}
        size="small"
        sx={chipSx}
      />
    </Tooltip>
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
        scrollableTarget="inventoryScrollDiv"
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
          {data.map((item) => {
            const brandLabel = item.brand || "";
            const categoryLabel = item.category?.name || "";
            const variantLabel = [item.variant_name, item.unit].filter(Boolean).join(" ");

            return (
              <div
                key={item.uuid}
                className={styles.stockCard}
                style={{ cursor: "default" }}
                tabIndex={0}
              >
                <div className={styles.stockCardInner}>
                  <Avatar
                    src={item.logo || ""}
                    alt={item.name}
                    className={styles.stockAvatar}
                    sx={{ width: 56, height: 56 }}
                  />

                  <div className={styles.stockInfo} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <Box sx={{ minWidth: 0, width: "100%", display: "flex", flexDirection: "column" }}>
                      <OverflowTooltipText
                        text={item.name}
                        typographyProps={{
                          variant: "h6",
                          fontWeight: "bold",
                          color: "secondary.900",
                          sx: {
                            textTransform: "capitalize",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            lineHeight: 1.2,
                            width: "100%",
                          },
                        }}
                      />
                      {brandLabel && (
                        <OverflowTooltipText
                          text={brandLabel}
                          typographyProps={{
                            variant: "paragraphSm",
                            color: "secondary.500",
                            fontWeight: "semiBold",
                            sx: {
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              mt: "2px",
                              width: "100%",
                            },
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", width: "100%", mt: 1 }}>
                      {categoryLabel && (
                        <OverflowTooltipChip
                          label={categoryLabel}
                          chipSx={{
                            bgcolor: "info.50",
                            color: "info.700",
                            typography: "paragraphTable",
                            maxWidth: "120px",
                            "& .MuiChip-label": {
                              px: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      )}
                      {variantLabel && (
                        <OverflowTooltipChip
                          label={variantLabel}
                          chipSx={{
                            bgcolor: "info.50",
                            color: "info.700",
                            typography: "paragraphSm",
                            maxWidth: "100px",
                            "& .MuiChip-label": {
                              px: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      )}
                    </Box>
                  </div>
                  <IconButton
                    size="medium"
                    onClick={(e) => handleEditClick(e, item)}
                    sx={{ alignSelf: "flex-start", bgcolor: "common.white" }}
                  >
                    <EditOutlinedIcon fontSize="medium" sx={{ color: "primary.900" }} />
                  </IconButton>
                </div>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  px={3}
                  py={2}
                  borderTop="1px solid"
                  borderColor="divider"
                  bgcolor="background.default"
                >
                  <Box>
                    <Typography variant="paragraphSm" color="secondary.500" fontWeight="semiBold" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }} display="block">
                      Min Stock
                    </Typography>
                    <Typography variant="paragraphLg" color="error.600" fontWeight="bold">
                      {item.min_stock_level || "-"}
                    </Typography>
                  </Box>

                  <Box textAlign="center">
                    <Typography variant="paragraphSm" color="secondary.500" fontWeight="semiBold" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }} display="block">
                      Price
                    </Typography>
                    <Typography variant="paragraphLg" color="primary.900" fontWeight="bold">
                      ₹{Number(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>

                  <Box textAlign="right" display="flex" flexDirection="column" alignItems="flex-end">
                    <Typography variant="paragraphSm" color="secondary.500" fontWeight="semiBold" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }} display="block">
                      In Stock
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1.5}>
                      <StockProgressBar
                        current={item.current_stock}
                        min={item.min_stock_level}
                        errorColor={theme.palette.error.main}
                        successColor={theme.palette.success.main}
                      />
                      <Box display="flex" alignItems="baseline" gap={0.5}>
                        <Typography variant="h4" fontWeight="bold" color={getStockColor(item)}>
                          {item.current_stock}
                        </Typography>
                        <Typography variant="paragraphSm" color="secondary.500" fontWeight="semiBold" sx={{ textTransform: "uppercase" }}>
                          Units
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDecreaseClick(e, item)}
                        sx={{ ml: 1, bgcolor: "common.white" }}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" sx={{ color: "primary.900" }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </div>
            );
          })}

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
