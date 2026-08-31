import React, { useState } from "react";
import { Button } from "../../../../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../../../../components/form/textfield";
import Select from "../../../../../../components/form/select";
import FilePicker from "../../../../../../components/form/file-picker";
import { uploadImages } from "../../../../../../features/upload-images/upload-images.service";
import { callSnack } from "../../../../../../components/snackbar";
import { createInventoryItemService as createInventoryItem } from "../../../../../../features/inventory/create-inventory-item/create-inventory-item.service";
import type { ItemCategory } from "../../../../../../features/inventory/types/category.type";
import { inventoryItemSchema, type InventoryItemForm } from "../../../schema/inventory-item.schema";
import type { InventoryItem } from "../../../../../../features/inventory/inventory-item.slice";
import { VALIDATE_PATTERN } from "../../../../../../common/validate-pattern";

interface ItemDetailsSectionProps {
  selectedCategory: ItemCategory;
  onBack: () => void;
  onSuccess: (item: InventoryItem) => void;
  onClose: () => void;
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
}) => {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<InventoryItemForm>({
    resolver: zodResolver(inventoryItemSchema) as unknown as Resolver<InventoryItemForm>,
    defaultValues: {
      name: "",
      brand: "",
      variant_name: "",
      unit: "",
      unit_price: 0,
      item_type: "product",
      logo: null as { url: string; filename?: string } | null,
      min_stock_level: 0,
    },
  });

  const onSubmit = async (data: InventoryItemForm) => {
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
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 409) {
        callSnack("Item already exists in inventory", "error");
      } else {
        callSnack(
          err?.response?.data?.message || "Failed to create inventory item",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 pb-24">
        {/* Modern Category Badge */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organizing in:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {selectedCategory?.name}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} id="add-item-form">
          <div className="flex flex-col gap-5">
            {/* Row 1: Name & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Row 2: Type & Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Select
                name="item_type"
                control={control}
                placeholder="Item Type"
                identifier="add-item-type"
                label="Item Type"
                options={ITEM_TYPES}
                disabled={loading}
              />

              <FilePicker
                name="logo"
                control={control}
                identifier="add-item-logo"
                label="Item Image (optional)"
                uploadFn={uploadImages}
                disabled={loading}
              />
            </div>

            {/* Row 3: Variant & Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <Select
                name="unit"
                control={control}
                placeholder="Select Unit"
                identifier="add-item-unit"
                label="Unit"
                options={UNITS}
                disabled={loading}
              />
            </div>

            {/* Row 4: Pricing & Stock Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                type="number"
                identifier="add-item-unit-price"
                name="unit_price"
                control={control}
                label="Unit Price (₹)"
                disabled={loading}
              />

              <TextField
                type="number"
                identifier="add-item-min-stock"
                name="min_stock_level"
                control={control}
                label="Minimum Stock Level"
                disabled={loading}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/20 shrink-0">
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading} className="font-bold rounded-full">
          Back
        </Button>
        <Button type="submit" form="add-item-form" disabled={loading} className="font-bold px-6 rounded-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </>
  );
};
