import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { getInventoryItemService as getSingleInventoryItem } from "../../../../features/inventory/get-inventory-item/get-inventory-item.service";
import { updateInventoryItemService as updateInventoryItem } from "../../../../features/inventory/update-inventory-item/update-inventory-item.service";
import { callSnack } from "../../../../components/snackbar";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../../components/form/textfield";
import FilePicker from "../../../../components/form/file-picker";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";
import Select from "../../../../components/form/select";
import { useAppSelector } from "../../../../store/hooks";
import { inventoryItemSchema, type InventoryItemForm } from "../schema/inventory-item.schema";

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  inventoryItem: InventoryItem | null;
  onSuccess: () => void;
}

const ITEM_TYPES = [
  { label: "Product", value: "product" },
  { label: "Equipment", value: "equipment" },
];

const UNITS = ["ml", "l", "g", "kg", "pieces", "box", "bottle", "tube"].map((u) => ({
  label: u,
  value: u,
}));

export const EditProductModal: React.FC<EditProductModalProps> = ({ open, onClose, inventoryItem, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState<InventoryItem | null>(null);
  const categories = useAppSelector((state) => state.itemsCategory.data) ?? [];

  const { control, handleSubmit, reset } = useForm<InventoryItemForm>({
    resolver: zodResolver(inventoryItemSchema) as unknown as Resolver<InventoryItemForm>,
    defaultValues: {
      name: "",
      brand: "",
      category_id: "",
      item_type: "",
      logo: undefined,
      variant_name: "",
      unit: "",
      unit_price: 0,
      min_stock_level: 0,
    },
  });

  const fetchItemDetails = React.useCallback(async (uuid: string) => {
    setLoading(true);
    try {
      const data = await getSingleInventoryItem(uuid);
      setItemDetails(data);
      reset({
        name: data.name,
        brand: data.brand || "",
        category_id: data.category?.uuid || "",
        item_type: data.item_type || data.category?.item_type || "product",
        logo: data.logo ? { url: data.logo, filename: data.logo.substring(data.logo.lastIndexOf('/') + 1) } : undefined,
        variant_name: data.variant_name || "",
        unit: data.unit || "",
        unit_price: data.unit_price,
        min_stock_level: data.min_stock_level || 0,
      });
    } catch (error) {
      console.error(error);
      callSnack("Failed to load item details", "error");
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    if (open && inventoryItem) {
      fetchItemDetails(inventoryItem.uuid);
    }
  }, [open, inventoryItem, fetchItemDetails]);

  const onSubmit = async (data: InventoryItemForm) => {
    if (!inventoryItem) return;

    setLoading(true);
    try {
      await updateInventoryItem(inventoryItem.uuid, {
        name: data.name.trim().toLowerCase(),
        brand: data.brand.trim().toLowerCase() || null,
        category_id: data.category_id,
        item_type: data.item_type,
        logo: data.logo?.url || null,
        variant_name: data.variant_name?.trim().toLowerCase() || null,
        unit: data.unit?.trim().toLowerCase() || null,
        unit_price: Number(data.unit_price),
        min_stock_level: Number(data.min_stock_level),
      });

      callSnack("Inventory item updated successfully", "success");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 409) {
        callSnack("Item already exists in inventory", "error");
      } else {
        callSnack(err?.response?.data?.message || "Failed to update item", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!inventoryItem) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Edit Item
          </DialogTitle>
        </DialogHeader>

        {loading && !itemDetails ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} id="edit-product-form">
            <div className="flex flex-col py-5 px-6 gap-5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
              <TextField
                identifier="edit-name"
                name="name"
                control={control}
                type="text"
                label="Item Name"
                maxLength={50}
                disabled={loading}
              />

              <TextField
                identifier="edit-brand"
                name="brand"
                control={control}
                type="text"
                label="Brand"
                maxLength={50}
                disabled={loading}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select
                    name="item_type"
                    control={control}
                    placeholder="Item Type"
                    identifier="edit-item-type"
                    label="Item Type"
                    options={ITEM_TYPES}
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <Select
                    name="category_id"
                    control={control}
                    placeholder="Select Category"
                    identifier="edit-category"
                    label="Category"
                    options={categories.map((cat) => ({
                      label: cat.name,
                      value: cat.uuid,
                    }))}
                    disabled={loading}
                  />
                </div>
              </div>

              <FilePicker
                name="logo"
                control={control}
                identifier="edit-product-logo"
                label="Item Image"
                uploadFn={uploadImages}
                disabled={loading}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <TextField
                    identifier="edit-variant_name"
                    name="variant_name"
                    control={control}
                    type="text"
                    label="Variant / Size"
                    maxLength={5}
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <Select
                    name="unit"
                    control={control}
                    placeholder="Select Unit"
                    identifier="edit-unit"
                    label="Unit"
                    options={UNITS}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <TextField
                    identifier="edit-unit_price"
                    name="unit_price"
                    control={control}
                    type="number"
                    label="Unit Price"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <TextField
                    identifier="edit-min_stock_level"
                    name="min_stock_level"
                    control={control}
                    type="number"
                    label="Min Stock Level"
                    disabled={loading}
                  />
                </div>
              </div>
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
                form="edit-product-form"
                disabled={loading}
                className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
