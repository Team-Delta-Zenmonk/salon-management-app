import { Box, Typography, Divider, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useEffect, useState } from "react";
import { PersonOutline, CategoryOutlined } from "@mui/icons-material";
import { useAppDispatch } from "../../store/hooks";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import ServiceView from "./_components/service-view";
import StaffView from "./_components/staff-view";

export type ViewMode = "service" | "staff";

export default function StaffServiceManagementPage() {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>("service");

  useEffect(() => {
    dispatch(listServicesAction({ page: 1, limit: 1000 }));
    dispatch(listStaffAction({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box className="flex flex-col w-full h-full gap-6">
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8">
        <Box>
          <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900)">
            Staff Service Pricing
          </Typography>
          <Typography className="text-gray-600">
            Manage which staff provide each service and set custom pricing or durations.
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          size="small"
          className="bg-white"
        >
          <ToggleButton value="service" aria-label="by service" className="px-4 py-1.5 capitalize whitespace-nowrap">
            <CategoryOutlined fontSize="small" className="mr-2" />
            <Typography variant="body2" fontWeight="medium" className="whitespace-nowrap">
              By Service
            </Typography>
          </ToggleButton>
          <ToggleButton value="staff" aria-label="by staff" className="px-4 py-1.5 capitalize whitespace-nowrap">
            <PersonOutline fontSize="small" className="mr-2" />
            <Typography variant="body2" fontWeight="medium" className="whitespace-nowrap">
              By Staff
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider />

      <Box className="flex-1 min-h-0 flex flex-col w-full px-8 pb-8">
        {viewMode === "service" ? <ServiceView /> : <StaffView />}
      </Box>
    </Box>
  );
}
