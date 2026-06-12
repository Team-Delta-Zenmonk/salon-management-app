import { Box, CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import type { AppDispatch, RootState } from "../../../../store/store";
import { useAppSelector } from "../../../../store/hooks";
import SearchBar from "../../../../components/searchbar";
import Select from "../../../../components/form/select";
import ListServices from "../list-services";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { listServicesAction } from "../../../../features/service/list-services/list-service.action";
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

  const categories = useAppSelector((state: RootState) => state.category.data) ?? [];
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
      { label: "All Categories", value: ALL_CATEGORIES_VALUE },
      ...categories.map((c) => ({
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
        const params: any = {
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
      const params: any = {
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
    <Box className="flex flex-col flex-1 min-h-0 space-y-6">
      <FormProvider {...methods}>
        <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchBar onSearch={setSearchQuery} placeholder="Search Service..." />
          <Box className="w-full md:w-[320px]">
            <Select
              name="category_uuid"
              control={control}
              placeholder="Select Category"
              identifier="service-category-filter"
              options={categoryOptions}
              disabled={categoryOptions.length === 0}
            />
          </Box>
        </Box>
        <Box className="flex-1 min-h-0 overflow-y-auto" id="servicesScrollableDiv">
          {isLoading && data.length === 0 ? (
            <Box className="flex items-center justify-center h-full">
              <CircularProgress />
            </Box>
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
        </Box>
      </FormProvider>
    </Box>
  );
};

export default SearchService;
