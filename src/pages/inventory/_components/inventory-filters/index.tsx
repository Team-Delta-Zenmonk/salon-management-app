import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import SearchBar from "../../../../components/searchbar";
import Select from "../../../../components/form/select";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { SlidersHorizontal, RotateCcw, Filter } from "lucide-react";
import type { ItemCategory } from "../../../../features/inventory/types/category.type";

const STOCK_SORT_OPTIONS = [
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
  { value: "stock_high_low", label: "Stock: High to Low" },
  { value: "stock_low_high", label: "Stock: Low to High" },
];

const LOG_SORT_OPTIONS = [
  { value: "received_date_desc", label: "Received: Newest" },
  { value: "received_date_asc", label: "Received: Oldest" },
  { value: "ordered_date_desc", label: "Ordered: Newest" },
  { value: "ordered_date_asc", label: "Ordered: Oldest" },
  { value: "amount_high_low", label: "Amount: High to Low" },
  { value: "amount_low_high", label: "Amount: Low to High" },
];

const ITEM_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "product", label: "Product" },
  { value: "equipment", label: "Equipment" },
];

interface InventoryFiltersProps {
  activeTab: number;
  onSearch: (query: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categoryUuid: string;
  onCategoryChange: (value: string) => void;
  itemType: string;
  onItemTypeChange: (value: string) => void;
  categories: ItemCategory[];
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  activeTab,
  onSearch,
  sortBy,
  onSortChange,
  categoryUuid,
  onCategoryChange,
  itemType,
  onItemTypeChange,
  categories,
}) => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { control, watch, setValue, reset } = useForm({
    defaultValues: {
      categoryUuid: categoryUuid || "",
      itemType: itemType || "",
      sortBy: sortBy || "newest",
      desktopCategory: categoryUuid || "",
      desktopItemType: itemType || "",
      desktopSortBy: sortBy || "newest",
    },
  });

  const wCategory = watch("categoryUuid");
  const wType = watch("itemType");
  const wSort = watch("sortBy");

  const wDesktopCategory = watch("desktopCategory");
  const wDesktopType = watch("desktopItemType");
  const wDesktopSort = watch("desktopSortBy");

  useEffect(() => {
    setValue("desktopCategory", categoryUuid || "");
    setValue("categoryUuid", categoryUuid || "");
  }, [categoryUuid, setValue]);

  useEffect(() => {
    setValue("desktopItemType", itemType || "");
    setValue("itemType", itemType || "");
  }, [itemType, setValue]);

  useEffect(() => {
    setValue("desktopSortBy", sortBy || "newest");
    setValue("sortBy", sortBy || "newest");
  }, [sortBy, setValue]);

  useEffect(() => {
    if (wDesktopCategory !== undefined && wDesktopCategory !== categoryUuid) {
      onCategoryChange(wDesktopCategory || "");
    }
  }, [wDesktopCategory, categoryUuid, onCategoryChange]);

  useEffect(() => {
    if (wDesktopType !== undefined && wDesktopType !== itemType) {
      onItemTypeChange(wDesktopType || "");
    }
  }, [wDesktopType, itemType, onItemTypeChange]);

  useEffect(() => {
    if (wDesktopSort !== undefined && wDesktopSort !== sortBy) {
      onSortChange(wDesktopSort || "newest");
    }
  }, [wDesktopSort, sortBy, onSortChange]);

  const handleOpenModal = () => {
    reset({
      categoryUuid: categoryUuid || "",
      itemType: itemType || "",
      sortBy: sortBy || "newest",
    });
    setFilterModalOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset({
        categoryUuid: categoryUuid || "",
        itemType: itemType || "",
        sortBy: sortBy || "newest",
      });
    }
    setFilterModalOpen(open);
  };

  const handleApply = () => {
    const finalCategory = wCategory || "";
    const finalType = wType || "";
    const finalSort = wSort || "newest";

    if (finalCategory !== categoryUuid) onCategoryChange(finalCategory);
    if (finalType !== itemType) onItemTypeChange(finalType);
    if (finalSort !== sortBy) onSortChange(finalSort);

    setFilterModalOpen(false);
  };

  const handleResetDraft = () => {
    setValue("categoryUuid", "");
    setValue("itemType", "");
    setValue("sortBy", "newest");
  };

  const sortOptions = activeTab === 1 ? STOCK_SORT_OPTIONS : LOG_SORT_OPTIONS;

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...(categories || [])
      .filter((cat) => cat && cat.uuid)
      .map((cat) => {
        const name = cat.name || "";
        const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : "Unnamed";
        return { value: cat.uuid, label: formattedName };
      }),
  ];

  const sortOptionsWithDefault = [
    { value: "newest", label: "Default (Newest)" },
    ...sortOptions,
  ];

  const activeFilterCount =
    (activeTab === 1 && categoryUuid ? 1 : 0) +
    (activeTab === 1 && itemType ? 1 : 0) +
    (sortBy && sortBy !== "newest" ? 1 : 0);

  const isDraftDirty = Boolean((activeTab === 1 && (wCategory || wType)) || (wSort && wSort !== "newest"));

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex-1 max-w-sm xl:w-56 xl:flex-none">
        <SearchBar
          onSearch={onSearch}
          placeholder={activeTab === 0 ? "Search transaction logs..." : "Search products..."}
        />
      </div>

      <Button
        variant="outline"
        onClick={handleOpenModal}
        className="xl:hidden gap-2 rounded-2xl h-10 px-4 font-semibold border-border/50 bg-card/60 backdrop-blur-md hover:bg-card hover:border-primary/40 transition-all cursor-pointer shrink-0"
      >
        <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <Badge className="h-5 px-1.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <div className="hidden xl:flex items-center gap-3 shrink-0">
        {activeTab === 1 && (
          <>
            <div className="w-56">
              <Select
                name="desktopCategory"
                control={control}
                placeholder="All Categories"
                identifier="desktop-category"
                options={categoryOptions}
                triggerClassName="capitalize h-10 rounded-xl bg-card/60 border-border/50"
              />
            </div>
            <div className="w-56">
              <Select
                name="desktopItemType"
                control={control}
                placeholder="All Types"
                identifier="desktop-type"
                options={ITEM_TYPE_OPTIONS}
                triggerClassName="h-10 rounded-xl bg-card/60 border-border/50"
              />
            </div>
          </>
        )}
        <div className="w-56">
          <Select
            name="desktopSortBy"
            control={control}
            placeholder="Sort By"
            identifier="desktop-sort"
            options={sortOptionsWithDefault}
            triggerClassName="h-10 rounded-xl bg-card/60 border-border/50"
          />
        </div>
      </div>

      <Dialog open={filterModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-md p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b bg-muted/20 shrink-0">
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary shrink-0" />
              Filter Inventory {activeTab === 0 ? "Logs" : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col py-5 px-5 sm:px-6 gap-4 sm:gap-5 overflow-y-auto custom-scrollbar flex-1">
            {activeTab === 1 && (
              <>
                <Select
                  name="categoryUuid"
                  control={control}
                  placeholder="Select Category"
                  identifier="filter-category"
                  label="Category"
                  options={categoryOptions}
                  triggerClassName="capitalize"
                />

                <Select
                  name="itemType"
                  control={control}
                  placeholder="Select Item Type"
                  identifier="filter-type"
                  label="Item Type"
                  options={ITEM_TYPE_OPTIONS}
                />
              </>
            )}

            <Select
              name="sortBy"
              control={control}
              placeholder="Select Sort Order"
              identifier="filter-sort"
              label="Sort By"
              options={sortOptionsWithDefault}
            />
          </div>

              <DialogFooter className="m-0 px-5 sm:px-6 py-3.5 sm:py-4 border-t bg-muted/10 gap-2.5 sm:gap-3 flex flex-row items-center justify-between shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetDraft}
                  disabled={!isDraftDirty}
                  className="rounded-full px-4 font-semibold text-xs gap-1.5 border-border/50 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filters
                </Button>
                <Button
                  type="button"
                  onClick={handleApply}
                  className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </div>
  );
};
