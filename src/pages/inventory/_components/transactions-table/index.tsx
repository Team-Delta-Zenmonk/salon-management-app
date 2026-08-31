import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import { Loader2, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../../../components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";

import type { InventoryTransaction } from "../../../../features/inventory/inventory-log.slice";
import { TransactionCard } from "../transaction-card";
import { shouldShowTooltip } from "../../../../common/shouldShowTooltip";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

const TransactionTableRow: React.FC<{
  item: InventoryTransaction;
  onRowClick?: (item: InventoryTransaction) => void;
}> = ({ item, onRowClick }) => {
  const [nameTooltipOpen, setNameTooltipOpen] = useState(false);
  const [variantTooltipOpen, setVariantTooltipOpen] = useState(false);

  const variantText = (item.item?.variant_name && item.item?.unit)
    ? `${item.item.variant_name} ${item.item.unit}`
    : "-";

  return (
    <TableRow
      className={`group ${onRowClick ? "cursor-pointer" : "cursor-default"} border-b border-border/30 odd:bg-transparent even:bg-muted/[0.06] dark:even:bg-muted/[0.03] hover:bg-muted/20 dark:hover:bg-muted/15 transition-colors duration-150`}
      onClick={() => onRowClick?.(item)}
    >
      <TableCell className="w-[220px] p-4 border-b border-border/30">
        <TooltipProvider>
          <Tooltip open={nameTooltipOpen} onOpenChange={setNameTooltipOpen}>
            <TooltipTrigger className="text-left max-w-full">
              <div
                onMouseEnter={(e) => {
                  if (shouldShowTooltip(e.currentTarget)) setNameTooltipOpen(true);
                }}
                onMouseLeave={() => setNameTooltipOpen(false)}
                className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-foreground capitalize"
              >
                {item.item.name}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{item.item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="w-[120px] p-4 text-center border-b border-border/30">
        <TooltipProvider>
          <Tooltip open={variantTooltipOpen} onOpenChange={setVariantTooltipOpen}>
            <TooltipTrigger className="text-center mx-auto max-w-full">
              <div
                onMouseEnter={(e) => {
                  if (variantText !== "-" && shouldShowTooltip(e.currentTarget)) setVariantTooltipOpen(true);
                }}
                onMouseLeave={() => setVariantTooltipOpen(false)}
                className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs font-semibold uppercase text-center"
              >
                {variantText}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{variantText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="w-[130px] text-center text-xs font-medium text-foreground/80 p-4 border-b border-border/30">
        {item.ordered_date ? dayjs(item.ordered_date).format("MMM DD, YYYY") : "N/A"}
      </TableCell>
      <TableCell className="w-[130px] text-center text-xs font-medium text-foreground/80 p-4 border-b border-border/30">
        {item.received_date ? dayjs(item.received_date).format("MMM DD, YYYY") : "N/A"}
      </TableCell>
      <TableCell className="text-center w-[100px] text-xs font-semibold text-foreground/80 p-4 border-b border-border/30">
        {item.ordered_quantity}
      </TableCell>
      <TableCell className={`text-center w-[100px] text-xs p-4 border-b border-border/30 ${
        item.received_quantity > 0 
          ? "font-bold text-emerald-600 dark:text-emerald-400" 
          : "font-medium text-muted-foreground/60"
      }`}>
        {item.received_quantity}
      </TableCell>
      <TableCell className={`text-center w-[100px] text-xs p-4 border-b border-border/30 ${
        item.damaged_quantity > 0 
          ? "font-bold text-destructive" 
          : "font-medium text-muted-foreground/60"
      }`}>
        {item.damaged_quantity}
      </TableCell>
      <TableCell className={`text-center w-[100px] text-xs p-4 border-b border-border/30 ${
        item.returned_quantity > 0 
          ? "font-bold text-amber-600 dark:text-amber-500" 
          : "font-medium text-muted-foreground/60"
      }`}>
        {item.returned_quantity}
      </TableCell>
      <TableCell className={`text-center w-[120px] text-sm p-4 border-b border-border/30 ${
        Number.parseFloat(item.bill_amount || "0") > 0
          ? "font-extrabold text-foreground"
          : "font-medium text-muted-foreground/50"
      }`}>
        ₹{Number.parseFloat(item.bill_amount || "0").toLocaleString(undefined, { minimumFractionDigits: 0 })}
      </TableCell>
    </TableRow>
  );
};

interface TransactionsTableProps {
  data: InventoryTransaction[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (event: unknown, newPage: number) => void;
  loading: boolean;
  onRowClick?: (item: InventoryTransaction) => void;
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
  const totalPages = Math.ceil(total / limit);

  if (loading && displayData.length === 0) {
    if (!isMobile) {
      return (
        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md overflow-hidden animate-pulse min-h-[200px]">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow>
                <TableHead className="w-[220px] p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Product Name</TableHead>
                <TableHead className="w-[120px] text-center p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Variant</TableHead>
                <TableHead className="w-[130px] text-center p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Ordered On</TableHead>
                <TableHead className="w-[130px] text-center p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Received On</TableHead>
                <TableHead className="w-[100px] text-center p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Ordered Qty</TableHead>
                <TableHead className="w-[100px] text-center p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Received Qty</TableHead>
                <TableHead className="w-[100px] text-center p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Damaged Qty</TableHead>
                <TableHead className="w-[100px] text-center p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Returned Qty</TableHead>
                <TableHead className="w-[120px] text-center p-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Bill Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="p-4"><div className="h-4 bg-foreground/10 rounded w-[160px]" /></TableCell>
                  <TableCell className="p-4 text-center"><div className="h-4 bg-foreground/10 rounded w-[60px] mx-auto" /></TableCell>
                  <TableCell className="p-4 text-center"><div className="h-4 bg-foreground/10 rounded w-[90px] mx-auto" /></TableCell>
                  <TableCell className="p-4 text-center"><div className="h-4 bg-foreground/10 rounded w-[90px] mx-auto" /></TableCell>
                  <TableCell className="p-4 text-center"><div className="h-4 bg-foreground/10 rounded w-[40px] mx-auto" /></TableCell>
                  <TableCell className="p-4 text-center"><div className="h-4 bg-foreground/10 rounded w-[40px] mx-auto" /></TableCell>
                  <TableCell className="p-4 text-center"><div className="h-4 bg-foreground/10 rounded w-[40px] mx-auto" /></TableCell>
                  <TableCell className="p-4 text-center"><div className="h-4 bg-foreground/10 rounded w-[40px] mx-auto" /></TableCell>
                  <TableCell className="p-4 text-center"><div className="h-4 bg-foreground/10 rounded w-[60px] mx-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card/60 border border-border/50 rounded-2xl p-4 animate-pulse space-y-4">
              <div className="h-5 bg-foreground/10 rounded w-2/3" />
              <div className="flex justify-between">
                <div className="h-3.5 bg-foreground/10 rounded w-[80px]" />
                <div className="h-3.5 bg-foreground/10 rounded w-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
                <div className="h-8 bg-foreground/10 rounded w-full" />
                <div className="h-8 bg-foreground/10 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <div>
      {!isMobile && (
        <>
          <div className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 mb-6 min-h-[200px]">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border/50">
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[220px] font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Product Name</TableHead>
                  <TableHead className="w-[120px] text-center font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Variant</TableHead>
                  <TableHead className="w-[130px] text-center font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Ordered On</TableHead>
                  <TableHead className="w-[130px] text-center font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Received On</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Ordered Qty</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Received Qty</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Damaged Qty</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Returned Qty</TableHead>
                  <TableHead className="w-[120px] text-center font-bold text-[10px] tracking-wider text-muted-foreground uppercase p-4 border-b border-border/50">Bill Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item) => (
                  <TransactionTableRow key={item.uuid} item={item} onRowClick={onRowClick} />
                ))}
                {displayData.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={9} className="h-[280px] text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <ClipboardList className="h-9 w-9 text-muted-foreground/40" />
                        <p className="text-sm font-semibold text-muted-foreground">No logs or transactions found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
              </div>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => page > 1 && onPageChange(null, page - 2)}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer rounded-full font-semibold"}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => page < totalPages && onPageChange(null, page)}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer rounded-full font-semibold"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {isMobile && (
        <div className="w-full max-w-full overflow-hidden min-w-0 block">
          <InfiniteScroll
            dataLength={displayData.length}
            next={fetchMore}
            hasMore={hasMore}
            scrollableTarget="inventoryScrollableDiv"
            style={{ width: "100%", overflow: "visible" }}
            loader={
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }
            endMessage={
              !hasMore && displayData.length > 0 ? (
                <div className="text-center py-6">
                  <span className="text-sm text-muted-foreground font-semibold">✨ All transaction logs loaded</span>
                </div>
              ) : null
            }
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-4"
            >
              {displayData.map((item) => (
                <motion.div variants={rowVariants} key={item.uuid}>
                  <TransactionCard item={item} onRowClick={onRowClick} />
                </motion.div>
              ))}
              {displayData.length === 0 && (
                <div className="bg-card/40 border border-dashed border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-muted-foreground/45 mb-2" />
                  <span className="text-sm font-semibold text-muted-foreground">No logs found.</span>
                </div>
              )}
            </motion.div>
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};

