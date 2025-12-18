import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import type { AppDispatch, RootState } from "../../../../store/store";
import { useAppSelector } from "../../../../store/hooks";
import SearchBar from "../../../../components/searchbar";
import Select from "../../../../components/form/select";
import ListServices from "../list-services";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { listServicesAction } from "../../../../features/service/list-services/list-service.action";

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
  const categories = useAppSelector((state: RootState) => state.category.categories) ?? [];

  const methods = useForm<FilterForm>({
    defaultValues: {
      category_uuid: selectedCategoryUuid,
    },
  });

  const { control, watch } = methods;
  const watchedCategoryUuid = watch("category_uuid");

  useEffect(() => {
    dispatch(listCategoriesAction());
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
    if (watchedCategoryUuid === ALL_CATEGORIES_VALUE) {
      dispatch(listServicesAction(undefined));
    } else if (watchedCategoryUuid) {
      dispatch(listServicesAction({ category_uuid: watchedCategoryUuid }));
    }
  }, [dispatch, watchedCategoryUuid]);

  useEffect(() => {
    if (watchedCategoryUuid !== selectedCategoryUuid) {
      onCategoryChange(watchedCategoryUuid);
    }
  }, [watchedCategoryUuid, selectedCategoryUuid, onCategoryChange]);

  return (
    <Box className="flex flex-col flex-1 min-h-0 px-8 pb-8 space-y-6">
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
        <Box className="flex-1 min-h-0 overflow-y-auto">
          <ListServices
            searchQuery={searchQuery}
            categoryUuid={selectedCategoryUuid}
            refreshServices={refreshServices}
          />
        </Box>
      </FormProvider>
    </Box>
  );
};

export default SearchService;
