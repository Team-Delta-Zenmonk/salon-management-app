import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { ClipboardPlus, Package, AlertTriangle, XCircle, Coins, ClipboardList, Loader2 } from "lucide-react";
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

const PAGE_LIMIT = 10;

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

  const [allStockItems, setAllStockItems] = useState<InventoryItem[]>([]);
  const [allStockLoading, setAllStockLoading] = useState(false);

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
        page: newPage + 1, // TablePagination is 0-based, API is 1-based
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
      const freshData = await dispatch(getInventoryLogAction(item.uuid)).unwrap();
      setSelectedTransactionItem(freshData.data || freshData);
    } catch {
      setSelectedTransactionItem(item);
    }
    setIsLogTransactionOpen(true);
  };

  const stockHasMore = Number(stockTotal) > 0 && stockData.length < Number(stockTotal);
  const transactionHasMore = Number(transactionTotal) > 0 && transactionData.length < Number(transactionTotal);

  // Compute Stats
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

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-background">
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
            Track and manage your products, stock levels, and supply transactions.
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

      <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 pb-8 space-y-6">
        {/* Metrics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0"
        >
          {/* Total Products */}
          <div className="group relative overflow-hidden p-4 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col justify-between gap-2 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="font-semibold text-[10px] text-muted-foreground/80 uppercase tracking-wider">Total Products</span>
              <div className="w-8 h-8 bg-background/50 rounded-lg flex items-center justify-center border border-border/50 text-primary">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 relative z-10">
              <p className="text-xl font-bold tracking-tight text-foreground">
                {allStockLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : totalProducts}
              </p>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="group relative overflow-hidden p-4 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col justify-between gap-2 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-amber-500/20 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="font-semibold text-[10px] text-muted-foreground/80 uppercase tracking-wider">Low Stock</span>
              <div className="w-8 h-8 bg-background/50 rounded-lg flex items-center justify-center border border-border/50 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 relative z-10">
              <p className="text-xl font-bold tracking-tight text-foreground">
                {allStockLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : lowStockCount}
              </p>
            </div>
          </div>

          {/* Out of Stock Items */}
          <div className="group relative overflow-hidden p-4 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col justify-between gap-2 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-destructive/20 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-destructive/5 rounded-full blur-xl group-hover:bg-destructive/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="font-semibold text-[10px] text-muted-foreground/80 uppercase tracking-wider">Out of Stock</span>
              <div className="w-8 h-8 bg-background/50 rounded-lg flex items-center justify-center border border-border/50 text-destructive">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 relative z-10">
              <p className="text-xl font-bold tracking-tight text-foreground">
                {allStockLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : outOfStockCount}
              </p>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="group relative overflow-hidden p-4 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col justify-between gap-2 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="font-semibold text-[10px] text-muted-foreground/80 uppercase tracking-wider">Stock Value</span>
              <div className="w-8 h-8 bg-background/50 rounded-lg flex items-center justify-center border border-border/50 text-emerald-500">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 relative z-10">
              <p className="text-xl font-bold tracking-tight text-foreground truncate">
                {allStockLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : `₹${inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="group relative overflow-hidden p-4 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col justify-between gap-2 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 col-span-2 sm:col-span-1 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="font-semibold text-[10px] text-muted-foreground/80 uppercase tracking-wider">Latest Action</span>
              <div className="w-8 h-8 bg-background/50 rounded-lg flex items-center justify-center border border-border/50 text-primary">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 relative z-10">
              <p className="text-[11px] font-bold text-foreground truncate uppercase tracking-wide leading-snug">
                {getLatestActivityText()}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="shrink-0">
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
            <div className="relative inline-flex h-11 items-center justify-start rounded-xl bg-muted/40 p-1 text-muted-foreground border border-border/40 backdrop-blur-sm w-full max-w-[360px]">
              <button
                onClick={() => handleTabChange("logs")}
                className={`flex-1 relative z-10 inline-flex h-full items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                  activeTab === 0 ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === 0 && (
                  <motion.div
                    layoutId="activeInventoryTab"
                    className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <ClipboardList className="w-4 h-4 mr-2 relative z-20" />
                <span className="relative z-20">Inventory Logs</span>
              </button>
              <button
                onClick={() => handleTabChange("stock")}
                className={`flex-1 relative z-10 inline-flex h-full items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                  activeTab === 1 ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === 1 && (
                  <motion.div
                    layoutId="activeInventoryTab"
                    className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Package className="w-4 h-4 mr-2 relative z-20" />
                <span className="relative z-20">Current Stocks</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto" id="inventoryScrollableDiv">
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
