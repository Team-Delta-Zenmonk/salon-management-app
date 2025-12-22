import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { ExpandMore, EditOutlined } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../../../../../store/hooks";
import type { ServiceType, StaffPricingType } from "../../../../types/staff-service.types";
import type { RootState } from "../../../../../../store/store";
import { listStaffServices } from "../../../../../../features/staff/list-services/list-services.service";
import { callSnack } from "../../../../../../components/snackbar";
import { listServiceStaff } from "../../../../../../features/service/list-staff/list-staff.service";
import { assignStaffToService } from "../../../../../../features/staff-service/staff-service.service";
import StaffServicePricingDialog from "../staff-service-pricing-dialog";

export default function StaffPricingAccordion({ selectedService }: { selectedService: ServiceType }) {
  const staffs = useAppSelector((state: RootState) => state.staff.staffs) ?? [];

  const services = useMemo(() => [selectedService, ...(selectedService.children ?? [])], [selectedService]);

  const [expandedStaffUuid, setExpandedStaffUuid] = useState<string | null>(null);
  const [staffServicesMap, setStaffServicesMap] = useState<Record<string, StaffPricingType[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const [serviceStaffMap, setServiceStaffMap] = useState<Record<string, { staff_id: number; staff_uuid: string }[]>>(
    {}
  );
  const [serviceStaffLoading, setServiceStaffLoading] = useState<Record<string, boolean>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<{
    staff_uuid: string;
    staff_name: string;
    service_uuid: string;
    service_name: string;
    current?: StaffPricingType;
  } | null>(null);

  const handleToggleStaff = async (staff_uuid: string) => {
    const next = expandedStaffUuid === staff_uuid ? null : staff_uuid;
    setExpandedStaffUuid(next);

    if (next && !staffServicesMap[next]) {
      try {
        setLoadingMap((p) => ({ ...p, [next]: true }));
        const res = await listStaffServices(next);
        const rows: StaffPricingType[] = Array.isArray(res) ? res : res?.rows ?? [];
        setStaffServicesMap((p) => ({ ...p, [next]: rows }));
      } catch (e) {
        console.error("listStaffServices error", e);
        callSnack("Failed to load staff pricing", "error");
        setStaffServicesMap((p) => ({ ...p, [next]: [] }));
      } finally {
        setLoadingMap((p) => ({ ...p, [next]: false }));
      }
    }
  };

  const handleOpenEdit = (staff_uuid: string, service: ServiceType) => {
    const staff = staffs.find((s: any) => s.uuid === staff_uuid);
    if (!staff) return;

    const staffRows = staffServicesMap[staff_uuid] ?? [];
    const current = staffRows.find((r) => r.service_uuid === service.uuid);

    setDialogContext({
      staff_uuid,
      staff_name: `${staff.first_name} ${staff.last_name ?? ""}`,
      service_uuid: service.uuid,
      service_name: service.name,
      current,
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    const loadServiceStaff = async () => {
      if (!selectedService) return;
      const serviceUuid = selectedService.uuid;
      if (serviceStaffMap[serviceUuid]) return;

      try {
        setServiceStaffLoading((p) => ({ ...p, [serviceUuid]: true }));
        const assignedStaffData = await listServiceStaff(serviceUuid);
        const rows = Array.isArray(assignedStaffData) ? assignedStaffData : assignedStaffData?.rows ?? [];
        const staffRows = rows.map((item: any) => ({
          staff_id: item.staff_id,
          staff_uuid: item.staff_uuid,
        }));
        setServiceStaffMap((p) => ({ ...p, [serviceUuid]: staffRows }));
      } catch (e) {
        console.error("listServiceStaff error", e);
        callSnack("Failed to load staff for this service", "error");
        setServiceStaffMap((p) => ({ ...p, [serviceUuid]: [] }));
      } finally {
        setServiceStaffLoading((p) => ({ ...p, [serviceUuid]: false }));
      }
    };

    loadServiceStaff();
  }, [selectedService, serviceStaffMap]);

  const assignedStaffForSelectedService = useMemo(() => {
    if (!selectedService) return [];
    const rows = serviceStaffMap[selectedService.uuid] ?? [];
    return rows
      .map((r) => staffs.find((s: any) => s.id === r.staff_id || s.uuid === r.staff_uuid))
      .filter(Boolean) as any[];
  }, [selectedService, serviceStaffMap, staffs]);

  const handleSave = async (payload: { price_type: string; price: number; duration: number }) => {
    if (!dialogContext) return;

    const staff_uuid = dialogContext.staff_uuid;
    const service_uuid = dialogContext.service_uuid;

    try {
      await assignStaffToService({
        staff_services: [
          {
            staff_uuid,
            service_uuid,
            price_type: payload.price_type,
            price: payload.price,
            duration: payload.duration,
          },
        ],
      });

      const res = await listStaffServices(staff_uuid);
      const rows: StaffPricingType[] = Array.isArray(res) ? res : res?.rows ?? [];
      setStaffServicesMap((p) => ({ ...p, [staff_uuid]: rows }));

      callSnack("Pricing updated successfully", "success");
    } catch (e: any) {
      console.error("assignStaffToService error", e);
      callSnack(e?.response?.data?.message || "Failed to update pricing", "error");
    } finally {
      setDialogOpen(false);
      setDialogContext(null);
    }
  };

  return (
    <Box className="flex flex-col gap-3">
      {serviceStaffLoading[selectedService.uuid] && (
        <Box className="flex items-center justify-center py-4">
          <CircularProgress size={20} />
        </Box>
      )}

      {!serviceStaffLoading[selectedService.uuid] && assignedStaffForSelectedService.length === 0 && (
        <Typography className="text-gray-500 text-sm">No staff assigned to this service yet.</Typography>
      )}

      {!serviceStaffLoading[selectedService.uuid] &&
        assignedStaffForSelectedService.map((staff: any) => {
          const staff_uuid = staff.uuid;
          const staff_name = `${staff.first_name} ${staff.last_name || ""}`;
          const loading = loadingMap[staff_uuid] ?? false;

          return (
            <Accordion
              key={staff_uuid}
              disableGutters
              square={false}
              elevation={0}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              expanded={expandedStaffUuid === staff_uuid}
              onChange={() => handleToggleStaff(staff_uuid)}
            >
              <AccordionSummary expandIcon={<ExpandMore className="text-gray-500" />} className="px-3 py-2">
                <Box className="min-w-0">
                  <Typography fontWeight="bold" className="truncate text-(--primary-900)">
                    {staff_name}
                  </Typography>
                  <Typography className="text-xs text-gray-500 truncate">{staff.email}</Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails className="px-3 py-3 ">
                {loading ? (
                  <Box className="flex items-center justify-center py-4">
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <Box className="flex flex-col gap-3 ">
                    {services.map((s) => {
                      return (
                        <Box
                          key={s.uuid}
                          className="border rounded-lg p-3 flex items-center justify-between bg-gray-50 border-gray-400"
                        >
                          <Box className="min-w-0">
                            <Typography fontWeight="medium" className="truncate">
                              {s.uuid === selectedService.uuid ? `${s.name} (Main)` : s.name}
                            </Typography>
                            <Typography className="text-xs text-gray-500">
                              {s.price_type ?? "-"} ₹{s.price ?? "-"} Duration: {s.duration ?? "-"} min
                            </Typography>
                          </Box>

                          {s.uuid !== selectedService.uuid && (
                            <IconButton
                              size="small"
                              className="text-(--primary-700)"
                              onClick={() => handleOpenEdit(staff_uuid, s)}
                            >
                              <EditOutlined fontSize="small" className="text-(--primary-900)!" />
                            </IconButton>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}

      {dialogContext && (
        <StaffServicePricingDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setDialogContext(null);
          }}
          context={dialogContext}
          onSave={handleSave}
        />
      )}
    </Box>
  );
}
