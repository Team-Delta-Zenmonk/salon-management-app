import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import type { AppDispatch, RootState } from "../../../../store/store";
import { useAppSelector } from "../../../../store/hooks";
import SearchBar from "../../../../components/searchbar";
import Select from "../../../../components/form/select";
import ListServices from "../list-services";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { listServicesAction, type ListServicesParams } from "../../../../features/service/list-services/list-service.action";
import { resetServices } from "../../../../features/service/service.slice";
import { callSnack } from "../../../../components/snackbar";

type FilterForm = {
  category_uuid: string;
};

const ALL_CATEGORIES_VALUE = "all";

interface SearchServiceProps {
  selectedCategoryUuid: string;
  onCategoryChange: (uuid: string) => void;
  refreshServices: (cb?: () => void) => Promise<void>;
}

const SearchService = ({ selectedCategoryUuid, onCategoryChange, refreshServices }: SearchServiceProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const categories = useAppSelector((state: RootState) => state.category.data);
  const serviceState = useAppSelector((state: RootState) => state.service);
  const data = serviceState?.data ?? [];
  const total = serviceState?.total ?? 0;
  const page = serviceState?.page ?? 1;
  const limit = serviceState?.limit ?? 10;

  const methods = useForm<FilterForm>({
    defaultValues: {
      category_uuid: selectedCategoryUuid,
    },
  });

  const { control, watch } = methods;
  const watchedCategoryUuid = watch("category_uuid");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        await dispatch(listCategoriesAction({ page: 1, limit: 100 })).unwrap();
      } catch {
        callSnack("Failed to fetch categories", "error");
      }
    };
    fetchCategories();
  }, [dispatch]);

  const categoryOptions = useMemo(
    () => [
      { label: "All", value: ALL_CATEGORIES_VALUE },
      ...(categories ?? []).map((c) => ({
        label: c.name,
        value: c.uuid,
      })),
    ],
    [categories]
  );

  useEffect(() => {
    methods.setValue("category_uuid", selectedCategoryUuid);
  }, [selectedCategoryUuid, methods]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        if (selectedCategoryUuid === ALL_CATEGORIES_VALUE) {
          await dispatch(listServicesAction({ page: 1, limit: 10 })).unwrap();
        } else {
          await dispatch(
            listServicesAction({
              category_uuid: selectedCategoryUuid,
              page: 1,
              limit: 10,
            })
          ).unwrap();
        }
      } catch {
        callSnack("Failed to fetch services", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [dispatch, selectedCategoryUuid]);

  useEffect(() => {
    const trimmedSearch = searchQuery.trim();

    const fetchFilteredData = async () => {
      dispatch(resetServices());
      setIsLoading(true);
      try {
        const params: ListServicesParams = {
          page: 1,
          limit: 10,
          search: trimmedSearch || undefined,
        };

        if (watchedCategoryUuid !== ALL_CATEGORIES_VALUE) {
          params.category_uuid = watchedCategoryUuid;
        }

        await dispatch(listServicesAction(params)).unwrap();
      } catch {
        callSnack("Internal Server Error", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredData();
  }, [searchQuery, watchedCategoryUuid, dispatch]);

  useEffect(() => {
    if (watchedCategoryUuid !== selectedCategoryUuid) {
      onCategoryChange(watchedCategoryUuid);
    }
  }, [watchedCategoryUuid, selectedCategoryUuid, onCategoryChange]);

  const fetchMoreServices = useCallback(async () => {
    try {
      const params: ListServicesParams = {
        page: page + 1,
        limit: limit,
        search: searchQuery.trim() || undefined,
      };

      if (watchedCategoryUuid !== ALL_CATEGORIES_VALUE) {
        params.category_uuid = watchedCategoryUuid;
      }

      await dispatch(listServicesAction(params)).unwrap();
    } catch {
      callSnack("Failed to load more services", "error");
    }
  }, [dispatch, page, limit, searchQuery, watchedCategoryUuid]);

  const hasMore = data.length < total;

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 md:px-8 pb-8 space-y-6">
      <FormProvider {...methods}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-border/10 mb-2">
          <div className="w-full md:w-[320px]">
            <SearchBar onSearch={setSearchQuery} placeholder="Search Services..." />
          </div>
          <div className="w-full md:w-[240px] bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-xs [&_button]:h-11 [&_button]:border-none [&_button]:bg-transparent">
            <Select
              name="category_uuid"
              control={control}
              placeholder="All Categories"
              identifier="service-category-filter"
              options={categoryOptions}
              disabled={categoryOptions.length === 0}
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto" id="servicesScrollableDiv">
          {isLoading && data.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[220px] gap-6 animate-pulse"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-foreground/10 shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-5 bg-foreground/10 rounded w-2/3" />
                          <div className="h-3 bg-foreground/10 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
                      <div className="h-6 bg-foreground/10 rounded-md w-16" />
                      <div className="h-6 bg-foreground/10 rounded-md w-20" />
                      <div className="h-6 bg-foreground/10 rounded-md w-14" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border/40">
                    <div className="h-4 bg-foreground/10 rounded w-24" />
                    <div className="h-8 bg-foreground/10 rounded-full w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ListServices
              searchQuery={searchQuery}
              categoryUuid={selectedCategoryUuid}
              refreshServices={refreshServices}
              hasMore={hasMore}
              fetchMoreServices={fetchMoreServices}
              total={total}
            />
          )}
        </div>
      </FormProvider>
    </div>
  );
};

export default SearchService;

