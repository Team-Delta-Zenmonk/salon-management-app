import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import clsx from "clsx";
import styles from "../inventory-dialog.module.scss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../../components/form/textfield";
import { callSnack } from "../../../../components/snackbar";
import { createItemCategoryService as createItemCategory } from "../../../../features/inventory/create-inventory-item-category/create-inventory-item-category.service";
import type { ItemCategory } from "../../../../features/inventory/types/category.type";
import { createCategorySchema } from "../schema/create-category.schema";
import type { UseFormSetValue } from "react-hook-form";

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (category: ItemCategory) => void;
  setValue: UseFormSetValue<{
    category_uuid: string;
  }>
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  open,
  onClose,
  onSuccess,
  setValue,
}) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ name: "" });
    }
  }, [open, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await createItemCategory({ name: data.name.trim().toLowerCase() });
      setValue("category_uuid", res?.uuid || "");
      callSnack("Category created successfully", "success");
      onSuccess(res.data || res);
      onClose();

    } catch (error: any) {
      callSnack(
        error?.response?.data?.message || "Failed to create category",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (loading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialogMd }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "primary.900",
          color: "common.white",
          py: 2,
          px: 3,
        }}
      >
        <Typography variant="titleMd" fontWeight="bold">
          Create New Category
        </Typography>
        <IconButton onClick={onClose} edge="end" size="small" disabled={loading}>
          <CloseIcon fontSize="small" sx={{ color: "common.white" }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} id="create-category-form">
        <DialogContent className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}>
          <Box className="flex flex-col gap-2 mt-2">
            <Typography variant="titleSm" fontWeight="bold">Category Name</Typography>
            <TextField
              type="text"
              identifier="create-category-name"
              name="name"
              control={control}
              label="Category Name"
              placeholder="Enter category name"
              maxLength={20}
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="create-category-form" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
