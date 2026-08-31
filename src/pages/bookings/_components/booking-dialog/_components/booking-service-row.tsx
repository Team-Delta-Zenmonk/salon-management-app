import type { Control } from "react-hook-form";
import { Button } from "../../../../../components/ui/button";
import { X } from "lucide-react";
import Select from "../../../../../components/form/select";
import type { BookingFormValues } from "../../../schema/booking.schema";

interface BookingServiceRowProps {
  index: number;
  control: Control<BookingFormValues>;
  serviceOptions: { label: string; value: string }[];
  staffOptions: { label: string; value: string }[];
  staffLoading: boolean;
  selectedStaff?: { duration: number; price: number };
  showRemoveButton: boolean;
  onRemove: () => void;
  watchedServiceId?: string | number;
}

const formatPrice = (price: number) => `₹${Math.round(price).toLocaleString("en-IN")}`;

export default function BookingServiceRow({
  index,
  control,
  serviceOptions,
  staffOptions,
  staffLoading,
  selectedStaff,
  showRemoveButton,
  onRemove,
  watchedServiceId,
}: Readonly<BookingServiceRowProps>) {
  return (
    <div className="rounded-xl border border-border/50 p-4 relative bg-muted/5 transition-colors hover:bg-muted/10">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <Select
            name={`services.${index}.service_id`}
            placeholder="Select Service"
            identifier={`booking-service-${index}`}
            options={serviceOptions}
            translate={false}
            control={control as any}
          />
        </div>

        <div className="flex-1 min-w-0">
          <Select
            name={`services.${index}.staff_id`}
            placeholder={staffLoading ? "Loading..." : "Select Staff"}
            identifier={`booking-staff-${index}`}
            options={staffOptions}
            translate={false}
            disabled={!watchedServiceId || staffLoading}
            control={control as any}
          />
        </div>

        {showRemoveButton && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="mt-1 h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedStaff && (
        <div className="flex items-center gap-3 mt-3 pl-1">
          <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md shadow-sm border border-border/50">
            {Number(selectedStaff.duration)} mins
          </span>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
            {formatPrice(Number(selectedStaff.price))}
          </span>
        </div>
      )}
    </div>
  );
}
