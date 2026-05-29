import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StepperHeader from "../../../../components/stepper";
import styles from "../inventory-dialog.module.scss";
import { CategorySelectionSection } from "./sections/category-selection-section";
import { ItemDetailsSection } from "./sections/item-details-section";
import type { ItemCategory } from "../../../../features/inventory/types/category.type";

interface AddItemStepperModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (item: any) => void;
}

const STEPS = ["Select Category", "Enter Item Details"];

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

  const handleSuccess = (item: any) => {
    onSuccess(item);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        handleClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialogLg }}
      slotProps={{
        paper: {
          sx: {
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 3,
        }}
      >
        <Typography variant="titleMd" fontWeight="bold" color="primary.900">
          Add New Item
        </Typography>
        <IconButton onClick={handleClose} edge="end" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <StepperHeader
        steps={STEPS.map((label) => ({ label }))}
        activeStep={activeStep}
      />

      {activeStep === 0 && (
        <CategorySelectionSection
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onNext={handleNext}
          onClose={handleClose}
          activeStep={activeStep}
          steps={STEPS}
        />
      )}

      {activeStep === 1 && selectedCategory && (
        <ItemDetailsSection
          selectedCategory={selectedCategory}
          onBack={handleBack}
          onSuccess={handleSuccess}
          onClose={handleClose}
          activeStep={activeStep}
          steps={STEPS}
        />
      )}
    </Dialog>
  );
};
