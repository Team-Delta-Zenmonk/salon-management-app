import { useState } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import type { Control } from "react-hook-form";
import Select from "@/components/form/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SelectOption {
  label: string;
  value: string;
}

interface LegendItem {
  label: string;
  color?: string;
  badgeClass?: string;
  dotClass?: string;
}

interface BookingFilterDialogProps {
  control: Control<any>;
  staffOptions: SelectOption[];
  serviceOptions: SelectOption[];
  paymentOptions: SelectOption[];
  statusLegend?: LegendItem[];
  hasActiveFilters?: boolean;
}

export default function BookingFilterDialog({
  control,
  staffOptions,
  serviceOptions,
  paymentOptions,
  statusLegend = [],
}: Readonly<BookingFilterDialogProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border-border/50 bg-card/60 backdrop-blur-md text-foreground font-bold text-xs shadow-sm hover:bg-card/80 transition-all shrink-0"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
        <span>Filters</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[92vw] max-w-sm rounded-2xl border-border/50 bg-card p-5 shadow-2xl [&>button]:hidden">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Filters & Legend
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Filter appointments and view status legend
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Staff
              </label>
              <div className="[&_button]:bg-muted/30 [&_button]:border-border/50 [&_button]:text-foreground [&_button]:rounded-xl">
                <Select
                  name="staff"
                  control={control}
                  placeholder="All Staff"
                  options={staffOptions}
                  identifier="booking-staff-filter-modal"
                  translate={false}
                  disabled={staffOptions.length === 1}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Service
              </label>
              <div className="[&_button]:bg-muted/30 [&_button]:border-border/50 [&_button]:text-foreground [&_button]:rounded-xl">
                <Select
                  name="service"
                  control={control}
                  placeholder="All Services"
                  options={serviceOptions}
                  identifier="booking-service-filter-modal"
                  translate={false}
                  disabled={serviceOptions.length === 1}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Payment Mode
              </label>
              <div className="[&_button]:bg-muted/30 [&_button]:border-border/50 [&_button]:text-foreground [&_button]:rounded-xl">
                <Select
                  name="payment"
                  control={control}
                  placeholder="All Payment Modes"
                  options={paymentOptions}
                  identifier="booking-payment-filter-modal"
                  translate={false}
                />
              </div>
            </div>

            {statusLegend.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Status & Type Legend
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusLegend.map(({ label, color, badgeClass, dotClass }) => (
                    <div
                      key={label}
                      className={`inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 px-2 rounded-xl border backdrop-blur-sm ${
                        badgeClass || "border-border/50 bg-muted/30 text-foreground"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass || ""}`}
                        style={!dotClass ? { backgroundColor: color } : undefined}
                      />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full h-10 rounded-xl font-bold text-xs bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
