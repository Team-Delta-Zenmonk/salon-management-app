import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { categorySchema, type categoryForm } from "../schema/create-category.schema";
import TextField from "../../../../components/form/textfield";
import FilePicker from "../../../../components/form/file-picker";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import { useAppDispatch } from "../../../../store/hooks";
import { updateCategoryAction } from "../../../../features/category/update-category/update-category.action";
import { callSnack } from "../../../../components/snackbar";
import { useEffect, useState } from "react";
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
          name: data?.name?.trim().toLowerCase(),
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
              name: data?.name?.trim().toLowerCase(),
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
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === "create" ? "Create Category" : "Update Category"}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            {/* Scrollable body */}
            <div className="flex flex-col py-5 px-6 gap-5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
              <TextField
                type="text"
                label="Category Name"
                name="name"
                control={control}
                identifier="category-name"
                pattern={VALIDATE_PATTERN.alphabetWithSpecial}
                disabled={isLoading}
                maxLength={50}
              />

              <TextField
                type="text"
                label="Description"
                name="description"
                control={control}
                identifier="category-description"
                disabled={isLoading}
                pattern={VALIDATE_PATTERN.alphabetWithSpecial}
                maxLength={100}
                multiline
                rows={3}
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

            {/* Footer */}
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
                disabled={isLoading}
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
