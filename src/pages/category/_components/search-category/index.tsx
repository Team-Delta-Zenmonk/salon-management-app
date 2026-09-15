import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store/store";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { resetCategories } from "../../../../features/category/category.slice";
import ListCategories from "../list-categories";
import { callSnack } from "../../../../components/snackbar";
import { CategoryListSkeleton } from "../category-skeleton";

interface SearchCategoriesProps {
  searchQuery: string;
}

const SearchCategories = ({ searchQuery }: SearchCategoriesProps) => {
  const dispatch = useDispatch<AppDispatch>();
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
    <div className="w-full px-4 md:px-8 pb-8 space-y-4">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md flex items-center justify-between pt-4 pb-3.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border/40 shadow-xs">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          All Categories
          <span className="text-primary text-base font-medium bg-primary/10 px-2.5 py-0.5 rounded-full">
            {total}
          </span>
        </h2>
      </div>

      <div className="flex-1 min-h-0 pt-2">
        {isLoading && data.length === 0 ? (
          <div className="w-full pt-4">
            <CategoryListSkeleton />
          </div>
        ) : (
          <ListCategories
            categories={data}
            total={total}
            hasMore={hasMore}
            fetchMoreCategories={fetchMoreCategories}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default SearchCategories;
