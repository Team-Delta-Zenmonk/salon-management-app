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
import InfiniteScroll from "react-infinite-scroll-component";
import { Button } from "../../../../../../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../../../components/ui/avatar";
import type { Staff } from "../../../../../../features/staff/staff.slice";
import { EllipsisCell } from "@/components/ellipse-cell";

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
  const salonUUID = useAppSelector((state: RootState) => state.auth.salon?.uuid ?? "");

  const servicesToShow = useMemo(() => {
    const children = selectedService.children ?? [];
    return children.length > 0 ? children : [selectedService];
  }, [selectedService]);

  const [serviceStaffsMap, setServiceStaffsMap] = useState<Record<string, StaffPricingType[]>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageMap, setPageMap] = useState<Record<string, number>>({});
  const [hasMoreMap, setHasMoreMap] = useState<Record<string, boolean>>({});
  const pageSize = 12;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<DialogContext | null>(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadServiceStaffs = useCallback(async () => {
    if (servicesToShow.length === 0 || !salonUUID) {
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    const initialStaffsMap: Record<string, StaffPricingType[]> = {};
    const initialPageMap: Record<string, number> = {};
    const initialHasMoreMap: Record<string, boolean> = {};

    await Promise.allSettled(
      servicesToShow.map(async (svc) => {
        try {
          const res = await listServiceStaff(svc.uuid, salonUUID, { page: 1, limit: pageSize, include_parent: true });
          const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.data ?? res?.rows ?? []);
          const total = typeof res?.total === "number" ? res.total : rows.length;
          initialStaffsMap[svc.uuid] = rows;
          initialPageMap[svc.uuid] = 1;
          initialHasMoreMap[svc.uuid] = rows.length === pageSize && rows.length < total;
        } catch {
          initialStaffsMap[svc.uuid] = [];
          initialPageMap[svc.uuid] = 1;
          initialHasMoreMap[svc.uuid] = false;
        }
      }),
    );

    setServiceStaffsMap(initialStaffsMap);
    setPageMap(initialPageMap);
    setHasMoreMap(initialHasMoreMap);
    setInitialLoading(false);
  }, [servicesToShow, salonUUID, pageSize]);

  const hasAnyMore = useMemo(() => {
    return servicesToShow.some((svc) => hasMoreMap[svc.uuid]);
  }, [servicesToShow, hasMoreMap]);

  const totalLoadedStaffCount = useMemo(() => {
    return Object.values(serviceStaffsMap).reduce((acc, list) => acc + (list?.length || 0), 0);
  }, [serviceStaffsMap]);

  const fetchMoreServiceStaffs = useCallback(async () => {
    if (loadingMore || !hasAnyMore || !salonUUID) return;
    try {
      setLoadingMore(true);
      const servicesToFetch = servicesToShow.filter((svc) => hasMoreMap[svc.uuid]);

      await Promise.allSettled(
        servicesToFetch.map(async (svc) => {
          const currentPage = pageMap[svc.uuid] || 1;
          const nextPage = currentPage + 1;
          try {
            const res = await listServiceStaff(svc.uuid, salonUUID, { page: nextPage, limit: pageSize, include_parent: true });
            const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.data ?? res?.rows ?? []);
            const total = typeof res?.total === "number" ? res.total : rows.length;

            setServiceStaffsMap((prev) => {
              const currentList = prev[svc.uuid] || [];
              const existingUuids = new Set(currentList.map((s) => s.uuid));
              const newRows = rows.filter((r: StaffPricingType) => !existingUuids.has(r.uuid));
              return { ...prev, [svc.uuid]: [...currentList, ...newRows] };
            });
            setPageMap((prev) => ({ ...prev, [svc.uuid]: nextPage }));
            setHasMoreMap((prev) => ({
              ...prev,
              [svc.uuid]: rows.length === pageSize && ((serviceStaffsMap[svc.uuid]?.length || 0) + rows.length) < total,
            }));
          } catch {
            setHasMoreMap((prev) => ({ ...prev, [svc.uuid]: false }));
          }
        }),
      );
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasAnyMore, salonUUID, servicesToShow, hasMoreMap, pageMap, pageSize, serviceStaffsMap]);

  useEffect(() => {
    loadServiceStaffs();
  }, [loadServiceStaffs]);

  useEffect(() => {
    if (!hasAnyMore || initialLoading || loadingMore) return;
    const el = document.getElementById("service-staff-panel-scroll");
    if (!el) return;
    const timer = setTimeout(() => {
      if (el.scrollHeight <= el.clientHeight) {
        fetchMoreServiceStaffs();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [totalLoadedStaffCount, hasAnyMore, initialLoading, loadingMore, fetchMoreServiceStaffs]);

  const handleOpenEdit = async (staff_uuid: string, service: ServiceType, current?: StaffPricingType, fallbackStaff?: Staff) => {
    const staff = staffs.find((s: Staff) => s.uuid === staff_uuid) || fallbackStaff;
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
      const res = await listServiceStaff(service_uuid, salonUUID, { include_parent: true });
      const rows: StaffPricingType[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setServiceStaffsMap((p) => ({ ...p, [service_uuid]: rows }));

      callSnack("Pricing updated successfully", "success");
    } catch (e: unknown) {
      const err = e as any;
      const responseData = err?.response?.data;
      const msg = typeof responseData === "string" ? responseData : responseData?.message || responseData?.error;
      callSnack(msg || err?.message || "Failed to update pricing", "error");
    } finally {
      setDialogOpen(false);
      setDialogContext(null);
    }
  };

  const handleRemove = async (service_uuid: string, staffServiceUuid: string) => {
    if (deletingId) return;
    try {
      setDeletingId(staffServiceUuid);
      setServiceStaffsMap((prev) => {
        const currentRows = prev[service_uuid] || [];
        return {
          ...prev,
          [service_uuid]: currentRows.filter((r) => r.uuid !== staffServiceUuid),
        };
      });

      await unassignStaffFromService({ staff_services: [staffServiceUuid], cascade: false });
      await loadServiceStaffs();
      callSnack("Staff unassigned successfully", "success");
    } catch (e: unknown) {
      const err = e as any;
      const responseData = err?.response?.data;
      const msg = typeof responseData === "string" ? responseData : responseData?.message || responseData?.error;
      callSnack(msg || err?.message || "Failed to unassign staff", "error");
      await loadServiceStaffs();
    } finally {
      setDeletingId(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
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
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border/50 mb-6">
        <div className="space-y-1 min-w-[240px] flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-6 rounded bg-primary shrink-0" />
            <EllipsisCell
              value={`${selectedService.name} Staff Pricing`}
              className="text-base sm:text-lg font-bold text-foreground capitalize block min-w-0"
              maxChars={30}
            />
          </div>
          <p className="text-muted-foreground/80 text-xs sm:text-sm">
            View staff price & duration for this service and its subservices.
          </p>
        </div>
        <Button
          onClick={() => setAssignDialogOpen(true)}
          className="w-full sm:w-auto shrink-0 rounded-xl shadow-sm shadow-primary/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Assign Staff
        </Button>
      </div>

      {!hasAnyAssignments ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/50">
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
        <InfiniteScroll
          dataLength={totalLoadedStaffCount}
          next={fetchMoreServiceStaffs}
          hasMore={hasAnyMore}
          scrollableTarget="service-staff-panel-scroll"
          scrollThreshold={0.8}
          loader={
            loadingMore ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary/60" />
              </div>
            ) : null
          }
        >
          <div className="flex flex-col gap-8 pb-4">
            {servicesToShow.map((service) => {
              const assignedRows = serviceStaffsMap[service.uuid] ?? [];
              if (assignedRows.length === 0) return null;

              const assignedStaffs = assignedRows
                .map((row: any) => {
                  const staff =
                    staffs.find((s) => s.id === row.staff_id) ||
                    staffs.find((s) => s.uuid === row.staff_uuid) ||
                    row.staff;
                  return { staff, staffServiceRow: row };
                })
                .filter((item): item is { staff: Staff; staffServiceRow: StaffPricingType } => Boolean(item.staff));

              if (assignedStaffs.length === 0) return null;

              const showHeader = servicesToShow.length > 1 || (selectedService.children?.length ?? 0) > 0;

              return (
                <div key={service.uuid} className="flex flex-col gap-4">
                  {showHeader && (
                    <div className="flex items-center gap-3 min-w-0">
                      <EllipsisCell
                        value={service.name}
                        maxChars={50}
                        className="font-bold text-foreground/80 text-xs uppercase tracking-wider capitalize block shrink-0 max-w-[300px]"
                      />
                      <div className="h-px bg-border/55 flex-1" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                    {assignedStaffs.map(({ staff, staffServiceRow }) => {
                      const staff_name = `${staff.first_name} ${staff.last_name || ""}`.trim();

                      return (
                        <div
                          key={staff.uuid}
                          className="group relative border border-border/50 rounded-2xl p-4 flex flex-col justify-between bg-card/60 backdrop-blur-md hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                          <div className="flex items-center justify-between w-full min-w-0 gap-3 relative z-10">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Avatar className="w-10 h-10 sm:w-11 sm:h-11 bg-muted border border-border/50 text-muted-foreground transition-transform duration-200 group-hover:scale-105 shrink-0">
                                {staff.photos?.url ? (
                                   <AvatarImage src={staff.photos.url} alt={staff_name} />
                                ) : (
                                   <AvatarFallback className="bg-transparent"><User className="h-5 w-5"/></AvatarFallback>
                                )}
                              </Avatar>
                              <EllipsisCell
                                value={staff_name}
                                maxChars={50}
                                className="font-bold text-sm sm:text-base text-foreground capitalize block min-w-0 flex-1"
                              />
                            </div>

                            <div className="flex items-center gap-1 shrink-0 relative z-10">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(staff.uuid, service, staffServiceRow, staff)}
                                className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground transition-all"
                                title="Edit Custom Pricing"
                              >
                                <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(service.uuid, staffServiceRow.uuid!)}
                                disabled={deletingId === staffServiceRow.uuid}
                                className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all disabled:opacity-50"
                                title="Unassign Staff"
                              >
                                {deletingId === staffServiceRow.uuid ? (
                                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-border/40 w-full relative z-10">
                            <span
                              className={clsx(
                                "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold whitespace-nowrap border shrink-0",
                                staffServiceRow.price_type === "fixed"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                                  : staffServiceRow.price_type === "from"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10",
                              )}
                            >
                              {staffServiceRow.price_type}
                            </span>
                            <span className="text-xs sm:text-sm text-foreground/90 font-bold whitespace-nowrap shrink-0">
                              ₹{staffServiceRow.price ?? "-"}
                            </span>
                            <span className="text-xs text-muted-foreground/50 select-none shrink-0">•</span>
                            <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap shrink-0">
                              {staffServiceRow.duration ?? "-"} min
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
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

