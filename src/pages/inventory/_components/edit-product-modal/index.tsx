import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import clsx from "clsx";
import styles from "../inventory-dialog.module.scss";
import { getInventoryItemService as getSingleInventoryItem } from "../../../../features/inventory/get-inventory-item/get-inventory-item.service";
import { updateInventoryItemService as updateInventoryItem } from "../../../../features/inventory/update-inventory-item/update-inventory-item.service";
import { callSnack } from "../../../../components/snackbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../../components/form/textfield";
import FilePicker from "../../../../components/form/file-picker";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import type { InventoryItem } from "../../../../features/inventory/inventory-item.slice";
import Select from "../../../../components/form/select";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { inventoryItemSchema } from "../schema/inventory-item.schema";

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
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState<InventoryItem | null>(null);
  const categories = useAppSelector((state) => state.itemsCategory.data) ?? [];

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      brand: "",
      category_id: "",
      item_type: "",
      logo: undefined as any,
      variant_name: "",
      unit: "",
      unit_price: "",
      min_stock_level: 0,
    },
  });

  useEffect(() => {
    if (open && inventoryItem) {
      fetchItemDetails(inventoryItem.uuid);
    }
  }, [open, inventoryItem, categories.length, dispatch]);

  const fetchItemDetails = async (uuid: string) => {
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
  };

  const onSubmit = async (data: any) => {
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
    } catch (error: any) {
      if (error?.response?.status === 409) {
        callSnack("Item already exists in inventory", "error");
      } else {
        callSnack(error?.response?.data?.message || "Failed to update item", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!inventoryItem) return null;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (loading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialogLg }}
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
          Edit Item
        </Typography>
        <IconButton onClick={onClose} edge="end" size="small" disabled={loading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {loading && !itemDetails ? (
        <DialogContent className={clsx("flex justify-center items-center py-6", styles.dialogContent)}>
          <CircularProgress />
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} id="edit-product-form">
          <DialogContent className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Box className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Item Name</Typography>
                <TextField
                  identifier="edit-name"
                  name="name"
                  control={control}
                  type="text"
                  label="Item Name"
                  maxLength={50}
                  disabled={loading}
                />
              </Box>

              <Box className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Brand</Typography>
                <TextField
                  identifier="edit-brand"
                  name="brand"
                  control={control}
                  type="text"
                  label="Brand"
                  maxLength={50}
                  disabled={loading}
                />
              </Box>

              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <Box flex={1} className="flex flex-col gap-2">
                  <Typography variant="titleSm" fontWeight="bold">Item Type</Typography>
                  <Select
                    name="item_type"
                    control={control}
                    placeholder="Item Type"
                    identifier="edit-item-type"
                    options={ITEM_TYPES}
                    disabled={loading}
                  />
                </Box>
                <Box flex={1} className="flex flex-col gap-2">
                  <Typography variant="titleSm" fontWeight="bold">Category</Typography>
                  <Select
                    name="category_id"
                    control={control}
                    placeholder="Select Category"
                    identifier="edit-category"
                    options={categories.map((cat) => ({
                      label: cat.name,
                      value: cat.uuid,
                    }))}
                    disabled={loading}
                  />
                </Box>
              </Box>

              <Box className="flex flex-col gap-2">
                <Typography variant="titleSm" fontWeight="bold">Item Image</Typography>
                <FilePicker
                  name="logo"
                  control={control}
                  identifier="edit-product-logo"
                  label="Item Image"
                  uploadFn={uploadImages}
                  disabled={loading}
                />
              </Box>

              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <Box flex={1} className="flex flex-col gap-2">
                  <Typography variant="titleSm" fontWeight="bold">Variant / Size</Typography>
                  <TextField
                    identifier="edit-variant_name"
                    name="variant_name"
                    control={control}
                    type="text"
                    label="Variant / Size"
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
                    identifier="edit-unit"
                    options={UNITS}
                    disabled={loading}
                  />
                </Box>
              </Box>

              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <Box flex={1} className="flex flex-col gap-2">
                  <Typography variant="titleSm" fontWeight="bold">Unit Price</Typography>
                  <TextField
                    identifier="edit-unit_price"
                    name="unit_price"
                    control={control}
                    type="number"
                    label="Unit Price"
                    disabled={loading}
                  />
                </Box>
                <Box flex={1} className="flex flex-col gap-2">
                  <Typography variant="titleSm" fontWeight="bold">Min Stock Level</Typography>
                  <TextField
                    identifier="edit-min_stock_level"
                    name="min_stock_level"
                    control={control}
                    type="number"
                    label="Min Stock Level"
                    disabled={loading}
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" form="edit-product-form" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};
