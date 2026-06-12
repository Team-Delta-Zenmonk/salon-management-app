import { Box } from "@mui/material";
import { useState, useMemo } from "react";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import StaffSidebar from "../staff-sidebar";
import StaffServicesPanel from "../staff-services-panel";

export default function StaffView() {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];
  const [selectedStaffUuid, setSelectedStaffUuid] = useState<string | null>(() => {
    return staffs.length > 0 ? staffs[0].uuid : null;
  });

  return (
    <Box className="flex flex-1 min-h-0 w-full flex-col lg:flex-row">
      <Box className="w-full lg:w-[340px] flex flex-col min-h-0 border-r border-[var(--border-subtle)] bg-[var(--surface-muted)]">
        <Box className="flex-1 min-h-0 overflow-y-auto">
          <StaffSidebar selectedStaffUuid={selectedStaffUuid} onSelectStaff={setSelectedStaffUuid} />
        </Box>
      </Box>

      <Box className="flex-1 min-w-0 flex flex-col min-h-0 bg-[var(--surface)]">
        <Box className="flex-1 min-h-0 overflow-y-auto p-8">
          <StaffServicesPanel selectedStaffUuid={selectedStaffUuid} />
        </Box>
      </Box>
    </Box>
  );
}
