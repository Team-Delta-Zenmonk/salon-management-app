import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Edit2Icon, MinusCircleIcon, Loader2, Package } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";
import { DecreaseStockModal } from "../decrease-stock-modal";
import { EditProductModal } from "../edit-product-modal";
import { shouldShowTooltip } from "../../../../common/shouldShowTooltip";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 26 } },
};

const StockProgressBar = ({
  current,
  min,
}: {
  current: number;
  min?: number;
}) => {
  const isOut = current <= 0;
  const isLow = !isOut && min && min > 0 ? current <= min : false;
  const colorClass = isOut 
    ? "bg-destructive/80" 
    : isLow 
      ? "bg-amber-500/80" 
      : "bg-emerald-500/80";
  const max = min && min > 0 ? min * 2 : Math.max(current, 10);
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full h-1.5 bg-muted/65 dark:bg-muted/30 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

interface StockTableProps {
  data: InventoryItem[];
  loading: boolean;
  onSuccess: () => void;
  hasMore: boolean;
  fetchMore: () => void;
}

const getStockStatus = (item: InventoryItem) => {
  if (item.current_stock <= 0) {
    return { label: "Out of Stock", color: "bg-destructive/10 text-destructive dark:text-rose-400 border-none" };
  }
  if (item.min_stock_level && item.current_stock <= item.min_stock_level) {
    return { label: "Low Stock", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none" };
  }
  return { label: "In Stock", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none" };
};

const StockCard: React.FC<{
  item: InventoryItem;
  onDecreaseClick: (e: React.MouseEvent, item: InventoryItem) => void;
  onEditClick: (e: React.MouseEvent, item: InventoryItem) => void;
}> = ({ item, onDecreaseClick, onEditClick }) => {
  const [nameTooltipOpen, setNameTooltipOpen] = useState(false);
  const [brandTooltipOpen, setBrandTooltipOpen] = useState(false);
  const [categoryTooltipOpen, setCategoryTooltipOpen] = useState(false);

  const brandLabel = item.brand || "";
  const categoryLabel = item.category?.name || "";
  const variantLabel = [item.variant_name, item.unit].filter(Boolean).join(" ");
  const status = getStockStatus(item);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14 rounded-2xl border border-border/50 shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <AvatarImage src={item.logo || ""} alt={item.name} />
            <AvatarFallback className="rounded-2xl font-bold bg-primary/5 text-primary text-base">
              {item.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col min-w-0 w-full">
              <TooltipProvider>
                <Tooltip open={nameTooltipOpen} onOpenChange={setNameTooltipOpen}>
                  <TooltipTrigger className="text-left w-full">
                    <span
                      onMouseEnter={(e) => {
                        if (shouldShowTooltip(e.currentTarget)) setNameTooltipOpen(true);
                      }}
                      onMouseLeave={() => setNameTooltipOpen(false)}
                      className="font-bold text-lg text-foreground capitalize overflow-hidden text-ellipsis whitespace-nowrap leading-tight block w-full"
                    >
                      {item.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {brandLabel && (
                <TooltipProvider>
                  <Tooltip open={brandTooltipOpen} onOpenChange={setBrandTooltipOpen}>
                    <TooltipTrigger className="text-left w-full">
                      <span
                        onMouseEnter={(e) => {
                          if (shouldShowTooltip(e.currentTarget)) setBrandTooltipOpen(true);
                        }}
                        onMouseLeave={() => setBrandTooltipOpen(false)}
                        className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap mt-0.5 block w-full"
                      >
                        {brandLabel}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{brandLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="flex gap-1.5 flex-wrap w-full mt-2.5">
              <Badge className={status.color}>
                {status.label}
              </Badge>

              {categoryLabel && (
                <TooltipProvider>
                  <Tooltip open={categoryTooltipOpen} onOpenChange={setCategoryTooltipOpen}>
                    <TooltipTrigger>
                      <div onMouseEnter={() => setCategoryTooltipOpen(true)} onMouseLeave={() => setCategoryTooltipOpen(false)}>
                        <Badge variant="secondary" className="max-w-[100px] text-[10px] font-semibold uppercase tracking-wider bg-secondary/40 text-secondary-foreground">
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{categoryLabel}</span>
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{categoryLabel}</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}  
              {variantLabel && (
                <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider bg-muted/20 border-border/60 text-muted-foreground/80">
                  {variantLabel}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mt-5">
          <div className="flex justify-between items-baseline">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Stock</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-2xl font-extrabold tracking-tight ${
                  status.label === "Out of Stock" 
                    ? "text-destructive" 
                    : status.label === "Low Stock" 
                      ? "text-amber-500" 
                      : "text-emerald-500"
                }`}>
                  {item.current_stock}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{item.unit || "units"}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Min Stock Level</span>
              <span className="text-sm font-semibold text-foreground/80 mt-1">{item.min_stock_level || 0} {item.unit || "units"}</span>
            </div>
          </div>
          
          <StockProgressBar current={item.current_stock} min={item.min_stock_level} />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 mt-5 border-t border-border/25 relative">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Unit Price</span>
          <span className="text-sm font-extrabold text-foreground mt-0.5">
            ₹{Number(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => onDecreaseClick(e, item)}
            title="Decrease Stock"
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
          >
            <MinusCircleIcon className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => onEditClick(e, item)}
            title="Edit Product"
            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors cursor-pointer"
          >
            <Edit2Icon className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const StockTable: React.FC<StockTableProps> = ({
  data,
  loading,
  onSuccess,
  hasMore,
  fetchMore,
}) => {
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

  if (loading && data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[220px] gap-6 animate-pulse"
          >
            <div>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-foreground/10 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-5 bg-foreground/10 rounded w-2/3" />
                  <div className="h-3 bg-foreground/10 rounded w-1/3" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                <div className="h-6 bg-foreground/10 rounded-md w-16" />
                <div className="h-6 bg-foreground/10 rounded-md w-20" />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <div className="h-3 bg-foreground/10 rounded w-16" />
                <div className="h-3 bg-foreground/10 rounded w-16" />
              </div>
              <div className="h-1.5 bg-foreground/10 rounded-full w-full" />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border/40 mt-2">
              <div className="h-4 bg-foreground/10 rounded w-20" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-foreground/10 rounded-full" />
                <div className="h-8 w-8 bg-foreground/10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <InfiniteScroll
        dataLength={data.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }
        scrollableTarget="inventoryScrollableDiv"
        endMessage={
          !hasMore && data.length > 0 ? (
            <div className="text-center py-6">
              <span className="text-sm text-muted-foreground font-medium">
                ✨ All products loaded successfully
              </span>
            </div>
          ) : null
        }
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {data.map((item) => (
            <StockCard
              key={item.uuid}
              item={item}
              onDecreaseClick={handleDecreaseClick}
              onEditClick={handleEditClick}
            />
          ))}

          {data.length === 0 && (
            <div className="col-span-full bg-card/40 border border-dashed border-border/50 rounded-3xl p-12 flex flex-col items-center justify-center mt-2">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No products found</h3>
              <p className="text-muted-foreground text-sm text-center max-w-sm">
                We couldn't find any products in your inventory. Try adjusting your search filters or add a new stock entry.
              </p>
            </div>
          )}
        </motion.div>
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
    </div>
  );
};
