import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Typography, Tabs, Tab, useTheme, useMediaQuery } from "@mui/material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";
import SearchBar from "../../components/searchbar";

import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { listInventoryItemsAction } from "../../features/inventory/list-inventory-items/list-inventory-items.action";
import { listInventoryLogsAction } from "../../features/inventory/list-inventory-logs/list-inventory-logs.action";
import { appendStock } from "../../features/inventory/inventory-item.slice";
import { appendTransactions } from "../../features/inventory/inventory-log.slice";
import { listInventoryItemsService as getStock } from "../../features/inventory/list-inventory-items/list-inventory-items.service";
import { getTransactions } from "../../features/inventory/list-inventory-logs/list-inventory-logs.service";
import { StockTable } from "./_components/StockTable";
import { TransactionsTable } from "./_components/TransactionsTable";
import { LogTransactionModal } from "./_components/LogTransactionModal";
import { AddItemStepperModal } from "./_components/AddItemStepperModal";
import { fetchItemCategoriesAction } from "../../features/inventory/list-items-category/list-items-category.action";
import type { InventoryTransaction } from "../../features/inventory/inventory-log.slice";
import { MenuItem, Select as MuiSelect, FormControl } from "@mui/material";


const PAGE_LIMIT = 10;

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
  const [createdItemForTransaction, setCreatedItemForTransaction] = useState<any | null>(null);

  const [sortBy, setSortBy] = useState<string>("");
  const [categoryUuid, setCategoryUuid] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [stockLoading, setStockLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const categories = useAppSelector((state) => state.itemsCategory.data) ?? [];

  useEffect(() => {
    if (activeTab === 1 && categories.length === 0) {
      dispatch(fetchItemCategoriesAction({ limit: 100 }));
    }
  }, [dispatch, activeTab, categories.length]);

  const fetchData = useCallback(() => {
    if (activeTab === 1) {
      setStockLoading(true);
      dispatch(listInventoryItemsAction({
        page: 1,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        sortBy: sortBy || undefined,
        category_uuid: categoryUuid || undefined,
        item_type: itemType || undefined
      })).finally(() => setStockLoading(false));
    } else {
      setTransactionLoading(true);
      dispatch(listInventoryLogsAction({
        page: 1,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        sortBy: sortBy || undefined
      })).finally(() => setTransactionLoading(false));
    }
  }, [dispatch, activeTab, debouncedSearch, sortBy, categoryUuid, itemType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStockPageChange = (_event: unknown, newPage: number) => {
    setStockLoading(true);
    dispatch(listInventoryItemsAction({
      page: newPage + 1,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
      sortBy: sortBy || undefined,
      category_uuid: categoryUuid || undefined,
      item_type: itemType || undefined
    })).finally(() => setStockLoading(false));
  };

  const handleTransactionPageChange = (_event: unknown, newPage: number) => {
    setTransactionLoading(true);
    dispatch(listInventoryLogsAction({
      page: newPage + 1,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
      sortBy: sortBy || undefined
    })).finally(() => setTransactionLoading(false));
  };

  const fetchMoreStock = useCallback(async () => {
    if (stockLoading) return;
    const nextPage = stockPage + 1;
    setStockLoading(true);
    try {
      const res = await getStock({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        sortBy: sortBy || undefined,
        category_uuid: categoryUuid || undefined,
        item_type: itemType || undefined
      });
      dispatch(appendStock(res));
    } catch (error) {
      console.error("Error fetching more stock:", error);
    } finally {
      setStockLoading(false);
    }
  }, [stockPage, debouncedSearch, sortBy, categoryUuid, itemType, stockLoading, dispatch]);

  const fetchMoreTransactions = useCallback(async () => {
    if (transactionLoading) return;
    const nextPage = transactionPage + 1;
    setTransactionLoading(true);
    try {
      const res = await getTransactions({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        sortBy: sortBy || undefined
      });
      dispatch(appendTransactions(res));
    } catch (error) {
      console.error("Error fetching more transactions:", error);
    } finally {
      setTransactionLoading(false);
    }
  }, [transactionPage, debouncedSearch, sortBy, transactionLoading, dispatch]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSearchParams({ tab: newValue === 0 ? "logs" : "stock" });
    setSearchTerm("");
    setSortBy("");
    setCategoryUuid("");
    setItemType("");
  };

  const handleTransactionLogged = () => {
    if (activeTab === 0) {
      setTransactionLoading(true);
      dispatch(listInventoryLogsAction({ page: 1, limit: PAGE_LIMIT, search: debouncedSearch })).finally(() => setTransactionLoading(false));
    } else {
      setStockLoading(true);
      dispatch(listInventoryItemsAction({ page: 1, limit: PAGE_LIMIT, search: debouncedSearch })).finally(() => setStockLoading(false));
    }
  };

  const refreshStock = useCallback(() => {
    setStockLoading(true);
    dispatch(listInventoryItemsAction({ page: 1, limit: PAGE_LIMIT })).finally(() => setStockLoading(false));
  }, [dispatch]);

  const handleTransactionRowClick = (item: InventoryTransaction) => {
    setSelectedTransactionItem(item);
    setIsLogTransactionOpen(true);
  };

  const stockHasMore = Number(stockTotal) > 0 && stockData.length < Number(stockTotal);
  const transactionHasMore = Number(transactionTotal) > 0 && transactionData.length < Number(transactionTotal);

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="h4" fontWeight="bold">
          Inventory
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">

          <Button
            variant="contained"
            color="primary"
            startIcon={<AssignmentIcon sx={{ color: "common.white" }} />}
            onClick={() => setIsLogTransactionOpen(true)}
            sx={{ fontWeight: "bold" }}
          >
            Add Stock Entry
          </Button>
        </Box>
      </Box>



      <Box mb={2} display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <Box sx={{ width: { xs: "100%", sm: "300px" } }}>
          <SearchBar
            onSearch={(query) => setSearchTerm(query)}
            placeholder="Search products..."
          />
        </Box>

        {activeTab === 1 && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <MuiSelect
              displayEmpty
              value={categoryUuid}
              onChange={(e) => setCategoryUuid(e.target.value as string)}
              renderValue={(selected) => {
                if (selected === "") return <Typography color="text.secondary" variant="paragraphMd">Category</Typography>;
                const category = categories.find(cat => cat.uuid === selected);
                return category ? category.name : "All Categories";
              }}
              sx={{
                bgcolor: 'common.white',
                '& .MuiSelect-select': { py: '8.5px' }
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.uuid} value={cat.uuid}>
                  {cat.name}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
        )}

        {activeTab === 1 && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <MuiSelect
              displayEmpty
              value={itemType}
              onChange={(e) => setItemType(e.target.value as string)}
              renderValue={(selected) => {
                if (selected === "") return <Typography color="text.secondary" variant="paragraphMd">Type</Typography>;
                return selected === "product" ? "Product" : "Equipment";
              }}
              sx={{
                bgcolor: 'common.white',
                '& .MuiSelect-select': { py: '8.5px' }
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
            </MuiSelect>
          </FormControl>
        )}

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <MuiSelect
            displayEmpty
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as string)}
            renderValue={(selected) => {
              if (selected === "") return <Typography color="text.secondary" variant="paragraphMd">Sort By</Typography>;
              const sortOptions: Record<string, string> = {
                name_asc: "Name: A to Z",
                name_desc: "Name: Z to A",
                stock_high_low: "Stock: High to Low",
                stock_low_high: "Stock: Low to High",
                received_date_desc: "Received: Newest",
                received_date_asc: "Received: Oldest",
                ordered_date_desc: "Ordered: Newest",
                ordered_date_asc: "Ordered: Oldest",
                amount_high_low: "Amount: High to Low",
                amount_low_high: "Amount: Low to High"
              };
              return sortOptions[selected] || "Default (Newest)";
            }}
            sx={{
              bgcolor: 'common.white',
              '& .MuiSelect-select': { py: '8.5px' }
            }}
          >
            <MenuItem value="">Default (Newest)</MenuItem>
            {activeTab === 1 && <MenuItem value="name_asc">Name: A to Z</MenuItem>}
            {activeTab === 1 && <MenuItem value="name_desc">Name: Z to A</MenuItem>}
            {activeTab === 1 && <MenuItem value="stock_high_low">Stock: High to Low</MenuItem>}
            {activeTab === 1 && <MenuItem value="stock_low_high">Stock: Low to High</MenuItem>}

            {activeTab === 0 && <MenuItem value="received_date_desc">Received: Newest</MenuItem>}
            {activeTab === 0 && <MenuItem value="received_date_asc">Received: Oldest</MenuItem>}
            {activeTab === 0 && <MenuItem value="ordered_date_desc">Ordered: Newest</MenuItem>}
            {activeTab === 0 && <MenuItem value="ordered_date_asc">Ordered: Oldest</MenuItem>}
            {activeTab === 0 && <MenuItem value="amount_high_low">Amount: High to Low</MenuItem>}
            {activeTab === 0 && <MenuItem value="amount_low_high">Amount: Low to High</MenuItem>}
          </MuiSelect>
        </FormControl>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="inventory tabs">
          <Tab label="Inventory Logs" />
          <Tab label="Current Stocks" />
        </Tabs>
      </Box>

      {activeTab === 1 && (
        <>
          <Box sx={{ color: "primary.900", mb: 1, fontWeight: "bold", px: 1 }}>
            Total Items ({stockTotal})
          </Box>
          <Box
            id="inventoryScrollDiv"
            sx={{
              height: "calc(100vh - 420px)",
              overflowY: "auto",
              pr: 1
            }}
          >
            <StockTable
              data={stockData}
              total={stockTotal}
              page={stockPage}
              limit={PAGE_LIMIT}
              onPageChange={handleStockPageChange}
              loading={stockLoading}
              onSuccess={handleTransactionLogged}
              isMobile={isMobile}
              hasMore={stockHasMore}
              fetchMore={fetchMoreStock}
            />
          </Box>
        </>
      )}

      {activeTab === 0 && (
        <Box
          id="logScrollDiv"
          sx={{
            height: "calc(100vh - 420px)",
            overflowY: "auto",
            pr: 1,
            width: "100%",
            maxWidth: "100%",
            minWidth: 0
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
