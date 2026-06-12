import { Box, Typography, IconButton, CircularProgress, Tooltip, Avatar, Button } from "@mui/material";
import { EditOutlined, DeleteOutline, PersonOutline, PersonAddOutlined, AddOutlined, AccessTimeOutlined } from "@mui/icons-material";
import clsx from "clsx";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppSelector } from "../../../../../../store/hooks";
import type { ServiceType, StaffPricingType } from "../../../../types/staff-service.types";
import type { RootState } from "../../../../../../store/store";
import { listServiceStaff } from "../../../../../../features/service/list-staff/list-staff.service";
import { callSnack } from "../../../../../../components/snackbar";
import { assignStaffToService } from "../../../../../../features/staff-service/staff-service.service";
import { unassignStaffFromService } from "../../../../../../features/staff-service/unassign-staff-service.service";
import StaffServicePricingDialog from "../../../staff-service-pricing-dialog";
import AssignStaffDialog from "../../../../../services/_components/assign-staff-dialog";

interface DialogContext {
  staff_uuid: string;
  staff_name: string;
  service_uuid: string;
  service_name: string;
  current?: StaffPricingType;
}

export default function StaffPricingCards({ selectedService }: Readonly<{ selectedService: ServiceType }>) {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];
  const salonUUID = useAppSelector((state: RootState) => state.auth.salon.uuid);

  const servicesToShow = useMemo(() => {
    const children = selectedService.children ?? [];
    return children.length > 0 ? children : [selectedService];
  }, [selectedService]);

  const [serviceStaffsMap, setServiceStaffsMap] = useState<Record<string, StaffPricingType[]>>({});
  const [servicePricingLoading, setServicePricingLoading] = useState<Record<string, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<DialogContext | null>(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const loadServiceStaffs = useCallback(async () => {
    if (servicesToShow.length === 0 || !salonUUID) {
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    setServiceStaffsMap({});

    await Promise.allSettled(
      servicesToShow.map(async (svc) => {
        try {
          setServicePricingLoading((p) => ({ ...p, [svc.uuid]: true }));
          const res = await listServiceStaff(svc.uuid, salonUUID);
          const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
          setServiceStaffsMap((p) => ({ ...p, [svc.uuid]: rows }));
        } catch {
          setServiceStaffsMap((p) => ({ ...p, [svc.uuid]: [] }));
        } finally {
          setServicePricingLoading((p) => ({ ...p, [svc.uuid]: false }));
        }
      }),
    );

    setInitialLoading(false);
  }, [servicesToShow, salonUUID]);

  useEffect(() => {
    loadServiceStaffs();
  }, [loadServiceStaffs]);

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
      const res = await listServiceStaff(service_uuid, salonUUID);
      const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setServiceStaffsMap((p) => ({ ...p, [service_uuid]: rows }));

      callSnack("Pricing updated successfully", "success");
    } catch (e: any) {
      callSnack(e?.response?.data?.message || "Failed to update pricing", "error");
    } finally {
      setDialogOpen(false);
      setDialogContext(null);
    }
  };

  const handleRemove = async (service_uuid: string, staffServiceUuid: string) => {
    try {
      await unassignStaffFromService({ staff_services: [staffServiceUuid], cascade: false });
      const res = await listServiceStaff(service_uuid, salonUUID);
      const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setServiceStaffsMap((p) => ({ ...p, [service_uuid]: rows }));
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
    const assignedRows = serviceStaffsMap[service.uuid] ?? [];
    return assignedRows.length > 0;
  });

  return (
    <>
      <Box className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Box className="flex items-center gap-4">
          <Avatar src={selectedService.logo ?? undefined} className="w-14 h-14 shadow-sm rounded-[14px]">
            {selectedService.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight="800" className="text-[var(--text-primary)] capitalize flex items-center gap-2">
              {selectedService.name}
              <span className="bg-[var(--primary-50)] text-[var(--primary-800)] text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wide">Base ₹{selectedService.price ?? "-"}</span>
            </Typography>
            <Typography className="text-[var(--text-muted)] text-xs mt-0.5">
              Hair Styling & Spa · {selectedService.duration ?? "-"} mins base
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => setAssignDialogOpen(true)}
          className="shrink-0 rounded-full shadow-sm px-6 py-2 normal-case tracking-wide font-semibold"
        >
          Assign Staff
        </Button>
      </Box>

      <Typography fontWeight="bold" className="text-[var(--text-muted)] text-xs capitalize tracking-widest mb-6 border-b border-[var(--border-subtle)] pb-3">
        Stylist Custom Pricing Breakdown
      </Typography>

      {!hasAnyAssignments ? (
        <Box className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--surface-muted)]">
          <PersonAddOutlined className="text-[var(--secondary-300)] w-12 h-12 mb-3" />
          <Typography variant="h6" className="text-[var(--text-primary)] font-medium">
            No Staff Assigned
          </Typography>
          <Typography className="text-[var(--text-muted)] text-sm mt-1 max-w-sm">
            No staff members are assigned to provide this service yet.
          </Typography>
        </Box>
      ) : (
        <Box className="flex flex-col gap-6">
          {servicesToShow.map((service) => {
            const assignedRows = serviceStaffsMap[service.uuid] ?? [];
            if (assignedRows.length === 0) return null;

            const assignedStaffs = assignedRows
              .map((row) => {
                const staff =
                  staffs.find((s) => s.id === row.staff_id) || staffs.find((s) => s.uuid === row.staff_uuid);
                return { staff, staffServiceRow: row };
              })
              .filter((item): item is { staff: any; staffServiceRow: StaffPricingType } => Boolean(item.staff));

            if (assignedStaffs.length === 0) return null;

            const showHeader = servicesToShow.length > 1 || (selectedService.children?.length ?? 0) > 0;

            return (
              <Box key={service.uuid} className="flex flex-col gap-3">
                {showHeader && (
                  <Typography fontWeight="bold" className="text-[var(--text-primary)] capitalize text-sm tracking-wider">
                    {service.name}
                  </Typography>
                )}

                <Box className="grid grid-cols-1 2xl:grid-cols-2 gap-3 mt-2">
                  {assignedStaffs.map(({ staff, staffServiceRow }) => {
                    const staff_name = `${staff.first_name} ${staff.last_name || ""}`.trim();

                    return (
                      <Box
                        key={staff.uuid}
                        className="border border-[var(--border-subtle)] rounded-[20px] p-4 flex flex-wrap items-center justify-between gap-4 bg-[var(--surface-muted)] transition-all"
                      >
                        <Box className="flex items-center gap-4 min-w-0 pr-4">
                          <Avatar src={staff.photos?.url} className="w-12 h-12 bg-[var(--surface-muted)] text-[var(--text-muted)] shadow-sm">
                            <PersonOutline fontSize="small" />
                          </Avatar>
                          <Box className="min-w-0">
                            <Typography fontWeight="800" className="text-[var(--text-primary)] capitalize text-sm truncate">
                              {staff_name}
                            </Typography>
                            <Typography className="text-xs capitalize text-[var(--text-muted)] mt-0.5">
                              {service.name}
                            </Typography>
                          </Box>
                        </Box>

                        <Box className="flex items-center gap-4 shrink-0">
                          <Box className="flex items-center gap-2">
                            <Box className="bg-[var(--primary-50)] text-[var(--primary-800)] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                              ₹{staffServiceRow.price ?? "-"}
                            </Box>
                            <Box className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                              <AccessTimeOutlined style={{ fontSize: "14px" }} className="text-[var(--text-muted)]" /> {staffServiceRow.duration ?? "-"} m
                            </Box>
                          </Box>

                          <Box className="flex items-center gap-1 ml-2">
                            <Tooltip title="Edit Custom Pricing" arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(staff.uuid, service, staffServiceRow)}
                                className="text-[var(--text-muted)] hover:text-[var(--primary-800)] hover:bg-[var(--surface-muted)]"
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Unassign Staff" arrow placement="top">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemove(service.uuid, staffServiceRow.uuid!)}
                                className="text-[var(--text-muted)] hover:text-[var(--error-600)] hover:bg-[var(--error-50)]"
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

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

      {assignDialogOpen && (
        <AssignStaffDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          serviceUuid={selectedService.uuid}
          service={{
            price_type: selectedService.price_type ?? "fixed",
            price: selectedService.price ?? 0,
            duration: selectedService.duration ?? 0,
          }}
          onStaffAssigned={loadServiceStaffs}
        />
      )}
    </>
  );
}
