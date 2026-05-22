import React from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import SearchBar from "../../../../components/searchbar";
import Select from "../../../../components/form/select";
import type { ItemCategory } from "../../../../features/inventory/types/category.type";

export const STOCK_SORT_OPTIONS = [
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
  { value: "stock_high_low", label: "Stock: High to Low" },
  { value: "stock_low_high", label: "Stock: Low to High" },
];

export const LOG_SORT_OPTIONS = [
  { value: "received_date_desc", label: "Received: Newest" },
  { value: "received_date_asc", label: "Received: Oldest" },
  { value: "ordered_date_desc", label: "Ordered: Newest" },
  { value: "ordered_date_asc", label: "Ordered: Oldest" },
  { value: "amount_high_low", label: "Amount: High to Low" },
  { value: "amount_low_high", label: "Amount: Low to High" },
];

export const ITEM_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "product", label: "Product" },
  { value: "equipment", label: "Equipment" },
];

interface InventoryFiltersProps {
  activeTab: number;
  searchTerm: string;
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
  searchTerm,
  onSearch,
  sortBy,
  onSortChange,
  categoryUuid,
  onCategoryChange,
  itemType,
  onItemTypeChange,
  categories,
}) => {
  const { control, watch, setValue } = useForm({
    defaultValues: {
      categoryUuid: categoryUuid || "",
      itemType: itemType || "",
      sortBy: sortBy || "newest",
    },
  });

  const wCategory = watch("categoryUuid");
  const wType = watch("itemType");
  const wSort = watch("sortBy");

  React.useEffect(() => {
    if (wCategory !== undefined && wCategory !== categoryUuid) onCategoryChange(wCategory);
    if (wType !== undefined && wType !== itemType) onItemTypeChange(wType);
    if (wSort !== undefined && wSort !== sortBy) onSortChange(wSort);
  }, [wCategory, wType, wSort, categoryUuid, itemType, sortBy, onCategoryChange, onItemTypeChange, onSortChange]);

  React.useEffect(() => {
    setValue("categoryUuid", categoryUuid);
    setValue("itemType", itemType);
    setValue("sortBy", sortBy);
  }, [categoryUuid, itemType, sortBy, setValue]);

  const sortOptions = activeTab === 1 ? STOCK_SORT_OPTIONS : LOG_SORT_OPTIONS;

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.uuid, label: cat.name })),
  ];

  const sortOptionsWithDefault = [
    { value: "newest", label: "Default (Newest)" },
    ...sortOptions,
  ];

  return (
    <Box mb={2} display="flex" gap={2} flexWrap="wrap" alignItems="center">
      <Box sx={{ width: { xs: "100%", sm: "300px" } }}>
        <SearchBar onSearch={onSearch} placeholder="Search products..." />
      </Box>

      <Box sx={{ display: activeTab === 1 ? 'block' : 'none', minWidth: 160, width: 160 }}>
        <Select
          name="categoryUuid"
          control={control}
          placeholder="Category"
          identifier="filter-category"
          options={categoryOptions}
        />
      </Box>

      <Box sx={{ display: activeTab === 1 ? 'block' : 'none', minWidth: 160, width: 160 }}>
        <Select
          name="itemType"
          control={control}
          placeholder="Type"
          identifier="filter-type"
          options={ITEM_TYPE_OPTIONS}
        />
      </Box>

      <Box sx={{ minWidth: 180, width: 180 }}>
        <Select
          name="sortBy"
          control={control}
          placeholder="Sort By"
          identifier="filter-sort"
          options={sortOptionsWithDefault}
        />
      </Box>
    </Box>
  );
};
