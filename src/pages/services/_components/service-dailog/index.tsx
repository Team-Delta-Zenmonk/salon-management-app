import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, FormControlLabel, Switch } from "@mui/material";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { callSnack } from "../../../../components/snackbar";
import styles from "./servcie-dialog.module.scss";
import { serviceSchema, type ServiceForm } from "../schema/service.schema";
import TextField from "../../../../components/form/textfield";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import FilePicker from "../../../../components/form/file-picker";
import Select from "../../../../components/form/select";
import { PriceTypeOptions } from "../../../../common/enums/price-type.enum";
import { ServiceGenderOptions } from "../../../../common/enums/service-gender.enum";
import { DiscountTypeOptions } from "../../../../common/enums/discount-type.enum";
import type { RootState } from "../../../../store/store";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { createServiceService } from "../../../../features/service/create-service/create-service.service";
import { updateServiceAction } from "../../../../features/service/update-service/update-service.action";

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  service?: any;
  parentService?: any;
  onCreated?: () => void;
}

export default function ServiceDialog({ open, onClose, mode, service, parentService, onCreated }: Readonly<ServiceDialogProps>) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const categories = useAppSelector((state: RootState) => state.category.data) ?? [];

  const isCreatingSubService = mode === "create" && Boolean(parentService);
  const isEditingSubService = mode === "update" && Boolean(service?.parent_id);
  const shouldShowCategory = !(isCreatingSubService || isEditingSubService);

  const methods = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
  });

  const { handleSubmit, control, reset, watch, setValue } = methods;

  const buildPayload = (data: ServiceForm, logoUrl: string | undefined) => {
    const payload: any = {
      name: data.name,
      description: data.description,
      gender: data.gender,
      price_type: data.price_type,
      price: Number(data.price),
      duration: Number(data.duration),
      is_active: data.is_active ?? false,
      is_popular: data.is_popular ?? false,
      logo: logoUrl,
    };

    if (data.discount !== undefined && data.discount !== null) {
      payload.discount = Number(data.discount);
    }
    if (data.discount_type) {
      payload.discount_type = data.discount_type;
    }

    if (mode === "create") {
      if (isCreatingSubService) {
        payload.parent_id = parentService?.uuid;
      } else {
        payload.category_id = data.category_id;
      }
    } else if (data.category_id) {
      payload.category_id = data.category_id;
    }

    return payload;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      const logoUrl = data.logo?.url || (mode === "update" ? service?.logo : undefined);

      if (mode === "create" && !isCreatingSubService && !data.category_id) {
        callSnack("Category is required", "error");
        return;
      }

      const payload = buildPayload(data, logoUrl);

      if (mode === "create") {
        await createServiceService(payload);
        callSnack(
          isCreatingSubService ? "Sub-service created successfully" : "Service created successfully",
          "success"
        );
      } else {
        await dispatch(updateServiceAction({ uuid: service.uuid, body: payload })).unwrap();
        callSnack("Service updated successfully", "success");
      }

      onCreated?.();
      onClose();
    } catch (err: any) {
      callSnack(
        err?.response?.data?.message || (mode === "create" ? "Service Creation Failed" : "Service Update Failed"),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        await dispatch(listCategoriesAction({ page: 1, limit: 100 })).unwrap();
      } catch {
        callSnack("Failed to fetch categories", "error");
      }
    };

    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      reset({
        name: "",
        description: "",
        logo: null,
        category_id: undefined,
        gender: undefined,
        price_type: undefined,
        duration: "",
        price: "",
        discount: undefined,
        discount_type: undefined,
        is_active: true,
        is_popular: false,
      });
    } else if (mode === "update" && service) {
      reset({
        name: service.name ?? "",
        description: service.description ?? "",
        logo: null,
        category_id: service?.category?.uuid,
        gender: service.gender,
        price_type: service.price_type,
        duration: service.duration == null ? "" : String(service.duration),
        price: service.price == null ? "" : String(service.price),
        discount: service.discount ?? undefined,
        discount_type: service.discount_type ?? undefined,
        is_active: service.is_active ?? false,
        is_popular: service.is_popular ?? false,
      });
    }
  }, [open, mode, service, parentService, reset]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle className={clsx(styles.dialogTitle)} fontWeight="fontWeightMedium" variant="h5">
        {mode === "create" ? (isCreatingSubService ? "Create Sub-service" : "Create Service") : "Update Service"}
      </DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogContent className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}>
            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Service Name</Typography>
              <TextField
                type="text"
                label="Service Name"
                name="name"
                control={control}
                identifier="service-name"
                disabled={isLoading}
              />
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Description</Typography>
              <TextField
                type="text"
                label="Description"
                name="description"
                control={control}
                identifier="service-description"
                disabled={isLoading}
              />
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Logo (optional)</Typography>
              <FilePicker
                name="logo"
                control={control}
                identifier="service-logo"
                label="Logo (optional)"
                uploadFn={uploadImages}
                disabled={isLoading}
              />
            </Box>

            {!isCreatingSubService && shouldShowCategory && (
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Category</Typography>
                <Select
                  name="category_id"
                  control={control}
                  placeholder="Select Category"
                  identifier="service-category"
                  options={categories.map((c) => ({ label: c.name, value: c.uuid }))}
                  disabled={isLoading}
                />
              </Box>
            )}

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Gender</Typography>
                <Select
                  name="gender"
                  control={control}
                  placeholder="Gender"
                  identifier="service-gender"
                  options={ServiceGenderOptions}
                  disabled={isLoading}
                />
              </Box>

              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Price Type</Typography>
                <Select
                  name="price_type"
                  control={control}
                  placeholder="Price Type"
                  identifier="service-price-type"
                  options={PriceTypeOptions}
                  disabled={isLoading}
                />
              </Box>
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Price</Typography>
              <TextField
                type="number"
                label="Price"
                name="price"
                control={control}
                identifier="service-price"
                disabled={isLoading}
              />
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Duration (in minutes)</Typography>
              <TextField
                type="number"
                label="Duration"
                name="duration"
                control={control}
                identifier="service-duration"
                disabled={isLoading}
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Discount (optional)</Typography>
                <TextField
                  type="number"
                  label="Discount"
                  name="discount"
                  control={control}
                  identifier="service-discount"
                  disabled={isLoading}
                />
              </Box>

              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Discount Type</Typography>
                <Select
                  name="discount_type"
                  control={control}
                  placeholder="Discount Type"
                  identifier="service-discount-type"
                  options={DiscountTypeOptions}
                  disabled={isLoading}
                />
              </Box>
            </Box>

            <Box className="flex gap-4">
              <FormControlLabel
                control={
                  <Switch
                    checked={watch("is_active") ?? true}
                    onChange={(e) => setValue("is_active", e.target.checked)}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={watch("is_popular") ?? false}
                    onChange={(e) => setValue("is_popular", e.target.checked)}
                  />
                }
                label="Popular"
              />
            </Box>
          </DialogContent>

          <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
            <Button onClick={onClose} disabled={isLoading}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
