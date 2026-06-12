import { Box, Typography, Button, IconButton, CircularProgress, Tooltip, Avatar } from "@mui/material";
import { AddOutlined, EditOutlined, DeleteOutline, DesignServicesOutlined, PersonOutline, AccessTimeOutlined } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { listStaffServices } from "../../../../features/staff/list-services/list-services.service";
import { unassignStaffFromService } from "../../../../features/staff-service/unassign-staff-service.service";
import { assignStaffToService } from "../../../../features/staff-service/staff-service.service";
import { callSnack } from "../../../../components/snackbar";
import AssignServicesDialog from "../../../staff/_components/assign-services-dialog";
import StaffServicePricingDialog from "../staff-service-pricing-dialog";
import type { StaffPricingType } from "../../types/staff-service.types";
import clsx from "clsx";

interface StaffServicesPanelProps {
  selectedStaffUuid: string | null;
}

interface DialogContext {
  staff_uuid: string;
  staff_name: string;
  service_uuid: string;
  service_name: string;
  current?: StaffPricingType;
}

export default function StaffServicesPanel({ selectedStaffUuid }: Readonly<StaffServicesPanelProps>) {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];
  const selectedStaff = staffs.find((s: any) => s.uuid === selectedStaffUuid);

  const { data: allServices } = useAppSelector((state: RootState) => state.service);

  const [assignedServices, setAssignedServices] = useState<StaffPricingType[]>([]);
  const [loading, setLoading] = useState(false);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<DialogContext | null>(null);

  const loadAssignedServices = async () => {
    if (!selectedStaffUuid) return;
    try {
      setLoading(true);
      const res = await listStaffServices(selectedStaffUuid);
      const rows = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setAssignedServices(rows);
    } catch {
      callSnack("Failed to load staff services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedServices();
  }, [selectedStaffUuid]);

  const groupedServices = useMemo(() => {
    if (!allServices.length || !assignedServices.length) return [];

    const serviceIdMap = new Map(allServices.map((s: any) => [s.id, s]));

    const groups = new Map<number, { parent: any; services: (any & { pricing: StaffPricingType })[] }>();

    assignedServices.forEach((pricingRow) => {
      const service: any = serviceIdMap.get(pricingRow.service_id) || {};

      const hasChildren = allServices.some((s: any) => s.parent_id && String(s.parent_id) === String(service.id));
      if (hasChildren && !service.parent_id) {
        return;
      }

      const parentId = service.parent_id ? service.parent_id : service.id;
      const parentService = serviceIdMap.get(parentId);

      if (!parentService) return;

      if (!groups.has(parentId)) {
        groups.set(parentId, { parent: parentService, services: [] });
      }

      groups.get(parentId)!.services.push({ ...service, pricing: pricingRow });
    });

    return Array.from(groups.values()).sort((a, b) => a.parent.name.localeCompare(b.parent.name));
  }, [allServices, assignedServices]);

  const handleOpenEdit = (serviceRow: any) => {
    if (!selectedStaffUuid || !selectedStaff) return;

    setDialogContext({
      staff_uuid: selectedStaffUuid,
      staff_name: `${selectedStaff.first_name} ${selectedStaff.last_name || ""}`.trim(),
      service_uuid: serviceRow.uuid,
      service_name: serviceRow.name,
      current: serviceRow.pricing,
    });
    setPricingDialogOpen(true);
  };

  const handleSavePricing = async (payload: { price_type: string; price: number; duration: number }) => {
    if (!dialogContext) return;

    try {
      await assignStaffToService({
        staff_services: [
          {
            staff_uuid: dialogContext.staff_uuid,
            service_uuid: dialogContext.service_uuid,
            price_type: payload.price_type,
            price: payload.price,
            duration: payload.duration,
          },
        ],
      });
      await loadAssignedServices();
      callSnack("Pricing updated successfully", "success");
    } catch (e: any) {
      callSnack(e?.response?.data?.message || "Failed to update pricing", "error");
    } finally {
      setPricingDialogOpen(false);
      setDialogContext(null);
    }
  };

  const handleRemove = async (staffServiceUuid: string) => {
    try {
      await unassignStaffFromService({ staff_services: [staffServiceUuid], cascade: false });
      await loadAssignedServices();
      callSnack("Service unassigned successfully", "success");
    } catch (e: any) {
      callSnack(e?.response?.data?.message || "Failed to unassign service", "error");
    }
  };

  if (!selectedStaffUuid || !selectedStaff) {
    return (
      <Box className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col items-center justify-center h-full text-center">
        <PersonOutline className="text-[var(--secondary-300)] w-12 h-12 mb-3" />
        <Typography variant="h6" className="text-[var(--text-primary)] font-medium">
          No Staff Selected
        </Typography>
        <Typography className="text-[var(--text-muted)] text-sm mt-1">
          Select a staff member from the sidebar to manage their services.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col min-h-full">
      <Box className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Box className="flex items-center gap-4">
          <Avatar src={selectedStaff.photos?.url} className="w-14 h-14 shadow-sm text-lg font-bold bg-[var(--surface-muted)] text-[var(--text-muted)]">
            {`${selectedStaff.first_name?.[0] || ""}${selectedStaff.last_name?.[0] || ""}`.toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight="800" className="text-[var(--text-primary)] capitalize flex items-center gap-2">
              {`${selectedStaff.first_name} ${selectedStaff.last_name || ""}`.trim()}
              <span className="bg-[var(--success-50)] text-[var(--success-700)] text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-widest uppercase">Active</span>
            </Typography>
            <Typography className="text-[var(--text-muted)] text-xs mt-0.5">
              <span className="capitalize">{selectedStaff.title}</span>
              · {selectedStaff.email}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => setAssignDialogOpen(true)}
          className="shrink-0 rounded-full shadow-sm px-6 py-2 normal-case tracking-wide font-semibold"
        >
          Assign Service
        </Button>
      </Box>

      <Typography fontWeight="bold" className="text-[var(--text-muted)] text-xs capitalize tracking-widest mb-6 border-b border-[var(--border-subtle)] pb-3">
        Current Assigned Services & Variations
      </Typography>

      {loading ? (
        <Box className="flex items-center justify-center py-12">
          <CircularProgress />
        </Box>
      ) : assignedServices.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--surface-muted)]">
          <DesignServicesOutlined className="text-[var(--secondary-300)] w-12 h-12 mb-3" />
          <Typography variant="h6" className="text-[var(--text-primary)] font-medium">
            No Services Assigned
          </Typography>
          <Typography className="text-[var(--text-muted)] text-sm mt-1 max-w-sm">
            This staff member doesn't provide any services yet.
          </Typography>
        </Box>
      ) : (
        <Box className="flex flex-col gap-6">
          {groupedServices.map((group) => (
            <Box key={group.parent.id} className="flex flex-col gap-3">
              <Typography fontWeight="bold" className="text-[var(--text-primary)] text-sm capitalize tracking-wider">
                {group.parent.name}
              </Typography>

              <Box className="grid grid-cols-1 2xl:grid-cols-2 gap-3 mt-2">
                {group.services.map((svc) => (
                  <Box
                    key={svc.uuid}
                    className="border border-[var(--border-subtle)] rounded-[20px] p-4 flex flex-wrap items-center justify-between gap-4 bg-[var(--surface-muted)] transition-all"
                  >
                    <Box className="flex items-center gap-4 min-w-0 pr-4">
                      <Avatar src={svc.logo ?? undefined} className="w-12 h-12 bg-[var(--surface-muted)] text-[var(--text-muted)] text-xl font-bold rounded-[14px] shadow-sm">
                        {!svc.logo && svc.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box className="min-w-0">
                        <Typography fontWeight="800" className="text-[var(--text-primary)] capitalize text-sm truncate flex items-center gap-1.5">
                          {svc.name}
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="flex items-center gap-4 shrink-0">
                      <Box className="flex items-center gap-2">
                        <Box className="bg-[var(--primary-50)] text-[var(--primary-800)] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                          ₹{svc.pricing.price ?? "-"}
                        </Box>
                        <Box className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <AccessTimeOutlined style={{ fontSize: "14px" }} className="text-[var(--text-muted)]" /> {svc.pricing.duration ?? "-"} m
                        </Box>
                      </Box>

                      <Box className="flex items-center gap-1 ml-2">
                        <Tooltip title="Edit Custom Pricing" arrow placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(svc)}
                            className="text-[var(--text-muted)] hover:text-[var(--primary-800)] hover:bg-[var(--surface-muted)]"
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Unassign Service" arrow placement="top">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemove(svc.pricing.uuid)}
                            className="text-[var(--text-muted)] hover:text-[var(--error-600)] hover:bg-[var(--error-50)]"
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {selectedStaff && assignDialogOpen && (
        <AssignServicesDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          staff={{ uuid: selectedStaff.uuid }}
          onAssigned={loadAssignedServices}
        />
      )}

      {dialogContext && (
        <StaffServicePricingDialog
          open={pricingDialogOpen}
          onClose={() => {
            setPricingDialogOpen(false);
            setDialogContext(null);
          }}
          context={dialogContext}
          onSave={handleSavePricing}
        />
      )}
    </Box>
  );
}
