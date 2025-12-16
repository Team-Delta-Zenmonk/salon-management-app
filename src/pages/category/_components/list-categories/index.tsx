import { useState } from "react";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Box, Typography, IconButton } from "@mui/material";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store/store";
import { deleteCategoryAction } from "../../../../features/category/delete-category/delete-category.action";
import { callSnack } from "../../../../components/snackbar";
import CategoryDialog from "../category-dialog";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import type { Category } from "../../../../features/category/category.slice";

interface ListCategoriesProps {
  categories: Category[];
}

export default function ListCategories({ categories }: ListCategoriesProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [updateCategory, setUpdateCategory] = useState<Category | null>(null);

  const handleDelete = async (uuid: string) => {
    try {
      setDeletingUuid(uuid);
      await dispatch(deleteCategoryAction(uuid)).unwrap();
      await dispatch(listCategoriesAction());
      callSnack("Category deleted successfully", "success");
    } catch {
      callSnack("Failed to delete category", "error");
    } finally {
      setDeletingUuid(null);
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

  return (
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
                  <img src={category.logo} alt={category.name} className="w-15 h-15 rounded-full object-cover" />
                </Box>
                <Box>
                  <Typography className="text-(--primary-900)">{category.name}</Typography>
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
                  disabled={Boolean(deletingUuid)}
                >
                  <ModeEditOutlineOutlinedIcon className="text-(--primary-800)!" />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDelete(category.uuid)}
                  disabled={deletingUuid === category.uuid}
                >
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

      {updateCategory && (
        <CategoryDialog open={editOpen} onClose={handleCloseEdit} mode="update" category={updateCategory} />
      )}
    </Box>
  );
}
