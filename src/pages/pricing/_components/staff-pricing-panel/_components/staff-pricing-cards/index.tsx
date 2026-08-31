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
import { Edit2, Trash2, User, UserPlus, Plus, Loader2 } from "lucide-react";
import { Button } from "../../../../../../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../../../components/ui/avatar";
import type { Staff } from "../../../../../../features/staff/staff.slice";

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
          const res = await listServiceStaff(svc.uuid, salonUUID);
          const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
          setServiceStaffsMap((p) => ({ ...p, [svc.uuid]: rows }));
        } catch {
          setServiceStaffsMap((p) => ({ ...p, [svc.uuid]: [] }));
        }
      }),
    );

    setInitialLoading(false);
  }, [servicesToShow, salonUUID]);

  useEffect(() => {
    loadServiceStaffs();
  }, [loadServiceStaffs]);

  const handleOpenEdit = async (staff_uuid: string, service: ServiceType, current?: StaffPricingType) => {
    const staff = staffs.find((s: Staff) => s.uuid === staff_uuid);
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
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      callSnack(err?.response?.data?.message || "Failed to update pricing", "error");
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
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      callSnack(err?.response?.data?.message || "Failed to unassign staff", "error");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-semibold">Loading staff pricing...</span>
      </div>
    );
  }

  const hasAnyAssignments = servicesToShow.some((service) => {
    const assignedRows = serviceStaffsMap[service.uuid] ?? [];
    return assignedRows.length > 0;
  });

  return (
    <>
      {/* Panel Header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/60 mb-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-6 rounded bg-primary shrink-0" />
            {selectedService.name} Staff Pricing
          </h2>
          <p className="text-muted-foreground/80 text-xs sm:text-sm">
            View staff price & duration for this service and its subservices.
          </p>
        </div>
        <Button
          onClick={() => setAssignDialogOpen(true)}
          className="shrink-0 rounded-xl shadow-sm shadow-primary/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Assign Staff
        </Button>
      </div>

      {!hasAnyAssignments ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/40">
            <UserPlus className="text-muted-foreground w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            No Staff Assigned
          </h3>
          <p className="text-muted-foreground/80 text-sm mt-1.5 max-w-xs">
            No staff members are assigned to provide this service yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssignDialogOpen(true)}
            className="mt-5 rounded-xl"
          >
            Assign Staff Now
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {servicesToShow.map((service) => {
            const assignedRows = serviceStaffsMap[service.uuid] ?? [];
            if (assignedRows.length === 0) return null;

            const assignedStaffs = assignedRows
              .map((row) => {
                const staff =
                  staffs.find((s) => s.id === row.staff_id) || staffs.find((s) => s.uuid === row.staff_uuid);
                return { staff, staffServiceRow: row };
              })
              .filter((item): item is { staff: Staff; staffServiceRow: StaffPricingType } => Boolean(item.staff));

            if (assignedStaffs.length === 0) return null;

            const showHeader = servicesToShow.length > 1 || (selectedService.children?.length ?? 0) > 0;

            return (
              <div key={service.uuid} className="flex flex-col gap-4">
                {showHeader && (
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-foreground/80 text-xs uppercase tracking-wider">
                      {service.name}
                    </h4>
                    <div className="h-px bg-border/55 flex-1" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedStaffs.map(({ staff, staffServiceRow }) => {
                    const staff_name = `${staff.first_name} ${staff.last_name || ""}`.trim();

                    return (
                      <div
                        key={staff.uuid}
                        className="group relative border border-border/50 rounded-2xl p-4.5 flex items-center justify-between bg-card/60 backdrop-blur-md hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 overflow-hidden"
                      >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="flex items-center gap-3.5 min-w-0 pr-4 relative z-10">
                          <Avatar className="w-11 h-11 bg-muted border border-border/40 text-muted-foreground transition-transform duration-200 group-hover:scale-105">
                            {staff.photos?.url ? (
                               <AvatarImage src={staff.photos.url} alt={staff_name} />
                            ) : (
                               <AvatarFallback className="bg-transparent"><User className="h-5 w-5"/></AvatarFallback>
                            )}
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">
                              {staff_name}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                              <span
                                className={clsx(
                                  "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold whitespace-nowrap border",
                                  staffServiceRow.price_type === "fixed"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                                    : staffServiceRow.price_type === "from"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10",
                                )}
                              >
                                {staffServiceRow.price_type}
                              </span>
                              <span className="text-xs text-foreground/80 font-bold whitespace-nowrap">
                                ₹{staffServiceRow.price ?? "-"}
                              </span>
                              <span className="text-xs text-muted-foreground/50 select-none">•</span>
                              <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                                {staffServiceRow.duration ?? "-"} min
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 relative z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(staff.uuid, service, staffServiceRow)}
                            className="h-8.5 w-8.5 rounded-full hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground transition-all"
                            title="Edit Custom Pricing"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(service.uuid, staffServiceRow.uuid!)}
                            className="h-8.5 w-8.5 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                            title="Unassign Staff"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
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

