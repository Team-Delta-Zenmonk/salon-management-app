import { Box, Typography, IconButton, CircularProgress, Tooltip, Avatar, Button } from "@mui/material";
import { EditOutlined, DeleteOutline, PersonOutline, PersonAddOutlined } from "@mui/icons-material";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../../../../../store/hooks";
import type { ServiceType, StaffPricingType } from "../../../../types/staff-service.types";
import type { RootState } from "../../../../../../store/store";
import { listStaffServices } from "../../../../../../features/staff/list-services/list-services.service";
import { callSnack } from "../../../../../../components/snackbar";
import { assignStaffToService } from "../../../../../../features/staff-service/staff-service.service";
import { unassignStaffFromService } from "../../../../../../features/staff-service/unassign-staff-service.service";
import StaffServicePricingDialog from "../../../staff-service-pricing-dialog";

interface DialogContext {
  staff_uuid: string;
  staff_name: string;
  service_uuid: string;
  service_name: string;
  current?: StaffPricingType;
}

export default function StaffPricingCards({
  selectedService,
  onAssignStaff,
}: Readonly<{ selectedService: ServiceType; onAssignStaff?: () => void }>) {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];

  const servicesToShow = useMemo(() => {
    const children = selectedService.children ?? [];
    return children.length > 0 ? children : [selectedService];
  }, [selectedService]);

  const [staffServicesMap, setStaffServicesMap] = useState<Record<string, StaffPricingType[] | undefined>>({});
  const [staffPricingLoading, setStaffPricingLoading] = useState<Record<string, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<DialogContext | null>(null);

  useEffect(() => {
    if (staffs.length === 0) {
      setInitialLoading(false);
      return;
    }

    const loadAll = async () => {
      await Promise.allSettled(staffs.map((staff) => ensureStaffServicesLoaded(staff.uuid)));
      setInitialLoading(false);
    };

    loadAll();
  }, [staffs]);

  const ensureStaffServicesLoaded = async (staff_uuid: string) => {
    if (staffServicesMap[staff_uuid] !== undefined || staffPricingLoading[staff_uuid]) return;

    try {
      setStaffPricingLoading((p) => ({ ...p, [staff_uuid]: true }));
      const res = await listStaffServices(staff_uuid);
      const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setStaffServicesMap((p) => ({ ...p, [staff_uuid]: rows }));
    } catch {
      setStaffServicesMap((p) => ({ ...p, [staff_uuid]: [] }));
    } finally {
      setStaffPricingLoading((p) => ({ ...p, [staff_uuid]: false }));
    }
  };

  const handleOpenEdit = async (staff_uuid: string, service: ServiceType, current?: StaffPricingType) => {
    const staff = staffs.find((s: any) => s.uuid === staff_uuid);
    if (!staff) return;

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

  const handleRemove = async (staff_uuid: string, staffServiceUuid: string) => {
    try {
      await unassignStaffFromService({ staff_services: [staffServiceUuid], cascade: false });
      const res = await listStaffServices(staff_uuid);
      const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setStaffServicesMap((p) => ({ ...p, [staff_uuid]: rows }));
      callSnack("Staff unassigned successfully", "success");
    } catch (e: any) {
      callSnack(e?.response?.data?.message || "Failed to unassign staff", "error");
    }
  };

  if (initialLoading) {
    return (
      <Box className="flex items-center justify-center py-10">
        <CircularProgress size={24} />
      </Box>
    );
  }

  const hasAnyAssignments = servicesToShow.some((service) => {
    return staffs.some((staff) => {
      const staffRows = staffServicesMap[staff.uuid] ?? [];
      return staffRows.some((row: any) => row.service_id === service.id);
    });
  });

  if (!hasAnyAssignments) {
    return (
      <Box className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <PersonAddOutlined className="text-gray-300 w-12 h-12 mb-3" />
        <Typography variant="h6" className="text-gray-700 font-medium">
          No Staff Assigned
        </Typography>
        <Typography className="text-gray-500 text-sm mt-1 mb-4 max-w-sm">
          No staff members are assigned to provide this service yet.
        </Typography>
        {onAssignStaff && (
          <Button variant="outlined" onClick={onAssignStaff}>
            Assign Staff
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-6">
      {servicesToShow.map((service) => {
        const assignedStaffs = staffs.flatMap((staff) => {
          const staffRows = staffServicesMap[staff.uuid] ?? [];
          const staffServiceRow = staffRows.find((row: any) => row.service_id === service.id);
          return staffServiceRow ? [{ staff, staffServiceRow }] : [];
        });

        if (assignedStaffs.length === 0) return null;

        const showHeader = servicesToShow.length > 1 || (selectedService.children?.length ?? 0) > 0;

        return (
          <Box key={service.uuid} className="flex flex-col gap-3">
            {showHeader && (
              <Typography fontWeight="bold" className="text-gray-800 text-sm uppercase tracking-wider">
                {service.name}
              </Typography>
            )}

            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {assignedStaffs.map(({ staff, staffServiceRow }) => {
                const staff_name = `${staff.first_name} ${staff.last_name || ""}`.trim();

                return (
                  <Box
                    key={staff.uuid}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-md"
                  >
                    <Box className="flex items-center gap-3 min-w-0 pr-4">
                      <Avatar src={staff.photos?.url} className="w-10 h-10 bg-gray-100 text-gray-500">
                        <PersonOutline fontSize="small" />
                      </Avatar>
                      <Box className="min-w-0">
                        <Typography fontWeight="bold" className="text-gray-900 truncate">
                          {staff_name}
                        </Typography>
                        <Box className="flex items-center gap-2 mt-1">
                          <Typography
                            variant="caption"
                            className={clsx(
                              "px-1.5 py-0.5 rounded font-medium",
                              staffServiceRow.price_type === "fixed"
                                ? "bg-green-100 text-green-700"
                                : staffServiceRow.price_type === "from"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-sky-100 text-sky-700",
                            )}
                          >
                            {staffServiceRow.price_type}
                          </Typography>
                          <Typography className="text-xs text-gray-500 font-medium">
                            ₹{staffServiceRow.price ?? "-"}
                          </Typography>
                          <Typography className="text-xs text-gray-400">•</Typography>
                          <Typography className="text-xs text-gray-500 font-medium">
                            {staffServiceRow.duration ?? "-"} min
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box className="flex items-center gap-1 shrink-0">
                      <Tooltip title="Edit Custom Pricing" arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(staff.uuid, service, staffServiceRow)}
                          className="text-indigo-600 hover:bg-indigo-50"
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Unassign Staff" arrow placement="top">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemove(staff.uuid, staffServiceRow.uuid!)}
                          className="hover:bg-red-50"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
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
