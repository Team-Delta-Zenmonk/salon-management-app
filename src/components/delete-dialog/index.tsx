import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  itemName: string;
  isLoading: boolean;
  onDelete: () => void | Promise<void>;
}

export default function DeleteDialog({
  open,
  onClose,
  title = "Delete Item?",
  itemName,
  isLoading,
  onDelete,
}: Readonly<DeleteDialogProps>) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isLoading) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete <strong className="text-foreground font-semibold">"{itemName}"</strong>? This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={onDelete}
            disabled={isLoading}
            className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
