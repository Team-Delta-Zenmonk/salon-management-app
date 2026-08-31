import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { PredefinedCategory } from "../../predefine-categories.type";
import { useAppDispatch } from "../../../../../../store/hooks";
import { createCategoryService } from "../../../../../../features/category/create-category/create-categories.service";
import { listCategoriesAction } from "../../../../../../features/category/list-categories/list-categories.action";
import { callSnack } from "../../../../../../components/snackbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../../../components/ui/dialog";
import { Button } from "../../../../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../../../../components/ui/avatar";

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
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-3xl">{category.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-primary mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>
          <div className="border-t border-border" />

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-primary">
              <strong>Note:</strong> Clicking "Create Category" will add this category to your categories list with the
              predefined name and description.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} disabled={isLoading} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
