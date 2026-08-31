import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../../components/form/textfield";
import { callSnack } from "../../../../components/snackbar";
import { createItemCategoryService as createItemCategory } from "../../../../features/inventory/create-inventory-item-category/create-inventory-item-category.service";
import type { ItemCategory } from "../../../../features/inventory/types/category.type";
import { createCategorySchema, type CreateCategoryForm } from "../schema/create-category.schema";
import type { UseFormSetValue } from "react-hook-form";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";

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
  const { control, handleSubmit, reset } = useForm<CreateCategoryForm>({
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

  const onSubmit = async (data: CreateCategoryForm) => {
    setLoading(true);
    try {
      const res = await createItemCategory({ name: data.name.trim().toLowerCase() });
      setValue("category_uuid", res?.uuid || "");
      callSnack("Category created successfully", "success");
      onSuccess(res.data || res);
      onClose();

    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      callSnack(
        err?.response?.data?.message || "Failed to create category",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Create New Category
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} id="create-category-form">
          <div className="p-6">
            <TextField
              type="text"
              identifier="create-category-name"
              name="name"
              control={control}
              label="Category Name"
              placeholder="Enter category name"
              maxLength={50}
              disabled={loading}
              pattern={VALIDATE_PATTERN.alphabetWithSpecial}
            />
          </div>

          <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-full px-6 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-category-form"
              disabled={loading}
              className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
