import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { StaffPricingType } from "../../types/staff-service.types";
import Select from "../../../../components/form/select";
import { PriceTypeOptions } from "../../../../common/enums/price-type.enum";
import TextField from "../../../../components/form/textfield";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


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
    <Dialog open={open} onOpenChange={(val: boolean) => !val && !loading && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex flex-col items-start gap-1">
            Edit Pricing
            <span className="text-xs text-muted-foreground font-normal mt-1.5">
              {staff_name} &bull; {service_name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={submit}>
            <div className="flex flex-col py-5 px-6 gap-4">
              <Select
                name="price_type"
                control={control}
                label="Price Type"
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
                placeholder="Enter price"
                disabled={loading || isFree}
              />

              <TextField
                type="number"
                label="Duration (in minutes)"
                name="duration"
                control={control}
                identifier="edit-duration"
                placeholder="Enter duration"
                disabled={loading}
              />
            </div>

            <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="rounded-full px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !isDirty}
                className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

