import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { ClipboardPlus, Package, AlertTriangle, XCircle, Coins, ClipboardList, ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { listInventoryItemsAction } from "../../features/inventory/list-inventory-items/list-inventory-items.action";
import { listInventoryLogsAction } from "../../features/inventory/list-inventory-logs/list-inventory-logs.action";
import { getInventoryLogAction } from "../../features/inventory/get-inventory-log/get-inventory-log.action";
import { StockTable } from "./_components/stock-table";
import { TransactionsTable } from "./_components/transactions-table";
import { LogTransactionModal } from "./_components/log-transaction-modal";
import { AddItemStepperModal } from "./_components/add-item-stepper-modal";
import { InventoryFilters } from "./_components/inventory-filters";
import { fetchItemCategoriesAction } from "../../features/inventory/list-inventory-items-category/list-inventory-items-category.action";
import type { InventoryTransaction } from "../../features/inventory/inventory-log.slice";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion } from "framer-motion";
import { listInventoryItemsService } from "../../features/inventory/list-inventory-items/list-inventory-items.service";
import type { InventoryItem } from "../../features/inventory/inventory-item.slice";
import EllipsisCell from "@/components/ellipse-cell";

const PAGE_LIMIT = 10;

interface MetricCardProps {
  label: string;
  icon: React.ElementType;
  value: React.ReactNode;
  isLoading?: boolean;
  accentBg: string;
  borderHover: string;
  iconColor: string;
  isText?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  icon: Icon,
  value,
  isLoading,
  accentBg,
  borderHover,
  iconColor,
  isText,
}) => {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden p-3 sm:p-4 bg-card/60 backdrop-blur-md flex flex-col justify-between rounded-2xl border border-border/50 shadow-sm animate-pulse w-[150px] min-h-[88px] sm:w-auto sm:min-h-0 shrink-0 snap-start mb-1">
        <div className="flex items-center justify-between gap-1">
          <div className="h-3 w-16 bg-muted/80 rounded" />
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted/80 rounded-lg shrink-0" />
        </div>
        <div className="h-5 sm:h-6 w-20 bg-muted/80 rounded mt-2" />
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden p-3 sm:p-4 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col justify-between rounded-2xl border border-border/50 shadow-sm hover:shadow-md ${borderHover} transition-all duration-300 w-[150px] min-h-[88px] sm:w-auto sm:min-h-0 shrink-0 snap-start mb-1`}
    >
      <div
        className={`absolute -right-4 -top-4 w-16 h-16 ${accentBg} rounded-full blur-xl transition-colors pointer-events-none`}
      />
      <div className="flex items-center justify-between relative z-10 gap-1">
        <span className="font-semibold text-[9px] sm:text-[10px] text-muted-foreground/80 uppercase tracking-wider truncate">
          {label}
        </span>
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 bg-background/50 rounded-lg flex items-center justify-center border border-border/50 ${iconColor} shrink-0`}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <div className="relative z-10">
        {isText ? (
          <EllipsisCell
            value={value as string}
            className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-wide leading-snug"
          />
        ) : (
          <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

const getSortParams = (sortValue: string) => {
  const sortMap: Record<string, { sort_by: string; sort_order?: "ASC" | "DESC" }> = {
    newest: { sort_by: "newest" },
    name_asc: { sort_by: "name", sort_order: "ASC" },
    name_desc: { sort_by: "name", sort_order: "DESC" },
    stock_high_low: { sort_by: "current_stock", sort_order: "DESC" },
    stock_low_high: { sort_by: "current_stock", sort_order: "ASC" },
    received_date_desc: { sort_by: "received_date", sort_order: "DESC" },
    received_date_asc: { sort_by: "received_date", sort_order: "ASC" },
    ordered_date_desc: { sort_by: "ordered_date", sort_order: "DESC" },
    ordered_date_asc: { sort_by: "ordered_date", sort_order: "ASC" },
    amount_high_low: { sort_by: "bill_amount", sort_order: "DESC" },
    amount_low_high: { sort_by: "bill_amount", sort_order: "ASC" },
  };
  return sortMap[sortValue] || {};
};

export default function Inventory() {
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    data: stockData,
    total: stockTotal,
    page: stockPage,
  } = useAppSelector((state) => state.inventoryItem);
  const {
    data: transactionData,
    total: transactionTotal,
    page: transactionPage,
  } = useAppSelector((state) => state.inventoryLog);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "stock" ? 1 : 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const [isLogTransactionOpen, setIsLogTransactionOpen] = useState(false);
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [selectedTransactionItem, setSelectedTransactionItem] = useState<InventoryTransaction | null>(null);

  const [returningToTransaction, setReturningToTransaction] = useState(false);
  const [createdItemForTransaction, setCreatedItemForTransaction] = useState<InventoryItem | null>(null);

  const [stockLoading, setStockLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const [sortBy, setSortBy] = useState<string>("newest");
  const [categoryUuid, setCategoryUuid] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");

  const [loadingLogUuid, setLoadingLogUuid] = useState<string | null>(null);
  const [allStockItems, setAllStockItems] = useState<InventoryItem[]>([]);
  const [allStockLoading, setAllStockLoading] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  const categories = useAppSelector((state) => state.itemsCategory.data) ?? [];

  const fetchAllStockItems = async () => {
    setAllStockLoading(true);
    try {
      const res = await listInventoryItemsService({ limit: 1000 });
      if (res && res.data) {
        setAllStockItems(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch all items for stats", e);
    } finally {
      setAllStockLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStockItems();
  }, [stockData]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchItemCategoriesAction({ limit: 100 }));
    }
  }, [dispatch, categories.length]);

  useEffect(() => {
    setStockLoading(true);
    dispatch(listInventoryItemsAction({
      page: 1,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
      ...getSortParams(sortBy),
      category_id: categoryUuid || undefined,
      item_type: itemType || undefined,
    })).finally(() => setStockLoading(false));
  }, [dispatch, debouncedSearch, sortBy, categoryUuid, itemType]);

  useEffect(() => {
    setTransactionLoading(true);
    dispatch(listInventoryLogsAction({
      page: 1,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
      ...getSortParams(sortBy),
    })).finally(() => setTransactionLoading(false));
  }, [dispatch, debouncedSearch, sortBy]);

  const fetchMoreStock = async () => {
    if (stockLoading) return;
    const nextPage = stockPage + 1;
    setStockLoading(true);
    try {
      await dispatch(listInventoryItemsAction({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        ...getSortParams(sortBy),
        category_id: categoryUuid || undefined,
        item_type: itemType || undefined,
      })).unwrap();
    } catch (error) {
      console.error("Error fetching more stock:", error);
    } finally {
      setStockLoading(false);
    }
  };

  const fetchMoreTransactions = async () => {
    if (transactionLoading) return;
    const nextPage = transactionPage + 1;
    setTransactionLoading(true);
    try {
      await dispatch(listInventoryLogsAction({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        ...getSortParams(sortBy),
      })).unwrap();
    } catch (error) {
      console.error("Error fetching more transactions:", error);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleTransactionPageChange = async (_event: unknown, newPage: number) => {
    if (transactionLoading) return;
    setTransactionLoading(true);
    try {
      await dispatch(listInventoryLogsAction({
        page: newPage + 1,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        ...getSortParams(sortBy),
      })).unwrap();
    } catch (error) {
      console.error("Error fetching transactions page:", error);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleTransactionLogged = async () => {
    setTransactionLoading(true);
    setStockLoading(true);
    try {
      await Promise.all([
        dispatch(listInventoryLogsAction({ page: 1, limit: PAGE_LIMIT, search: debouncedSearch, ...getSortParams(sortBy) })).unwrap(),
        dispatch(listInventoryItemsAction({ page: 1, limit: PAGE_LIMIT, search: debouncedSearch, ...getSortParams(sortBy), category_id: categoryUuid || undefined, item_type: itemType || undefined })).unwrap(),
      ]);
      fetchAllStockItems();
    } catch (e) {
      console.error(e);
    } finally {
      setTransactionLoading(false);
      setStockLoading(false);
    }
  };

  const refreshStock = async () => {
    setStockLoading(true);
    try {
      await dispatch(listInventoryItemsAction({ page: 1, limit: PAGE_LIMIT })).unwrap();
      fetchAllStockItems();
    } finally {
      setStockLoading(false);
    }
  };

  const handleTransactionRowClick = async (item: InventoryTransaction) => {
    try {
      setLoadingLogUuid(item.uuid);
      const freshData = await dispatch(getInventoryLogAction(item.uuid)).unwrap();
      setSelectedTransactionItem(freshData.data || freshData);
    } catch {
      setSelectedTransactionItem(item);
    } finally {
      setLoadingLogUuid(null);
    }
    setIsLogTransactionOpen(true);
  };

  const stockHasMore = Number(stockTotal) > 0 && stockData.length < Number(stockTotal);
  const transactionHasMore = Number(transactionTotal) > 0 && transactionData.length < Number(transactionTotal);

  const totalProducts = allStockItems.length;
  const lowStockCount = allStockItems.filter(
    (item) => item.current_stock > 0 && item.min_stock_level && item.current_stock <= item.min_stock_level
  ).length;
  const outOfStockCount = allStockItems.filter((item) => item.current_stock <= 0).length;
  const inventoryValue = allStockItems.reduce(
    (acc, item) => acc + (item.current_stock * parseFloat(item.unit_price || "0")),
    0
  );

  const getLatestActivityText = () => {
    if (transactionLoading) return "Loading...";
    if (!transactionData || transactionData.length === 0) return "No transactions yet";
    const log = transactionData[0];
    const item = log.item;
    if (!item) return "Logged transaction";
    const name = item.name || "item";
    if (log.received_quantity > 0) {
      return `Received ${log.received_quantity}x ${name}`;
    }
    if (log.ordered_quantity > 0) {
      return `Ordered ${log.ordered_quantity}x ${name}`;
    }
    if (log.damaged_quantity > 0) {
      return `Damaged ${log.damaged_quantity}x ${name}`;
    }
    if (log.returned_quantity > 0) {
      return `Returned ${log.returned_quantity}x ${name}`;
    }
    return `Updated ${name}`;
  };

  const metricCardsConfig = [
    {
      label: "Total Products",
      icon: Package,
      value: totalProducts,
      isLoading: allStockLoading,
      accentBg: "bg-primary/5 group-hover:bg-primary/10",
      borderHover: "hover:border-primary/20",
      iconColor: "text-primary",
    },
    {
      label: "Low Stock",
      icon: AlertTriangle,
      value: lowStockCount,
      isLoading: allStockLoading,
      accentBg: "bg-amber-500/5 group-hover:bg-amber-500/10",
      borderHover: "hover:border-amber-500/20",
      iconColor: "text-amber-500",
    },
    {
      label: "Out of Stock",
      icon: XCircle,
      value: outOfStockCount,
      isLoading: allStockLoading,
      accentBg: "bg-destructive/5 group-hover:bg-destructive/10",
      borderHover: "hover:border-destructive/20",
      iconColor: "text-destructive",
    },
    {
      label: "Stock Value",
      icon: Coins,
      value: `₹${inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      isLoading: allStockLoading,
      accentBg: "bg-emerald-500/5 group-hover:bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/20",
      iconColor: "text-emerald-500",
    },
    {
      label: "Latest Action",
      icon: ClipboardList,
      value: getLatestActivityText(),
      isLoading: transactionLoading,
      accentBg: "bg-primary/5 group-hover:bg-primary/10",
      borderHover: "hover:border-primary/20",
      iconColor: "text-primary",
      isText: true,
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inventory
          </h1>
          <p className="text-muted-foreground/80 text-sm">
            Track and manage your products, stock levels, and supply
            transactions.
          </p>
        </div>
        <div className="shrink-0 flex gap-2">
          <Button
            onClick={() => setIsLogTransactionOpen(true)}
            className="font-medium gap-2 rounded-full px-5 h-10 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ClipboardPlus className="w-4 h-4" />
            Add Stock Entry
          </Button>
        </div>
      </motion.div>

      <div className="w-full px-4 md:px-8 pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0"
        >
          {metricCardsConfig.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </motion.div>

        <div className="sm:hidden flex flex-col gap-4 text-xs">
          <div className="space-y-1">
            <div className="border border-border/60 rounded-2xl bg-card/60 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-muted-foreground hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-bold text-foreground">Overview:</span>
                  <span>{totalProducts} Items</span> • <span className="text-amber-600 font-semibold">{lowStockCount} Low</span> • <span className="text-emerald-600 font-semibold">₹{inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-foreground shrink-0 transition-transform duration-200 ${isStatsExpanded ? "rotate-180" : ""}`} />
              </button>
              {isStatsExpanded && (
                <div className="p-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs bg-background/50">
                  <div>Total Products: <span className="font-bold">{totalProducts}</span></div>
                  <div>Low Stock: <span className="font-bold text-amber-600">{lowStockCount}</span></div>
                  <div>Out of Stock: <span className="font-bold text-destructive">{outOfStockCount}</span></div>
                  <div>Stock Value: <span className="font-bold text-emerald-600">₹{inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                  <div className="col-span-2 text-muted-foreground truncate">Latest: {getLatestActivityText()}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-4 pb-4 border-b border-border/60 shadow-[0_3px_5px_-2px_rgba(0,0,0,0.05)] mb-2">
          <InventoryFilters
            activeTab={activeTab}
            onSearch={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categoryUuid={categoryUuid}
            onCategoryChange={setCategoryUuid}
            itemType={itemType}
            onItemTypeChange={setItemType}
            categories={categories}
          />

          <div className="mt-4">
            <div className="relative inline-flex h-11 items-center justify-start rounded-xl bg-muted/40 p-1 text-muted-foreground border border-border/50 backdrop-blur-sm w-full sm:w-auto max-w-full">
              <button
                onClick={() => handleTabChange("logs")}
                className={`flex-1 sm:flex-initial relative z-10 inline-flex h-full items-center justify-center rounded-lg px-3 sm:px-5 py-1.5 text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap ${
                  activeTab === 0
                    ? "text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === 0 && (
                  <motion.div
                    layoutId="activeInventoryTab"
                    className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <ClipboardList className="w-4 h-4 mr-1.5 sm:mr-2 relative z-20 shrink-0" />
                <span className="relative z-20 whitespace-nowrap">
                  Inventory Logs
                </span>
              </button>
              <button
                onClick={() => handleTabChange("stock")}
                className={`flex-1 sm:flex-initial relative z-10 inline-flex h-full items-center justify-center rounded-lg px-3 sm:px-5 py-1.5 text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap ${
                  activeTab === 1
                    ? "text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === 1 && (
                  <motion.div
                    layoutId="activeInventoryTab"
                    className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Package className="w-4 h-4 mr-1.5 sm:mr-2 relative z-20 shrink-0" />
                <span className="relative z-20 whitespace-nowrap">
                  Current Stocks
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full pt-2">
          {activeTab === 1 && (
            <div className="pr-1">
              <div className="text-muted-foreground font-semibold mb-4 text-xs tracking-wider uppercase">
                Total Items ({stockTotal})
              </div>
              <StockTable
                data={stockData}
                loading={stockLoading}
                onSuccess={handleTransactionLogged}
                hasMore={stockHasMore}
                fetchMore={fetchMoreStock}
                page={stockPage}
                isMobile={isMobile}
              />
            </div>
          )}

          {activeTab === 0 && (
            <div className="pr-1 w-full max-w-full min-w-0">
              <TransactionsTable
                data={transactionData}
                total={transactionTotal}
                page={transactionPage}
                limit={PAGE_LIMIT}
                onPageChange={handleTransactionPageChange}
                loading={transactionLoading}
                loadingLogUuid={loadingLogUuid}
                onRowClick={handleTransactionRowClick}
                isMobile={isMobile}
                hasMore={transactionHasMore}
                fetchMore={fetchMoreTransactions}
              />
            </div>
          )}
        </div>
      </div>

      <AddItemStepperModal
        open={isCreateItemOpen}
        onClose={() => {
          setIsCreateItemOpen(false);
          if (returningToTransaction) {
            setIsLogTransactionOpen(true);
            setReturningToTransaction(false);
          }
        }}
        onSuccess={(newItem) => {
          refreshStock();
          if (returningToTransaction) {
            setCreatedItemForTransaction(newItem);
            setIsLogTransactionOpen(true);
            setReturningToTransaction(false);
          }
        }}
      />

      <LogTransactionModal
        open={isLogTransactionOpen}
        onClose={() => {
          setIsLogTransactionOpen(false);
          setSelectedTransactionItem(null);
          setCreatedItemForTransaction(null);
        }}
        onSuccess={handleTransactionLogged}
        transactionToEdit={selectedTransactionItem}
        createdItem={createdItemForTransaction}
        onAddNewItem={() => {
          setIsLogTransactionOpen(false);
          setIsCreateItemOpen(true);
          setReturningToTransaction(true);
        }}
      />
    </div>
  );
}
