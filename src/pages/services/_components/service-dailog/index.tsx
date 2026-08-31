import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { callSnack } from "../../../../components/snackbar";
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
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { Loader2 } from "lucide-react";

import type { Service } from "../../../../features/service/service.slice";
import type { CreateServicePayload } from "../../../../features/service/create-service/create-service.service";

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  service?: Service;
  parentService?: Service;
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

  const buildPayload = (data: ServiceForm, logoUrl?: string | null): CreateServicePayload => {
    const payload: CreateServicePayload = {
      name: data.name?.trim().toLowerCase() ?? "",
      description: data.description,
      gender: data.gender!,
      price_type: data.price_type!,
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
        await dispatch(updateServiceAction({ uuid: service!.uuid, body: payload })).unwrap();
        callSnack("Service updated successfully", "success");
      }

      onCreated?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: { message: string }[] } } };
      callSnack(
        error?.response?.data?.errors?.[0]?.message || (mode === "create" ? "Service Creation Failed" : "Service Update Failed"),
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
        discount: service.discount == null ? "" : String(service.discount),
        discount_type: service.discount_type ?? undefined,
        is_active: service.is_active ?? false,
        is_popular: service.is_popular ?? false,
      });
    }
  }, [open, mode, service, parentService, reset]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (isLoading) return;
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === "create" ? (isCreatingSubService ? "Create Sub-service" : "Create Service") : "Update Service"}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col py-5 px-6 gap-4 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
              <TextField
                type="text"
                label="Service Name"
                name="name"
                control={control}
                identifier="service-name"
                placeholder="Enter service name"
                disabled={isLoading}
                maxLength={50}
                pattern={VALIDATE_PATTERN.alphabetWithSpecial}
              />

              <TextField
                type="text"
                label="Description"
                name="description"
                control={control}
                identifier="service-description"
                placeholder="Enter service description"
                disabled={isLoading}
                maxLength={100}
                pattern={VALIDATE_PATTERN.alphabetWithSpecial}
                multiline
                rows={2}
              />

              <div className="flex flex-col gap-1.5">
                <FilePicker
                  name="logo"
                  control={control}
                  identifier="service-logo"
                  label="Logo (Optional)"
                  uploadFn={uploadImages}
                  disabled={isLoading}
                />
                {mode === "update" && service?.logo && (
                  <span className="text-[10px] text-muted-foreground mt-1">
                    Current logo already uploaded. Upload a new one to replace.
                  </span>
                )}
              </div>

              {!isCreatingSubService && shouldShowCategory && (
                <Select
                  name="category_id"
                  control={control}
                  label="Category"
                  placeholder="Select Category"
                  identifier="service-category"
                  options={categories.map((c) => ({ label: c.name, value: c.uuid }))}
                  disabled={isLoading}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  name="gender"
                  control={control}
                  label="Gender"
                  placeholder="Gender"
                  identifier="service-gender"
                  options={ServiceGenderOptions}
                  disabled={isLoading}
                />

                <Select
                  name="price_type"
                  control={control}
                  label="Price Type"
                  placeholder="Price Type"
                  identifier="service-price-type"
                  options={PriceTypeOptions}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  type="number"
                  label="Price"
                  name="price"
                  control={control}
                  identifier="service-price"
                  placeholder="Enter price"
                  disabled={isLoading}
                />

                <TextField
                  type="number"
                  label="Duration (in minutes)"
                  name="duration"
                  control={control}
                  identifier="service-duration"
                  placeholder="Enter duration"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  type="number"
                  label="Discount (optional)"
                  name="discount"
                  control={control}
                  identifier="service-discount"
                  placeholder="Enter discount"
                  disabled={isLoading}
                />

                <Select
                  name="discount_type"
                  control={control}
                  label="Discount Type"
                  placeholder="Discount Type"
                  identifier="service-discount-type"
                  options={DiscountTypeOptions}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-6 mt-2 pt-4 border-t border-border/40">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={watch("is_active") ?? true}
                    onCheckedChange={(checked) => setValue("is_active", checked)}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_popular"
                    checked={watch("is_popular") ?? false}
                    onCheckedChange={(checked) => setValue("is_popular", checked)}
                  />
                  <Label htmlFor="is_popular" className="cursor-pointer text-sm font-medium">Popular</Label>
                </div>
              </div>
            </div>

            <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-full px-6"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? (isLoading ? "Creating..." : "Create") : (isLoading ? "Saving..." : "Save")}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
