import { Box, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useEffect, useState } from "react";
import { PersonOutline, ContentCutOutlined } from "@mui/icons-material";
import { useAppDispatch } from "../../store/hooks";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import ServiceView from "./_components/service-view";
import StaffView from "./_components/staff-view";
import PageHeader from "../../components/page-header";


export type ViewMode = "service" | "staff";

export default function StaffServiceManagementPage() {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>("staff");

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
      <PageHeader
        title="Staff Service Pricing"
        subtitle={`Establish customizable pricing, commissions, or durations based on specific team assignments.`}
        action={<ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          size="small"
          className="bg-[var(--surface-muted)] p-1.5 rounded-2xl border border-[var(--border-subtle)] shrink-0"
        >
          <ToggleButton
            value="staff"
            aria-label="by staff"
            className={`border-none px-6 py-2 rounded-xl !transition-all capitalize whitespace-nowrap ${viewMode === "staff" ? "!bg-[var(--surface)] !shadow-sm !text-[var(--text-primary)] font-bold" : "!text-[var(--text-muted)] hover:!bg-[var(--surface-muted)]"}`}
          >
            <PersonOutline fontSize="small" className="mr-2" />
            <Typography variant="body2" fontWeight="bold" className="whitespace-nowrap uppercase tracking-wider text-xs">
              By Staff
            </Typography>
          </ToggleButton>
          <ToggleButton
            value="service"
            aria-label="by service"
            className={`border-none px-6 py-2 rounded-xl !transition-all capitalize whitespace-nowrap ${viewMode === "service" ? "!bg-[var(--surface)] !shadow-sm !text-[var(--text-primary)] font-bold" : "!text-[var(--text-muted)] hover:!bg-[var(--surface-muted)]"}`}
          >
            <ContentCutOutlined fontSize="small" className="mr-2" />
            <Typography variant="body2" fontWeight="bold" className="whitespace-nowrap uppercase tracking-wider text-xs">
              By Service
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>}
      />
      <Box className="flex-1 min-h-0 flex flex-col w-full bg-[var(--surface)] rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        {viewMode === "service" ? <ServiceView /> : <StaffView />}
      </Box>
    </Box>
  );
}
