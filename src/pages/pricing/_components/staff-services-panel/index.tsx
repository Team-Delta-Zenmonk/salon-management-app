import { Box, Typography, Button, IconButton, CircularProgress, Tooltip, Avatar } from "@mui/material";
import { AddOutlined, EditOutlined, DeleteOutline, DesignServicesOutlined, PersonOutline } from "@mui/icons-material";
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
      <Box className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center h-full text-center">
        <PersonOutline className="text-gray-300 w-12 h-12 mb-3" />
        <Typography variant="h6" className="text-gray-700 font-medium">
          No Staff Selected
        </Typography>
        <Typography className="text-gray-500 text-sm mt-1">
          Select a staff member from the sidebar to manage their services.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col min-h-full">
      <Box className="flex flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
        <Box>
          <Typography variant="h6" fontWeight="bold" className="text-(--primary-900)">
            {`${selectedStaff.first_name} ${selectedStaff.last_name || ""}`.trim()}'s Services
          </Typography>
          <Typography className="text-gray-600 text-sm">
            Manage the services provided by this staff member and their custom pricing.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined className="text-white!" />}
          onClick={() => setAssignDialogOpen(true)}
          className="shrink-0"
        >
          Assign Services
        </Button>
      </Box>

      {loading ? (
        <Box className="flex items-center justify-center py-12">
          <CircularProgress />
        </Box>
      ) : assignedServices.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <DesignServicesOutlined className="text-gray-300 w-12 h-12 mb-3" />
          <Typography variant="h6" className="text-gray-700 font-medium">
            No Services Assigned
          </Typography>
          <Typography className="text-gray-500 text-sm mt-1 mb-4 max-w-sm">
            This staff member doesn't provide any services yet.
          </Typography>
          <Button variant="outlined" onClick={() => setAssignDialogOpen(true)}>
            Assign Services
          </Button>
        </Box>
      ) : (
        <Box className="flex flex-col gap-6">
          {groupedServices.map((group) => (
            <Box key={group.parent.id} className="flex flex-col gap-3">
              <Typography fontWeight="bold" className="text-gray-800 text-sm uppercase tracking-wider">
                {group.parent.name}
              </Typography>

              <Box className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
                {group.services.map((svc) => (
                  <Box
                    key={svc.uuid}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-md"
                  >
                    <Box className="flex items-center gap-3 min-w-0 pr-4">
                      <Avatar src={svc.logo ?? undefined} className="w-10 h-10 bg-gray-100 text-gray-500">
                        <DesignServicesOutlined fontSize="small" />
                      </Avatar>
                      <Box className="min-w-0">
                        <Typography fontWeight="bold" className="text-gray-900 truncate">
                          {svc.name}
                        </Typography>
                        <Box className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                          <Typography
                            variant="caption"
                            className={clsx(
                              "px-1.5 py-0.5 rounded font-medium whitespace-nowrap",
                              svc.pricing.price_type === "fixed"
                                ? "bg-green-100 text-green-700"
                                : svc.pricing.price_type === "from"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-sky-100 text-sky-700",
                            )}
                          >
                            {svc.pricing.price_type}
                          </Typography>
                          <Typography className="text-xs text-gray-500 font-medium whitespace-nowrap">
                            ₹{svc.pricing.price ?? "-"}
                          </Typography>
                          <Typography className="text-xs text-gray-400">•</Typography>
                          <Typography className="text-xs text-gray-500 font-medium whitespace-nowrap">
                            {svc.pricing.duration ?? "-"} min
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box className="flex items-center gap-1 shrink-0">
                      <Tooltip title="Edit Custom Pricing" arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(svc)}
                          className="text-indigo-600 hover:bg-indigo-50"
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Unassign Service" arrow placement="top">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemove(svc.pricing.uuid)}
                          className="hover:bg-red-50"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
