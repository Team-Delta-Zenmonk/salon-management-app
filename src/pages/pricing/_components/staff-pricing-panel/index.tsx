import { Box, Typography } from "@mui/material";
import type { ServiceType } from "../../types/staff-service.types";
import StaffPricingAccordion from "./_components/staff-pricing-accordion";


export default function StaffPricingPanel({ selectedService }: Readonly<{ selectedService: ServiceType | null }>) {
  if (!selectedService) {
    return (
      <Box className="bg-white border border-gray-200 rounded-lg p-6">
        <Typography className="text-gray-600">Select a service to manage pricing.</Typography>
      </Box>
    );
  }

  return (
    <Box className="bg-white border border-gray-200 rounded-lg p-6">
      <Box className="mb-4">
        <Typography variant="h6" fontWeight="bold" className="text-(--primary-900)">
          {selectedService.name}
        </Typography>
        <Typography className="text-gray-600 text-sm">
          Manage staff price & duration for this service and its subservices.
        </Typography>
      </Box>
      <StaffPricingAccordion selectedService={selectedService} />
    </Box>
  );
}
