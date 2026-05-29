import { Box, Typography } from "@mui/material";
import { DesignServicesOutlined } from "@mui/icons-material";
import type { ServiceType } from "../../types/staff-service.types";
import StaffPricingCards from "./_components/staff-pricing-cards";

export default function StaffPricingPanel({ selectedService }: Readonly<{ selectedService: ServiceType | null }>) {
  if (!selectedService) {
    return (
      <Box className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center h-full text-center">
        <DesignServicesOutlined className="text-gray-300 w-12 h-12 mb-3" />
        <Typography variant="h6" className="text-gray-700 font-medium">
          No Service Selected
        </Typography>
        <Typography className="text-gray-500 text-sm mt-1">
          Select a service from the sidebar to view its staff pricing.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col min-h-full">
      <Box className="flex flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
        <Box>
          <Typography variant="h6" fontWeight="bold" className="text-(--primary-900)">
            {selectedService.name} Staff Pricing
          </Typography>
          <Typography className="text-gray-600 text-sm">
            View staff price & duration for this service and its subservices.
          </Typography>
        </Box>
      </Box>
      <StaffPricingCards selectedService={selectedService} />
    </Box>
  );
}
