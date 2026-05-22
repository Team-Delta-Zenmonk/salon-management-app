import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Avatar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import styles from "./confirm-predefine-dialog.module.scss";
import type { PredefinedCategory } from "../../predefine-categories.type";
import { useAppDispatch } from "../../../../../../store/hooks";
import { createCategoryService } from "../../../../../../features/category/create-category/create-categories.service";
import { listCategoriesAction } from "../../../../../../features/category/list-categories/list-categories.action";
import { callSnack } from "../../../../../../components/snackbar";

interface PredefinedCategoryDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  category: PredefinedCategory;
}

export default function PredefinedCategoryDetailsDialog({ open, onClose, category }: Readonly<PredefinedCategoryDetailsDialogProps>) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setIsLoading(true);

      await createCategoryService({
        name: category.name,
        description: category.description,
        logo: category.logo,
      });
      await dispatch(listCategoriesAction({ page: 1, limit: 20 })).unwrap();
      callSnack("Category created successfully", "success");
      onClose();
    } catch (err: any) {
      callSnack(err?.response?.data?.message || "Category with this name already exists", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={styles.dialogTitle} fontWeight="fontWeightMedium" variant="h5">
        <Box className="flex justify-between items-center">
          <Typography variant="h5" fontWeight="fontWeightMedium">
            Category Details
          </Typography>
          <IconButton onClick={onClose} size="small" disabled={isLoading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <Box className="flex flex-col gap-6 py-4">
          <Box className="flex items-center gap-4">
            <Avatar src={category.logo} alt={category.name} sx={{ width: 80, height: 80 }} />
            <Box className="flex-1">
              <Typography variant="h6" fontWeight="bold" className="text-(--primary-900) mb-1">
                {category.name}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {category.description}
              </Typography>
            </Box>
          </Box>
          <Box className="border-t border-gray-300" />

          <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Typography variant="body2" className="text-blue-900">
              <strong>Note:</strong> Clicking "Create Category" will add this category to your categories list with the
              predefined name, description, and logo.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} disabled={isLoading} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={isLoading} loading={isLoading} variant="contained">
          Create Category
        </Button>
      </DialogActions>
    </Dialog>
  );
}
