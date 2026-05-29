import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { StaffPricingType } from "../../types/staff-service.types";
import Select from "../../../../components/form/select";
import { PriceTypeOptions } from "../../../../common/enums/price-type.enum";
import TextField from "../../../../components/form/textfield";

type DialogContext = {
  staff_name: string;
  service_name: string;
  current?: StaffPricingType;
};

type StaffServicePricingDialogProps = {
  open: boolean;
  onClose: () => void;
  context: DialogContext;
  onSave: (payload: { price_type: string; price: number; duration: number }) => Promise<void> | void;
};

type FormValues = {
  price_type: string;
  price: string | number;
  duration: string | number;
};

export default function StaffServicePricingDialog({
  open,
  onClose,
  context,
  onSave,
}: Readonly<StaffServicePricingDialogProps>) {
  const { staff_name, service_name, current } = context;
  const [loading, setLoading] = useState(false);

  const methods = useForm<FormValues>({
    defaultValues: {
      price_type: current?.price_type ?? "fixed",
      price: current?.price ? String(current.price) : "0",
      duration: current?.duration ? String(current.duration) : "0",
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = methods;

  const priceType = watch("price_type");
  const isFree = priceType === "free";

  useEffect(() => {
    if (!open) return;

    reset({
      price_type: current?.price_type ?? "fixed",
      price: current?.price ? String(current.price) : "0",
      duration: current?.duration ? String(current.duration) : "0",
    });
  }, [open, current, reset]);

  useEffect(() => {
    if (isFree) setValue("price", "0");
  }, [isFree, setValue]);

  const submit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      await onSave({
        price_type: data.price_type,
        price: Number.isFinite(Number(data.price)) ? Math.max(0, Number(data.price)) : 0,
        duration: Number.isFinite(Number(data.duration)) ? Math.max(0, Number(data.duration)) : 0,
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Edit Pricing
        <Typography className="text-gray-500 text-sm mt-1">
          {staff_name} · {service_name}
        </Typography>
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent>
          <Box className="flex flex-col gap-4 py-2">
            <Select
              name="price_type"
              control={control}
              placeholder="Price Type"
              identifier="edit-price-type"
              options={PriceTypeOptions}
              disabled={loading}
            />

            <TextField
              type="number"
              label="Price"
              name="price"
              control={control}
              identifier="edit-price"
              disabled={loading || isFree}
            />

            <TextField
              type="number"
              label="Duration (minutes)"
              name="duration"
              control={control}
              identifier="edit-duration"
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={submit} disabled={loading || !isDirty}>
            Save
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
