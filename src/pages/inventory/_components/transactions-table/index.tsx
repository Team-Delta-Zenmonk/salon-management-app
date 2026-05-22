import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
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

  if (loading && data.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <CircularProgress />
      </div>
    );
  }
  return (
    <Box>
      {!isMobile && (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "8px" }}>
            <Table sx={{ minWidth: 850, tableLayout: 'fixed' }} aria-label="transactions table">
              <TableHead sx={{ backgroundColor: "background.default" }}>
                <TableRow>
                  <TableCell sx={{ width: 220, position: 'sticky', left: 0, backgroundColor: 'background.default', zIndex: 2 }}>Product Name</TableCell>
                  <TableCell sx={{ width: 120 }}>Variant</TableCell>
                  <TableCell sx={{ width: 130 }}>Ordered On</TableCell>
                  <TableCell sx={{ width: 130 }}>Received On</TableCell>
                  <TableCell align="right" sx={{ width: 100 }}>Ordered Quantity</TableCell>
                  <TableCell align="right" sx={{ width: 100 }}>Received Quantity</TableCell>
                  <TableCell align="right" sx={{ width: 100 }}>Damaged Quantity</TableCell>
                  <TableCell align="right" sx={{ width: 100 }}>Returned Quantity</TableCell>
                  <TableCell align="right" sx={{ width: 120 }}>Bill Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow
                    key={item.uuid}
                    hover
                    onClick={() => onRowClick?.(item)}
                    sx={{ cursor: onRowClick ? "pointer" : "default" }}
                  >
                    <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                      <Tooltip
                        title={item.item.name}
                        disableHoverListener={!shouldShowTooltip(item.item.name, "200px")}
                        arrow
                        placement="top"
                      >
                        <Box
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: "semiBold"
                          }}
                        >
                          {item.item.name}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const variantText = (item.item?.variant_name && item.item?.unit)
                          ? `${item.item.variant_name} ${item.item.unit}`
                          : "-";
                        return (
                          <Tooltip
                            title={variantText}
                            disableHoverListener={variantText === "-" || !shouldShowTooltip(variantText, "100px")}
                            arrow
                            placement="top"
                          >
                            <Box
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {variantText}
                            </Box>
                          </Tooltip>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="paragraphMd">
                        {item.ordered_date ? dayjs(item.ordered_date).format("MMM DD, YYYY") : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="paragraphMd">
                        {item.received_date ? dayjs(item.received_date).format("MMM DD, YYYY") : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="paragraphMd">{item.ordered_quantity}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="paragraphMd">{item.received_quantity}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="paragraphMd">{item.damaged_quantity}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="paragraphMd">{item.returned_quantity}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="paragraphMd">₹{Number.parseFloat(item.bill_amount || "0").toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <Typography variant="paragraphMd" color="text.secondary">
                        No transactions found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            onPageChange={onPageChange}
            rowsPerPage={limit}
            rowsPerPageOptions={[limit]}
          />
        </>
      )}

      {isMobile && (
        <Box sx={{ width: "100%", maxWidth: "100%", overflow: "hidden", minWidth: 0, display: "block" }}>
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMore}
            hasMore={hasMore}
            scrollableTarget="logScrollDiv"
            style={{ width: "100%", overflow: "visible" }}
            loader={
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            }
            endMessage={
              !hasMore && data.length > 0 ? (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="paragraphSm" color="text.secondary">
                    No more transactions to load
                  </Typography>
                </Box>
              ) : null
            }
          >
            <div className={styles.cardList}>
              {data.map((item) => (
                <TransactionCard key={item.uuid} item={item} onRowClick={onRowClick} />
              ))}
              {data.length === 0 && (
                <div className={styles.emptyState}>
                  <Typography variant="paragraphMd" color="text.secondary">
                    No transactions found.
                  </Typography>
                </div>
              )}
            </div>
          </InfiniteScroll>
        </Box>
      )}
    </Box>
  );
};
