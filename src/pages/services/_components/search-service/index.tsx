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

const SearchService = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [searchQuery, setSearchQuery] = useState("");

  const categories = useAppSelector((state: RootState) => state.category.categories) ?? [];

  const methods = useForm<FilterForm>({
    defaultValues: {
      category_uuid: ALL_CATEGORIES_VALUE,
    },
  });

  const { control, watch } = methods;

  const selectedCategoryUuid = watch("category_uuid");

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
    if (selectedCategoryUuid === ALL_CATEGORIES_VALUE) {
      dispatch(listServicesAction(undefined));
    } else if (selectedCategoryUuid) {
      dispatch(listServicesAction({ category_uuid: selectedCategoryUuid }));
    }
  }, [dispatch, selectedCategoryUuid]);

  return (
    <FormProvider {...methods}>
      <Box className="space-y-6">
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

        <ListServices searchQuery={searchQuery} categoryUuid={selectedCategoryUuid} />
      </Box>
    </FormProvider>
  );
};

export default SearchService;
