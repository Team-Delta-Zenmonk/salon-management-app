import { useState } from "react";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store/store";
import { deleteCategoryAction } from "../../../../features/category/delete-category/delete-category.action";
import { callSnack } from "../../../../components/snackbar";
import CategoryDialog from "../category-dialog";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import type { Category } from "../../../../features/category/category.slice";
import DeleteDialog from "../../../../components/delete-dialog";

interface ListCategoriesProps {
  categories: Category[];
}

export default function ListCategories({ categories }: ListCategoriesProps) {
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
      await dispatch(deleteCategoryAction(deletingCategory.uuid)).unwrap();
      await dispatch(listCategoriesAction());
      callSnack("Category deleted successfully", "success");
    } catch {
      callSnack("Failed to delete category", "error");
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
      <Box>
        <Box className="text-(--primary-900) mb-4">Categories List ({categories.length})</Box>

        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Box
              key={category.uuid}
              className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <Box className="flex items-start justify-between mb-4">
                <Box className="flex items-center gap-4">
                  <Box>
                    <Avatar src={category.logo} alt={category.name} />
                  </Box>
                  <Box>
                    <Typography className="text-(--primary-900)" fontWeight="bold">
                      {category.name}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="text-gray-600 mb-4">{category.description}</Box>

              <Box className="flex items-center justify-between pt-4 border-t border-blue-100">
                <Box className="text-gray-500">Created On: {dayjs(category.created_at).format("MMM DD, YYYY")}</Box>
                <Box className="flex gap-2">
                  <IconButton
                    aria-label="edit"
                    onClick={() => handleUpdateClick(category)}
                    disabled={Boolean(deletingCategory)}
                  >
                    <ModeEditOutlineOutlinedIcon className="text-(--primary-800)!" />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDeleteClick(category)} disabled={deleteLoading}>
                    <DeleteOutlinedIcon className="text-(--error-800)!" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {categories.length === 0 && (
          <Box className="bg-gray-200 border border-gray-400 rounded-lg p-8 text-center">
            <Typography>Create your first category</Typography>
          </Box>
        )}
      </Box>

      {updateCategory && (
        <CategoryDialog open={editOpen} onClose={handleCloseEdit} mode="update" category={updateCategory} />
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
