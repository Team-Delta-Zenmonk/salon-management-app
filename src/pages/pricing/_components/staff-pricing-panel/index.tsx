import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import type { ServiceType } from "../../types/staff-service.types";
import StaffPricingCards from "./_components/staff-pricing-cards";
import AssignStaffDialog from "../../../services/_components/assign-staff-dialog";

export default function StaffPricingPanel({ selectedService }: Readonly<{ selectedService: ServiceType | null }>) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  if (!selectedService) {
    return (
      <Box className="bg-white border border-gray-200 rounded-lg p-6">
        <Typography className="text-gray-600">Select a service to manage pricing.</Typography>
      </Box>
    );
  }

  return (
    <Box className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col min-h-full">
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Box>
          <Typography variant="h6" fontWeight="bold" className="text-(--primary-900)">
            {selectedService.name} Staff Pricing
          </Typography>
          <Typography className="text-gray-600 text-sm">
            Manage staff price & duration for this service and its subservices.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined className="text-white!" />}
          onClick={() => setAssignDialogOpen(true)}
          className="shrink-0"
        >
          Assign Staff
        </Button>
      </Box>
      <StaffPricingCards selectedService={selectedService} onAssignStaff={() => setAssignDialogOpen(true)} />

      <AssignStaffDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        serviceUuid={selectedService.uuid}
        service={{
          price_type: selectedService.price_type ?? "fixed",
          price: selectedService.price ? Number(selectedService.price) : 0,
          duration: selectedService.duration ? Number(selectedService.duration) : 0,
        }}
      />
    </Box>
  );
}
