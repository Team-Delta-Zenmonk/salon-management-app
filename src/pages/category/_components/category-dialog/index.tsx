import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress } from "@mui/material";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { categorySchema, type categoryForm } from "../schema/create-category.schema";
import TextField from "../../../../components/form/textfield";
import FilePicker from "../../../../components/form/file-picker";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import { useAppDispatch } from "../../../../store/hooks";
import { updateCategoryAction } from "../../../../features/category/update-category/update-category.action";
import { callSnack } from "../../../../components/snackbar";
import styles from "./category-dialog.module.scss";
import { useEffect, useState } from "react";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { createCategoryService } from "../../../../features/category/create-category/create-categories.service";

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  category?: any;
}

export default function CategoryDialog({ open, onClose, mode, category }: Readonly<CategoryDialogProps>) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<categoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      logo: undefined,
    },
  });

  const { handleSubmit, control, reset } = methods;

  useEffect(() => {
    if (!open) return;

    if (mode === "update" && category) {
      reset({ name: category?.name, description: category?.description, logo: undefined });
    } else {
      reset({ name: "", description: "", logo: undefined });
    }
  }, [open, mode, category, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      const logoUrl = data.logo?.url || (mode === "update" ? category.logo : undefined);

      if (mode === "create") {
        await createCategoryService({
          name: data?.name,
          description: data?.description,
          logo: logoUrl
        });
        await dispatch(listCategoriesAction({ page: 1, limit: 10 })).unwrap();

        callSnack("Category created successfully", "success");
      } else {
        await dispatch(
          updateCategoryAction({
            uuid: category?.uuid,
            body: {
              name: data?.name,
              description: data?.description,
              logo: logoUrl
            },
          })
        ).unwrap();

        callSnack("Category updated successfully", "success");
      }

      onClose();
    } catch (err: any) {
      callSnack(err?.response?.data?.message || "Category with this name already exists", "error");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle
        className={clsx(styles.dialogTitle)}
        id="alert-dialog-title"
        fontWeight="fontWeightMedium"
        variant="h5"
      >
        {mode === "create" ? "Create Category" : "Update Category"}
      </DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogContent
            className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}
            id="alert-dialog-description"
          >
            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Category Name</Typography>
              <TextField
                type="text"
                label="Category Name"
                name="name"
                control={control}
                identifier="category-name"
                pattern={VALIDATE_PATTERN.alphaNumericSpecialWithSpace}
                disabled={isLoading}
                maxLength={30}
              />
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Description</Typography>
              <TextField
                type="text"
                label="Description"
                name="description"
                control={control}
                identifier="category-description"
                disabled={isLoading}
                pattern={VALIDATE_PATTERN.alphabet}
                maxLength={100}
              />
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Logo</Typography>
              <FilePicker
                name="logo"
                control={control}
                identifier="category-logo"
                label="Logo (Optional)"
                uploadFn={uploadImages}
                disabled={isLoading}
              />

              {mode === "update" && category.logo && (
                <Typography variant="caption" className="text-gray-500">
                  Current logo already uploaded. Upload a new one to replace.
                </Typography>
              )}
            </Box>
          </DialogContent>

          <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
            <Button onClick={onClose} disabled={isLoading}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {mode === "create" ? (isLoading ? "Creating..." : "Create") : (isLoading ? "Saving..." : "Save")}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
