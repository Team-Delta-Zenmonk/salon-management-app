import type { ServiceType } from "../../types/staff-service.types";
import StaffPricingCards from "./_components/staff-pricing-cards";
import { Scissors } from "lucide-react";

export default function StaffPricingPanel({ selectedService }: Readonly<{ selectedService: ServiceType | null }>) {
  if (!selectedService) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center bg-transparent">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/40">
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
    <div className="p-6 md:p-8 flex flex-col min-h-full bg-transparent">
      <StaffPricingCards selectedService={selectedService} />
    </div>
  );
}

