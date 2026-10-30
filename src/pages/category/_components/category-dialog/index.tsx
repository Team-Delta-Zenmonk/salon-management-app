import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { categorySchema, type categoryForm } from "../schema/create-category.schema";
import TextField from "../../../../components/form/textfield";
import FilePicker from "../../../../components/form/file-picker";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { FIELD_LIMITS } from "../../../../common/field-limits";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import { useAppDispatch } from "../../../../store/hooks";
import { updateCategoryAction } from "../../../../features/category/update-category/update-category.action";
import { callSnack } from "../../../../components/snackbar";
import { useEffect, useState, useMemo } from "react";
import { isFormChanged } from "../../../../common/utils/is-form-changed";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { createCategoryService } from "../../../../features/category/create-category/create-categories.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Loader2 } from "lucide-react";

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  category?: any;
}

export default function CategoryDialog({ open, onClose, mode, category }: Readonly<CategoryDialogProps>) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<categoryForm | null>(null);

  const methods = useForm<categoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      logo: undefined,
    },
  });

  const { handleSubmit, control, reset, watch, setError } = methods;

  const currentValues = watch();
  const isChanged = useMemo(
    () => mode === "create" || isFormChanged(initialValues, currentValues),
    [mode, initialValues, currentValues]
  );

  useEffect(() => {
    if (!open) return;

    if (mode === "update" && category) {
      const defaults = { name: category?.name || "", description: category?.description || "", logo: undefined };
      setInitialValues(defaults);
      reset(defaults);
    } else {
      const defaults = { name: "", description: "", logo: undefined };
      setInitialValues(null);
      reset(defaults);
    }
  }, [open, mode, category, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (mode === "update" && !isChanged) return;
    try {
      setIsLoading(true);

      const logoUrl = data.logo?.url || (mode === "update" && category?.logo ? category.logo : undefined);

      if (mode === "create") {
        await createCategoryService({
          name: data?.name?.trim(),
          description: data?.description || undefined,
          logo: logoUrl || undefined,
        });
        await dispatch(listCategoriesAction({ page: 1, limit: 10 })).unwrap();

        callSnack("Category created successfully", "success");
      } else {
        await dispatch(
          updateCategoryAction({
            uuid: category?.uuid,
            body: {
              name: data?.name?.trim(),
              description: data?.description || undefined,
              logo: logoUrl || undefined,
            },
          })
        ).unwrap();

        callSnack("Category updated successfully", "success");
      }

      onClose();
    } catch (err: any) {
      const errorMessage =
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        err?.response?.data?.message ||
        err?.message ||
        "Category with this name already exists";

      setError("name", {
        type: "manual",
        message: errorMessage,
      });
      callSnack(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === "create" ? "Create Category" : "Update Category"}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col py-5 px-6 gap-5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
              <TextField
                type="text"
                label="Category Name"
                name="name"
                control={control}
                identifier="category-name"
                pattern={VALIDATE_PATTERN.alphabetWithSpecial}
                disabled={isLoading}
                maxLength={FIELD_LIMITS.ITEM_NAME}
              />

              <TextField
                type="text"
                label="Description"
                name="description"
                control={control}
                identifier="category-description"
                disabled={isLoading}
                pattern={VALIDATE_PATTERN.alphabetWithSpecial}
                maxLength={FIELD_LIMITS.DESCRIPTION}
                multiline
              />

              <div className="flex flex-col gap-1.5">
                <FilePicker
                  name="logo"
                  control={control}
                  identifier="category-logo"
                  label="Logo (Optional)"
                  uploadFn={uploadImages}
                  disabled={isLoading}
                />

                {mode === "update" && category?.logo && (
                  <span className="text-xs text-muted-foreground mt-1">
                    Current logo already uploaded. Upload a new one to replace.
                  </span>
                )}
              </div>
            </div>

            <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                variant="outline"
                className="rounded-full px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (mode === "update" && !isChanged)}
                className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? (isLoading ? "Creating..." : "Create Category") : (isLoading ? "Saving..." : "Save Category")}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
