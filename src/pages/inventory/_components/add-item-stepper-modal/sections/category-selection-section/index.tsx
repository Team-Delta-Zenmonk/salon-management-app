import React, { useState, useCallback, useEffect } from "react";
import { Button } from "../../../../../../components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { CreateCategoryModal } from "../../../create-category-modal";
import { callSnack } from "../../../../../../components/snackbar";
import type { ItemCategory } from "../../../../../../features/inventory/types/category.type";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import { fetchItemCategoriesAction } from "../../../../../../features/inventory/list-inventory-items-category/list-inventory-items-category.action";

interface CategorySelectionSectionProps {
  selectedCategory: ItemCategory | null;
  onCategorySelect: (category: ItemCategory) => void;
  onNext: () => void;
  onClose: () => void;
}

export const CategorySelectionSection: React.FC<CategorySelectionSectionProps> = ({
  selectedCategory,
  onCategorySelect,
  onNext,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const {
    data: categories,
    total,
    page,
  } = useAppSelector((state) => state.itemsCategory);
  const [loading, setLoading] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const { setValue } = useForm({
    defaultValues: {
      category_uuid: selectedCategory?.uuid || "",
    },
  });

  const fetchCategories = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        await dispatch(
          fetchItemCategoriesAction({
            page: pageNum,
            limit: 12, // slightly larger limit to fit grid nicely
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
    if (categories.length === 0) {
      fetchCategories(1);
    }
  }, [categories.length, fetchCategories]);

  const handleLoadMore = () => {
    if (categories.length < total) {
      fetchCategories(page + 1);
    }
  };

  return (
    <>
      <div className="p-6 pb-24 flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-base text-foreground">Select Product Category</h3>
          <p className="text-xs text-muted-foreground">
            Choose a category to organize this inventory item.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Create New Category Card */}
          <button
            type="button"
            onClick={() => setCreateCategoryOpen(true)}
            className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-border/85 hover:border-primary/50 hover:bg-primary/[0.02] rounded-2xl transition-all duration-300 group text-center cursor-pointer min-h-[130px] gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-foreground/80 group-hover:text-primary transition-colors">
              Create New Category
            </div>
          </button>

          {/* List existing Categories */}
          {categories.map((category) => {
            const isSelected = selectedCategory?.uuid === category.uuid;
            return (
              <button
                key={category.uuid}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className={`flex flex-col items-center justify-center p-5 border rounded-2xl transition-all duration-300 text-center cursor-pointer min-h-[130px] gap-3 group relative overflow-hidden ${
                  isSelected
                    ? "border-primary bg-primary/[0.03] text-primary shadow-sm"
                    : "border-border bg-card/45 hover:bg-muted/40 hover:border-border/100"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isSelected 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted/50 text-muted-foreground group-hover:text-foreground group-hover:bg-muted/75"
                }`}>
                  {category.name ? category.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className={`font-bold text-xs transition-colors truncate max-w-full px-2 ${
                  isSelected ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                }`}>
                  {category.name}
                </div>
              </button>
            );
          })}
        </div>

        {categories.length < total && (
          <div className="flex justify-center mt-2">
            <Button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-full px-4"
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-2 shrink-0">
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="font-bold rounded-full">
          Cancel
        </Button>
        <Button type="button" onClick={onNext} disabled={!selectedCategory || loading} className="font-bold px-6 rounded-full">
          Next
        </Button>
      </div>

      <CreateCategoryModal
        open={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        onSuccess={handleCreateCategorySuccess}
        setValue={setValue}
      />
    </>
  );
};
