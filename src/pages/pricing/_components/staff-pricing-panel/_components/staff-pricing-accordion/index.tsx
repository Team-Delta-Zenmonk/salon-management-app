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

interface DialogContext {
  staff_uuid: string;
  staff_name: string;
  service_uuid: string;
  service_name: string;
  current?: StaffPricingType;
}

export default function StaffPricingAccordion({ selectedService }: { selectedService: ServiceType }) {
  const salonUUID = useAppSelector((state) => state.auth.salon.uuid);
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];
  const servicesToShow = useMemo(() => [selectedService, ...(selectedService.children ?? [])], [selectedService]);
  const [expandedStaffUuid, setExpandedStaffUuid] = useState<string | null>(null);

  const [staffServicesMap, setStaffServicesMap] = useState<Record<string, StaffPricingType[] | undefined>>({});
  const [staffPricingLoading, setStaffPricingLoading] = useState<Record<string, boolean>>({});

  const [serviceStaffMap, setServiceStaffMap] = useState<Record<string, { staff_id: number }[]>>({});
  const [serviceStaffLoading, setServiceStaffLoading] = useState<Record<string, boolean>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<DialogContext | null>(null);

  useEffect(() => {
    const serviceUuid = selectedService.uuid;
    if (serviceStaffMap[serviceUuid]) return;
    (async () => {
      try {
        setServiceStaffLoading((p) => ({ ...p, [serviceUuid]: true }));
        const res = await listServiceStaff(serviceUuid, salonUUID);
        const rows = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
        const mapped = rows.map((r: any) => ({ staff_id: r.staff_id }));
        setServiceStaffMap((p) => ({ ...p, [serviceUuid]: mapped }));
      } catch (e) {
        callSnack("Failed to load staff for this service", "error");
        setServiceStaffMap((p) => ({ ...p, [serviceUuid]: [] }));
      } finally {
        setServiceStaffLoading((p) => ({ ...p, [serviceUuid]: false }));
      }
    })();
  }, [selectedService.uuid]);

  const assignedStaffForSelectedService = useMemo(() => {
    const serviceUuid = selectedService.uuid;
    const rows = serviceStaffMap[serviceUuid] ?? [];
    return rows.map((r) => staffs.find((s: any) => s.id === r.staff_id)).filter(Boolean) as any[];
  }, [selectedService.uuid, serviceStaffMap, staffs]);

  const ensureStaffServicesLoaded = async (staff_uuid: string) => {
    if (staffServicesMap[staff_uuid] !== undefined) return;

    try {
      setStaffPricingLoading((p) => ({ ...p, [staff_uuid]: true }));
      const res = await listStaffServices(staff_uuid);
      const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setStaffServicesMap((p) => ({ ...p, [staff_uuid]: rows }));
    } catch (e) {
      callSnack("Failed to load staff pricing", "error");
      setStaffServicesMap((p) => ({ ...p, [staff_uuid]: [] }));
    } finally {
      setStaffPricingLoading((p) => ({ ...p, [staff_uuid]: false }));
    }
  };

  const handleToggleStaff = async (staff_uuid: string) => {
    const next = expandedStaffUuid === staff_uuid ? null : staff_uuid;
    setExpandedStaffUuid(next);

    if (next) {
      await ensureStaffServicesLoaded(next);
    }
  };

  const handleOpenEdit = async (staff_uuid: string, service: ServiceType) => {
    const staff = staffs.find((s: any) => s.uuid === staff_uuid);
    if (!staff) return;

    await ensureStaffServicesLoaded(staff_uuid);

    const staffRows = staffServicesMap[staff_uuid] ?? [];
    const current = staffRows.find((r: any) => r.service_id === service.id);

    setDialogContext({
      staff_uuid,
      staff_name: `${staff.first_name} ${staff.last_name ?? ""}`.trim(),
      service_uuid: service.uuid,
      service_name: service.name,
      current,
    });
    setDialogOpen(true);
  };

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
      const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setStaffServicesMap((p) => ({ ...p, [staff_uuid]: rows }));

      callSnack("Pricing updated successfully", "success");
    } catch (e: any) {
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
          const staff_name = `${staff.first_name} ${staff.last_name || ""}`.trim();
          const loading = staffPricingLoading[staff_uuid] ?? false;

          const staffRows = staffServicesMap[staff_uuid] ?? [];

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

              <AccordionDetails className="px-3 py-3">
                {loading ? (
                  <Box className="flex items-center justify-center py-4">
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <Box className="flex flex-col gap-3">
                    {servicesToShow.map((service) => {
                      const staffServiceRow = staffRows.find((row: any) => row.service_id === service.id);
                      return (
                        <Box
                          key={service.uuid}
                          className="border rounded-lg p-3 flex items-center justify-between bg-gray-50 border-gray-400"
                        >
                          <Box className="min-w-0">
                            <Typography fontWeight="medium" className="truncate">
                              {service.uuid === selectedService.uuid ? `${service.name} (Main)` : service.name}
                            </Typography>
                            <Typography className="text-xs text-gray-600">
                              {staffServiceRow ? (
                                <>
                                  {staffServiceRow.price_type ?? "-"} · ₹{staffServiceRow.price ?? "-"} ·{" "}
                                  {staffServiceRow.duration ?? "-"} min
                                </>
                              ) : (
                                "-"
                              )}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => handleOpenEdit(staff_uuid, service)}>
                            <EditOutlined fontSize="small" className="text-(--primary-900)!" />
                          </IconButton>
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
