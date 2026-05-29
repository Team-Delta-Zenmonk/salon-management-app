import { Box } from "@mui/material";
import { useState } from "react";
import StaffSidebar from "../staff-sidebar";
import StaffServicesPanel from "../staff-services-panel";

export default function StaffView() {
  const [selectedStaffUuid, setSelectedStaffUuid] = useState<string | null>(null);

  return (
    <Box className="flex flex-1 min-h-0 gap-6 w-full flex-col lg:flex-row">
      <Box className="bg-white border border-gray-200 rounded-lg w-full lg:w-[380px] flex flex-col min-h-0 shadow-sm">
        <Box className="flex-1 min-h-0 overflow-y-auto">
          <StaffSidebar selectedStaffUuid={selectedStaffUuid} onSelectStaff={setSelectedStaffUuid} />
        </Box>
      </Box>

      <Box className="flex-1 min-w-0 flex flex-col min-h-0">
        <Box className="flex-1 min-h-0 overflow-y-auto">
          <StaffServicesPanel selectedStaffUuid={selectedStaffUuid} />
        </Box>
      </Box>
    </Box>
  );
}
