import type { ServiceType } from "../../types/staff-service.types";
import StaffPricingCards from "./_components/staff-pricing-cards";
import { Scissors, Loader2 } from "lucide-react";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";

interface StaffPricingPanelProps {
  selectedService: ServiceType | null;
  isLoadingSubServices?: boolean;
}

export default function StaffPricingPanel({ selectedService, isLoadingSubServices }: Readonly<StaffPricingPanelProps>) {
  const serviceState = useAppSelector((state: RootState) => state.service);

  if (!selectedService || isLoadingSubServices) {
    if (isLoadingSubServices || serviceState?.isInitialLoading || (serviceState?.loading && (serviceState?.data?.length ?? 0) === 0)) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-0 p-8 text-center bg-transparent gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-semibold">
            {isLoadingSubServices ? "Loading sub-services..." : "Loading services..."}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-0 p-8 text-center bg-transparent">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/50">
          <Scissors className="text-muted-foreground w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          No Service Selected
        </h3>
        <p className="text-muted-foreground/80 text-sm mt-1 max-w-sm">
          Select a service from the sidebar to view its staff pricing.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col min-h-full bg-transparent">
      <StaffPricingCards selectedService={selectedService} />
    </div>
  );
}

