import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Tabs, Tab, useTheme, useMediaQuery } from "@mui/material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";
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
import styles from "./inventory.module.scss";
import PageHeader from "../../components/page-header";

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
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));

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
  const [createdItemForTransaction, setCreatedItemForTransaction] = useState<any>(null);

  const [stockLoading, setStockLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const [sortBy, setSortBy] = useState<string>("newest");
  const [categoryUuid, setCategoryUuid] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");

  const categories = useAppSelector((state) => state.itemsCategory.data) ?? [];

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSearchParams({ tab: newValue === 0 ? "logs" : "stock" });
  };

  const handleTransactionLogged = async () => {
    setTransactionLoading(true);
    setStockLoading(true);
    try {
      await Promise.all([
        dispatch(listInventoryLogsAction({ page: 1, limit: PAGE_LIMIT, search: debouncedSearch, ...getSortParams(sortBy) })).unwrap(),
        dispatch(listInventoryItemsAction({ page: 1, limit: PAGE_LIMIT, search: debouncedSearch, ...getSortParams(sortBy), category_id: categoryUuid || undefined, item_type: itemType || undefined })).unwrap(),
      ]);
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

  return (
    <Box className="flex flex-col flex-1 min-h-0 w-full pb-12">
      <Box className={styles.stickyContainer}>
        <PageHeader
          title="Inventory Management"
          subtitle="Manage your stock and track inventory logs."
          action={
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsLogTransactionOpen(true)}
              disableElevation
              sx={{ fontWeight: "medium" }}
            >
              <Typography>Add</Typography>
            </Button>
          }
        />

        <InventoryFilters
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categoryUuid={categoryUuid}
          onCategoryChange={setCategoryUuid}
          itemType={itemType}
          onItemTypeChange={setItemType}
          categories={categories}
        />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="inventory tabs">
            <Tab label="Inventory Logs" sx={{ fontSize: "1rem", fontWeight: 600, textTransform: "capitalize" }} />
            <Tab label="Current Stocks" sx={{ fontSize: "1rem", fontWeight: 600, textTransform: "capitalize" }} />
          </Tabs>
        </Box>
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto pt-6 px-1" id="inventoryScrollableDiv">
        {activeTab === 1 && (
        <>
          <Box className="text-[var(--text-muted)] mb-4 font-semibold text-sm uppercase tracking-wider">
            Total Items ({stockTotal})
          </Box>
          <Box>
            <StockTable
              data={stockData}
              loading={stockLoading}
              onSuccess={handleTransactionLogged}
              hasMore={stockHasMore}
              fetchMore={fetchMoreStock}
            />
          </Box>
        </>
      )}

      {activeTab === 0 && (
        <Box
          sx={{
            pr: 1,
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
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
        </Box>
      )}
      </Box>

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
    </Box>
  );
}
