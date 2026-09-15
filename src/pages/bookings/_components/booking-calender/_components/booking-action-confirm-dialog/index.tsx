import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../../../components/ui/dialog";
import { Button } from "../../../../../../components/ui/button";
import { Loader2 } from "lucide-react";

type BookingActionConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText: string;
  cancelText?: string;
  isLoading?: boolean;
};

export default function BookingActionConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Keep booking",
  isLoading = false,
}: Readonly<BookingActionConfirmDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border border-border shadow-2xl p-6 gap-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="mb-3">
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground leading-relaxed pb-6">
          {description}
        </div>
        <DialogFooter className="pt-4 border-t bg-muted/10 gap-3 flex flex-row items-center justify-end -mx-6 -mb-6 px-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-1/2 sm:w-auto flex-1 sm:flex-none rounded-full h-10 px-5"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-1/2 sm:w-auto flex-1 sm:flex-none rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold gap-2 h-10 px-5 transition-colors shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-destructive-foreground" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
