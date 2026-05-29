import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store/store";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { resetCategories } from "../../../../features/category/category.slice";
import SearchBar from "../../../../components/searchbar";
import ListCategories from "../list-categories";
import { callSnack } from "../../../../components/snackbar";

const SearchCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const categoryState = useSelector((state: RootState) => state.category);
  const data = categoryState?.data ?? [];
  const total = categoryState?.total ?? 0;
  const page = categoryState?.page ?? 1;
  const limit = categoryState?.limit ?? 10;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await dispatch(listCategoriesAction({ page: 1, limit: 10 })).unwrap();
      } catch {
        callSnack("Failed to fetch categoreis", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [dispatch]);

  useEffect(() => {
    const trimmedSearch = searchQuery.trim();

    const fetchSearchResults = async () => {
      dispatch(resetCategories());
      setIsLoading(true);
      try {
        await dispatch(
          listCategoriesAction({
            page: 1,
            limit: 10,
            search: trimmedSearch || undefined,
          })
        ).unwrap();
      } catch {
        callSnack("Failed to search categories", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSearchResults();
  }, [searchQuery, dispatch]);

  const fetchMoreCategories = useCallback(async () => {
    await dispatch(
      listCategoriesAction({
        page: page + 1,
        limit: limit,
        search: searchQuery.trim() || undefined,
      })
    ).unwrap();
  }, [dispatch, page, limit, searchQuery]);

  const hasMore = data.length < total;

  return (
    <Box className="flex flex-col flex-1 min-h-0 px-4 md:px-8 pb-8 space-y-6">
      <Box>
        <SearchBar onSearch={setSearchQuery} placeholder="Search Category" />
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto" id="scrollableDiv">
        {isLoading && data.length === 0 ? (
          <Box className="flex items-center justify-center h-full">
            <CircularProgress />
          </Box>
        ) : (
          <ListCategories
            categories={data}
            total={total}
            hasMore={hasMore}
            fetchMoreCategories={fetchMoreCategories}
            searchQuery={searchQuery}
          />
        )}
      </Box>
    </Box>
  );
};

export default SearchCategories;
