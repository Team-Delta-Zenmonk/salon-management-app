import { useState } from "react";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Box, Typography, IconButton, Avatar, CircularProgress } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store/store";
import { deleteCategoryService } from "../../../../features/category/delete-category/delete-category.service";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { callSnack } from "../../../../components/snackbar";
import CategoryDialog from "../category-dialog";
import type { Category } from "../../../../features/category/category.slice";
import DeleteDialog from "../../../../components/delete-dialog";
interface ListCategoriesProps {
  categories: Category[];
  total: number;
  hasMore: boolean;
  fetchMoreCategories: () => void;
  searchQuery: string;
}

export default function ListCategories({
  categories,
  total,
  hasMore,
  fetchMoreCategories,
  searchQuery,
}: Readonly<ListCategoriesProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [updateCategory, setUpdateCategory] = useState<Category | null>(null);

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      setDeleteLoading(true);
      await deleteCategoryService(deletingCategory.uuid);
      await dispatch(listCategoriesAction({ page: 1, limit: 10, search: searchQuery.trim() || undefined, })).unwrap();
      callSnack("Category deleted successfully", "success");
    } catch (err: any) {
      callSnack(err?.response?.data?.message || "Failed to delete category", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
    }
  };

  const handleUpdateClick = (category: Category) => {
    setUpdateCategory(category);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setUpdateCategory(null);
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  return (
    <>
      <Box className="text-[var(--text-muted)] mb-4 font-semibold text-sm uppercase tracking-wider">
        Categories List ({total})
      </Box>

      <InfiniteScroll
        dataLength={categories.length}
        next={fetchMoreCategories}
        hasMore={hasMore}
        loader={
          <Box className="flex justify-center py-4">
            <CircularProgress size={24} />
          </Box>
        }
        scrollableTarget="scrollableDiv"
        endMessage={
          categories.length > 0 ? (
            <Box className="text-center py-4 text-[var(--text-muted)]">
              <Typography variant="body2">No more categories to load</Typography>
            </Box>
          ) : null
        }
      >
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Box
              key={category.uuid}
              className="bg-[var(--surface)] rounded-[20px] shadow-sm border border-[var(--border-subtle)] relative flex flex-col overflow-hidden"
            >
              <Box className="p-6 flex-1 flex flex-col">
                <Box className="flex items-center gap-4 mb-4">
                  <Box className="w-12 h-12 rounded-full bg-[#FFEDD5] text-[#1E293B] flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden border border-[#FDBA74] shadow-sm">
                    {category.logo ? (
                      <img src={category.logo} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      category.name.substring(0, 1).toUpperCase()
                    )}
                  </Box>
                  <Typography className="text-[var(--text-primary)] capitalize text-lg truncate" fontWeight={700}>
                    {category.name}
                  </Typography>
                </Box>

                <Typography className="text-[var(--text-muted)] text-sm line-clamp-2 leading-relaxed mb-6">
                  {category.description || "No description available."}
                </Typography>

                <Box className="flex items-center justify-between pt-5 border-t border-dashed border-[var(--border-subtle)] mt-auto">
                  <Typography className="text-[var(--text-muted)] text-xs font-bold">
                    {dayjs(category.created_at).format("MMM DD, YYYY")}
                  </Typography>
                  <Box className="flex gap-2">
                    <IconButton
                      size="medium"
                      aria-label="edit"
                      onClick={() => handleUpdateClick(category)}
                      disabled={deleteLoading}
                      className="text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-xl"
                    >
                      <ModeEditOutlineOutlinedIcon />
                    </IconButton>
                    <IconButton
                      size="medium"
                      aria-label="delete"
                      onClick={() => handleDeleteClick(category)}
                      disabled={deleteLoading}
                      className="text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-xl"
                    >
                      <DeleteOutlinedIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </InfiniteScroll>

      {categories.length === 0 && (
        <Box className="bg-[var(--surface-muted)] border border-dashed border-[var(--border-subtle)] rounded-[20px] p-10 text-center mt-4">
          <Typography className="text-[var(--text-muted)] font-medium">No categories found. Create your first category!</Typography>
        </Box>
      )}

      {updateCategory && (
        <CategoryDialog
          open={editOpen}
          onClose={handleCloseEdit}
          mode="update"
          category={updateCategory}
        />
      )}

      {deletingCategory && (
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={handleCloseDelete}
          title="Delete Category?"
          itemName={deletingCategory.name}
          isLoading={deleteLoading}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  );
}