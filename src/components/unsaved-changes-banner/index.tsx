import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RotateCcw, Save, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface UnsavedChangesBannerProps {
  isDirty: boolean;
  message?: string;
  isSaving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesBanner = ({
  isDirty,
  message = "Save to apply updates to your workspace",
  isSaving = false,
  onSave,
  onDiscard,
}: UnsavedChangesBannerProps) => {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[90%] max-w-xl"
        >
          <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground">You have unsaved changes</p>
                <p className="text-[10px] text-muted-foreground truncate">{message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onDiscard}
                disabled={isSaving}
                className="flex-1 sm:flex-initial text-[11px] font-bold text-muted-foreground hover:text-foreground h-8 px-3 rounded-full cursor-pointer justify-center"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Discard
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 sm:flex-initial text-[11px] font-bold rounded-full h-8 px-4 shadow-md shadow-primary/20 hover:opacity-95 cursor-pointer bg-primary text-primary-foreground justify-center"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
