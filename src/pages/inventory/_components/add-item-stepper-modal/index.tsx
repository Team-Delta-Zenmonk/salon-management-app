import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { CategorySelectionSection } from "./sections/category-selection-section";
import { ItemDetailsSection } from "./sections/item-details-section";
import type { ItemCategory } from "../../../../features/inventory/types/category.type";
import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";
import { FolderKanban, ClipboardPen, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AddItemStepperModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (item: InventoryItem) => void;
}

const AddItemStepperHeader = ({ activeStep }: { activeStep: number }) => {
  const steps = [
    {
      label: "Select Category",
      description: "Choose product group",
      icon: FolderKanban,
    },
    {
      label: "Enter Details",
      description: "Setup stock & prices",
      icon: ClipboardPen,
    },
  ];

  return (
    <div className="px-6 py-4 bg-muted/20 border-b border-border flex items-center justify-between gap-4 shrink-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        
        return (
          <div key={index} className="flex items-center gap-3 flex-1 last:flex-initial">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : isActive
                      ? "bg-background border-primary text-primary shadow-sm"
                      : "bg-background border-border text-muted-foreground/60"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <p className={`text-xs font-bold leading-none ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground/60"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium leading-none mt-1">
                  {step.description}
                </p>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-border mx-4 hidden sm:block relative">
                <div
                  className="absolute left-0 top-0 h-full bg-primary transition-all duration-500"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const AddItemStepperModal: React.FC<AddItemStepperModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedCategory(null);
    onClose();
  };

  const handleSuccess = (item: InventoryItem) => {
    onSuccess(item);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden rounded-2xl gap-0 flex flex-col max-h-[90vh] border border-border/80 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0 bg-background/50 backdrop-blur-xs">
          <DialogTitle className="text-lg font-bold text-foreground">
            Add New Item
          </DialogTitle>
        </DialogHeader>

        <AddItemStepperHeader activeStep={activeStep} />

        <div className="flex-1 overflow-y-auto relative min-h-[420px] bg-background">
          <AnimatePresence mode="wait" initial={false}>
            {activeStep === 0 ? (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <CategorySelectionSection
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  onNext={handleNext}
                  onClose={handleClose}
                />
              </motion.div>
            ) : (
              selectedCategory && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="h-full w-full"
                >
                  <ItemDetailsSection
                    selectedCategory={selectedCategory}
                    onBack={handleBack}
                    onSuccess={handleSuccess}
                    onClose={handleClose}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
