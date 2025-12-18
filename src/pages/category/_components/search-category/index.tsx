import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store/store";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import SearchBar from "../../../../components/searchbar";
import ListCategories from "../list-categories";

const SearchCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useSelector((state: RootState) => state.category.categories) ?? [];

  useEffect(() => {
    dispatch(listCategoriesAction());
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;

    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  return (
    <Box className="flex flex-col flex-1 min-h-0 px-8 pb-8 space-y-6">
      <Box>
        <SearchBar onSearch={setSearchQuery} placeholder="Search Category" />
      </Box>
      <Box className="flex-1 min-h-0 overflow-y-auto">
        <ListCategories categories={filteredCategories} />
      </Box>
    </Box>
  );
};

export default SearchCategories;
