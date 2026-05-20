import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  DialogContent,
  DialogActions,
} from "@mui/material";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import Select from "../../../../components/form/select";
import styles from "../inventory-dialog.module.scss";
import { CreateCategoryModal } from "../CreateCategoryModal";
import { callSnack } from "../../../../components/snackbar";
import type { ItemCategory } from "../../../../features/inventory/types/category.type";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchItemCategoriesAction } from "../../../../features/inventory/list-items-category/list-items-category.action";

interface CategorySelectionStepProps {
  selectedCategory: ItemCategory | null;
  onCategorySelect: (category: ItemCategory) => void;
  onNext: () => void;
  onClose: () => void;
  activeStep: number;
  steps: string[];
}

export const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
  selectedCategory,
  onCategorySelect,
  onNext,
  onClose,
  activeStep,
  steps,
}) => {
  const dispatch = useAppDispatch();
  const {
    data: categories,
    total,
    page,
  } = useAppSelector((state) => state.itemsCategory);
  const [loading, setLoading] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const { control, watch, setValue } = useForm({
    defaultValues: {
      category_uuid: selectedCategory?.uuid || "",
    },
  });

  const categoryUuid = watch("category_uuid");

  const fetchCategories = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        await dispatch(
          fetchItemCategoriesAction({
            page: pageNum,
            limit: 10,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to fetch categories", error);
        callSnack("Failed to fetch categories", "error");
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories(1);
    }
  }, [fetchCategories, categories.length]);

  const handleCategorySelect = (category: ItemCategory) => {
    onCategorySelect(category);
  };

  const handleCreateCategorySuccess = async (newCategory: ItemCategory) => {
    onCategorySelect(newCategory);
    setCreateCategoryOpen(false);

    setLoading(true);
    try {
      await dispatch(fetchItemCategoriesAction({ page: 1, limit: 100 })).unwrap();
    } catch (error) {
      console.error("Failed to refresh categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryUuid) {
      if (categoryUuid === "create_new") {
        setCreateCategoryOpen(true);
      } else {
        const found = categories.find((cat) => cat.uuid === categoryUuid);
        if (found) {
          handleCategorySelect(found);
        }
      }
    } else {
      onCategorySelect(null as any);
    }
  }, [categoryUuid, categories]);

  useEffect(() => {
    setValue("category_uuid", selectedCategory?.uuid || "");
  }, [selectedCategory?.uuid, setValue]);

  const categoryOptions = [
    { value: "create_new", label: "+ Create New Category" },
    ...categories.map((cat) => ({
      value: cat.uuid,
      label: cat.name,
      ...cat,
    })),
  ] as any[];

  const handleLoadMore = () => {
    if (categories.length < total) {
      fetchCategories(page + 1);
    }
  };

  return (
    <>
      <DialogContent className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}>
        <Box className="flex flex-col gap-2 mt-2">
          <Typography fontWeight="bold" variant="titleSm">Select or Create Category</Typography>
          <Typography variant="paragraphSm" color="text.secondary" sx={{ mb: 1 }}>
            Select a category or create a new one
          </Typography>

          <Select
            name="category_uuid"
            control={control}
            placeholder="Select Category"
            identifier="item-category-select"
            options={categoryOptions}
            disabled={loading}
          />
        </Box>

        {categories.length < total && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outlined"
              size="small"
              sx={{ fontSize: "14px", fontWeight: 600 }}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onNext} disabled={!selectedCategory || loading}>
          Next
        </Button>
      </DialogActions>

      <CreateCategoryModal
        open={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        onSuccess={handleCreateCategorySuccess}
        setValue={setValue}
      />
    </>
  );
};
