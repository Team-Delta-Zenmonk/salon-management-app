import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import styles from "../../../inventory-dialog.module.scss";
import TextField from "../../../../../../components/form/textfield";
import Select from "../../../../../../components/form/select";
import FilePicker from "../../../../../../components/form/file-picker";
import { uploadImages } from "../../../../../../features/upload-images/upload-images.service";
import { callSnack } from "../../../../../../components/snackbar";
import { createInventoryItemService as createInventoryItem } from "../../../../../../features/inventory/create-inventory-item/create-inventory-item.service";
import type { ItemCategory } from "../../../../../../features/inventory/types/category.type";
import { inventoryItemSchema } from "../../../schema/inventory-item.schema";
import { VALIDATE_PATTERN } from "../../../../../../common/validate-pattern";

interface ItemDetailsSectionProps {
  selectedCategory: ItemCategory | null;
  onBack: () => void;
  onSuccess: (item: any) => void;
  onClose: () => void;
  activeStep: number;
  steps: string[];
}

const ITEM_TYPES = [
  { label: "Product", value: "product" },
  { label: "Equipment", value: "equipment" },
];

const UNITS = ["ml", "l", "g", "kg", "pieces", "box", "bottle", "tube"].map((u) => ({
  label: u,
  value: u,
}));

export const ItemDetailsSection: React.FC<ItemDetailsSectionProps> = ({
  selectedCategory,
  onBack,
  onSuccess,
  onClose,
  activeStep,
  steps,
}) => {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      brand: "",
      variant_name: "",
      unit: "",
      unit_price: 0,
      item_type: "product",
      logo: null as any,
      min_stock_level: 0,
    },
  });

  const onSubmit = async (data: any) => {
    if (!selectedCategory) {
      callSnack("Please select a category first", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: data.name.trim().toLowerCase(),
        brand: data.brand.trim().toLowerCase(),
        category_id: selectedCategory.uuid,
        item_type: data.item_type?.trim().toLowerCase(),
        logo: data.logo?.url || undefined,
        variant_name: data.variant_name?.trim().toLowerCase() || undefined,
        unit: data.unit?.trim().toLowerCase() || undefined,
        unit_price: Number(data.unit_price),
        min_stock_level: Number(data.min_stock_level) || 0,
      };

      const res = await createInventoryItem(payload);
      callSnack("Inventory item created successfully", "success");
      onSuccess(res.data || res);
      onClose();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        callSnack("Item already exists in inventory", "error");
      } else {
        callSnack(
          error?.response?.data?.message || "Failed to create inventory item",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogContent className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}>
        <Typography variant="paragraphMd" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
          Category: <strong>{selectedCategory?.name}</strong>
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} id="add-item-form">
          <Box display="flex" flexDirection="column" gap={3}>
            <Box className="flex flex-col gap-2">
              <Typography variant="titleSm" fontWeight="bold">Item Name</Typography>
              <TextField
                type="text"
                identifier="add-item-name"
                name="name"
                control={control}
                label="Item Name"
                placeholder="e.g., Haircare Shampoo"
                maxLength={50}
                disabled={loading}
                pattern={VALIDATE_PATTERN.alphabetWithSpecial}
              />
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography variant="titleSm" fontWeight="bold">Brand Name</Typography>
              <TextField
                type="text"
                identifier="add-item-brand"
                name="brand"
                control={control}
                label="Brand Name"
                placeholder="e.g., BrandName"
                maxLength={50}
                disabled={loading}
                pattern={VALIDATE_PATTERN.alphabetWithSpecial}
              />
            </Box>

            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
              <Box flex={1} className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Item Type</Typography>
                <Select
                  name="item_type"
                  control={control}
                  placeholder="Item Type"
                  identifier="add-item-type"
                  options={ITEM_TYPES}
                  disabled={loading}
                />
              </Box>

              <Box flex={1} className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Item Image (optional)</Typography>
                <FilePicker
                  name="logo"
                  control={control}
                  identifier="add-item-logo"
                  label="Item Image"
                  uploadFn={uploadImages}
                  disabled={loading}
                />
              </Box>
            </Box>

            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
              <Box flex={1} className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Variant / Size</Typography>
                <TextField
                  type="text"
                  identifier="add-item-variant"
                  name="variant_name"
                  control={control}
                  label="Variant / Size"
                  placeholder="e.g., 500ml / Large"
                  maxLength={5}
                  disabled={loading}
                />
              </Box>

              <Box flex={1} className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Unit</Typography>
                <Select
                  name="unit"
                  control={control}
                  placeholder="Select Unit"
                  identifier="add-item-unit"
                  options={UNITS}
                  disabled={loading}
                />
              </Box>
            </Box>

            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
              <Box flex={1} className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Unit Price</Typography>
                <TextField
                  type="number"
                  identifier="add-item-unit-price"
                  name="unit_price"
                  control={control}
                  label="Unit Price"
                  disabled={loading}
                />
              </Box>

              <Box flex={1} className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Minimum Stock Level</Typography>
                <TextField
                  type="number"
                  identifier="add-item-min-stock"
                  name="min_stock_level"
                  control={control}
                  label="Minimum Stock Level"
                  disabled={loading}
                />
              </Box>
            </Box>
          </Box>
        </form>
      </DialogContent>

      <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
        <Button onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="submit" form="add-item-form" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </>
  );
};
