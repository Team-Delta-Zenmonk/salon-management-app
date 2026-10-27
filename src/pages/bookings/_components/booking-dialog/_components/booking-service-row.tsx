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
  selectedStaff?: {
    duration: number;
    price: number;
    originalPrice?: number;
    hasDiscount?: boolean;
    discountBadge?: string | null;
  } | null;
  showRemoveButton: boolean;
  onRemove: () => void;
  watchedServiceId?: string | number;
  onServiceChange?: () => void;
  onServiceScrollEnd?: () => void;
  isLoadingMoreServices?: boolean;
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
  onServiceChange,
  onServiceScrollEnd,
  isLoadingMoreServices,
}: Readonly<BookingServiceRowProps>) {
  return (
    <div className="rounded-xl border border-border/50 p-3.5 sm:p-4 relative bg-muted/5 transition-colors hover:bg-muted/10">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <Select
            name={`services.${index}.service_id`}
            placeholder="Select Service"
            identifier={`booking-service-${index}`}
            options={serviceOptions}
            triggerClassName="capitalize"
            translate={false}
            control={control as any}
            onChange={onServiceChange}
            onScrollEnd={onServiceScrollEnd}
            isLoadingMore={isLoadingMoreServices}
          />
        </div>

        <div className="flex-1 min-w-0">
          <Select
            name={`services.${index}.staff_id`}
            placeholder={staffLoading ? "Loading..." : "Any Available"}
            identifier={`booking-staff-${index}`}
            options={staffOptions}
            triggerClassName="capitalize"
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
            className="self-end sm:self-auto mt-0 sm:mt-1 h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedStaff && (
        <div className="flex items-center gap-2 mt-3 pl-1 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md shadow-sm border border-border/50">
            {Number(selectedStaff.duration)} mins
          </span>
          {selectedStaff.hasDiscount && selectedStaff.originalPrice !== undefined ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs line-through text-muted-foreground font-medium">
                {formatPrice(Number(selectedStaff.originalPrice))}
              </span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                {formatPrice(Number(selectedStaff.price))}
              </span>
              {selectedStaff.discountBadge && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {selectedStaff.discountBadge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
              {formatPrice(Number(selectedStaff.price))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
