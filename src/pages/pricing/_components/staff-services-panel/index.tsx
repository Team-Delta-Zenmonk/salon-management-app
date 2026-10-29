import { useEffect, useState, useMemo, useCallback } from "react";
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
import { Plus, Edit2, Trash2, Scissors, User, Loader2 } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import type { Staff } from "../../../../features/staff/staff.slice";
import type { Service } from "../../../../features/service/service.slice";
import { EllipsisCell } from "@/components/ellipse-cell";

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
  const selectedStaff = staffs.find((s: Staff) => s.uuid === selectedStaffUuid);

  const { data: allServices } = useAppSelector((state: RootState) => state.service);

  const [assignedServices, setAssignedServices] = useState<StaffPricingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<DialogContext | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAssignedServices = useCallback(async () => {
    if (!selectedStaffUuid) return;
    try {
      setLoading(true);
      setPage(1);
      const res = await listStaffServices(selectedStaffUuid, { page: 1, limit });
      const rows = Array.isArray(res) ? res : (res?.data ?? res?.rows ?? []);
      const total = typeof res?.total === "number" ? res.total : rows.length;

      setAssignedServices(rows);
      setHasMore(rows.length === limit && rows.length < total);
    } catch {
      callSnack("Failed to load staff services", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedStaffUuid]);

  const fetchMoreAssignedServices = useCallback(async () => {
    if (!selectedStaffUuid || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await listStaffServices(selectedStaffUuid, { page: nextPage, limit });
      const rows = Array.isArray(res) ? res : (res?.data ?? res?.rows ?? []);
      const total = typeof res?.total === "number" ? res.total : rows.length;

      setAssignedServices((prev) => {
        const existingUuids = new Set(prev.map((s) => s.uuid));
        const newRows = rows.filter((r: StaffPricingType) => !existingUuids.has(r.uuid));
        const combined = [...prev, ...newRows];
        setHasMore(rows.length === limit && combined.length < total);
        return combined;
      });
      setPage(nextPage);
    } catch {
      callSnack("Failed to load more services", "error");
    } finally {
      setLoadingMore(false);
    }
  }, [selectedStaffUuid, loadingMore, hasMore, page]);

  useEffect(() => {
    loadAssignedServices();
  }, [loadAssignedServices]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const el = document.getElementById("staff-services-panel-scroll");
    if (!el) return;
    const timer = setTimeout(() => {
      if (el.scrollHeight <= el.clientHeight) {
        fetchMoreAssignedServices();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [assignedServices.length, hasMore, loading, loadingMore, fetchMoreAssignedServices]);

  const groupedServices = useMemo(() => {
    if (!assignedServices.length) return [];

    const serviceIdMap = new Map<number, Service>(allServices.map((s: Service) => [s.id, s]));

    const groups = new Map<number, { parent: Service; services: (Service & { pricing: StaffPricingType })[] }>();

    assignedServices.forEach((pricingRow) => {
      const service = serviceIdMap.get(pricingRow.service_id) || pricingRow.service;
      if (!service) return;

      const hasChildren = allServices.some((s: Service) => s.parent_id && String(s.parent_id) === String(service.id));
      if (hasChildren && !service.parent_id) {
        return;
      }

      const parentId = service.parent_id ? Number(service.parent_id) : service.id;
      const parentService = serviceIdMap.get(parentId) || (service.parent_id ? null : service);

      const groupKey = parentId;
      const effectiveParent = parentService || service;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, { parent: effectiveParent, services: [] });
      }

      groups.get(groupKey)!.services.push({ ...service, pricing: pricingRow });
    });

    return Array.from(groups.values()).sort((a, b) => (a.parent.name || "").localeCompare(b.parent.name || ""));
  }, [allServices, assignedServices]);

  const handleOpenEdit = (serviceRow: Service & { pricing: StaffPricingType }) => {
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
    } catch (e: unknown) {
      const err = e as any;
      const responseData = err?.response?.data;
      const msg = typeof responseData === "string" ? responseData : responseData?.message || responseData?.error;
      callSnack(msg || err?.message || "Failed to update pricing", "error");
    } finally {
      setPricingDialogOpen(false);
      setDialogContext(null);
    }
  };

  const handleRemove = async (staffServiceUuid: string) => {
    if (deletingId) return;
    try {
      setDeletingId(staffServiceUuid);
      setAssignedServices((prev) => prev.filter((r) => r.uuid !== staffServiceUuid));
      await unassignStaffFromService({ staff_services: [staffServiceUuid], cascade: true });
      await loadAssignedServices();
      callSnack("Service unassigned successfully", "success");
    } catch (e: unknown) {
      const err = e as any;
      const responseData = err?.response?.data;
      const msg = typeof responseData === "string" ? responseData : responseData?.message || responseData?.error;
      callSnack(msg || err?.message || "Failed to unassign service", "error");
      await loadAssignedServices();
    } finally {
      setDeletingId(null);
    }
  };

  if (!selectedStaffUuid || !selectedStaff) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-0 p-8 text-center bg-transparent">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/50">
          <User className="text-muted-foreground w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          No Staff Selected
        </h3>
        <p className="text-muted-foreground/80 text-sm mt-1 max-w-sm">
          Select a staff member from the sidebar to manage their services.
        </p>
      </div>
    );
  }

  const staffDisplayName = `${selectedStaff.first_name} ${selectedStaff.last_name || ""}`.trim();

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col min-h-full bg-transparent">
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border/50 mb-6">
        <div className="space-y-1 min-w-[240px] flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-6 rounded bg-primary shrink-0" />
            <EllipsisCell
              value={`${staffDisplayName}'s Services`}
              maxChars={60}
              className="text-base sm:text-lg font-bold text-foreground capitalize block min-w-0"
            />
          </div>
          <p className="text-muted-foreground/80 text-xs sm:text-sm">
            Manage the services provided by this staff member and their custom pricing.
          </p>
        </div>
        <Button
          onClick={() => setAssignDialogOpen(true)}
          className="w-full sm:w-auto shrink-0 rounded-xl shadow-sm shadow-primary/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Assign Services
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-semibold">Loading services...</span>
        </div>
      ) : assignedServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/50">
            <Scissors className="text-muted-foreground w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            No Services Assigned
          </h3>
          <p className="text-muted-foreground/80 text-sm mt-1.5 max-w-xs">
            This staff member doesn't provide any services yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssignDialogOpen(true)}
            className="mt-5 rounded-xl"
          >
            Assign Services Now
          </Button>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={assignedServices.length}
          next={fetchMoreAssignedServices}
          hasMore={hasMore}
          scrollableTarget="staff-services-panel-scroll"
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
            {groupedServices.map((group) => (
              <div key={group.parent.id} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <EllipsisCell
                    value={group.parent.name}
                    maxChars={50}
                    className="font-bold text-foreground/80 text-xs uppercase tracking-wider capitalize block shrink-0 max-w-[300px]"
                  />
                  <div className="h-px bg-border/55 flex-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                  {group.services.map((svc) => (
                    <div
                      key={svc.uuid}
                      className="group relative border border-border/50 rounded-2xl p-4 flex flex-col justify-between bg-card/60 backdrop-blur-md hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      <div className="flex items-center justify-between w-full min-w-0 gap-3 relative z-10">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="w-10 h-10 sm:w-11 sm:h-11 bg-muted border border-border/50 text-muted-foreground transition-transform duration-200 group-hover:scale-105 shrink-0">
                            {svc.logo ? (
                                <AvatarImage src={svc.logo} alt={svc.name} />
                            ) : (
                                <AvatarFallback className="bg-transparent"><Scissors className="h-5 w-5"/></AvatarFallback>
                            )}
                          </Avatar>
                          <EllipsisCell
                            value={svc.name}
                            maxChars={50}
                            className="font-bold text-sm sm:text-base text-foreground capitalize block min-w-0 flex-1"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0 relative z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(svc)}
                            className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground transition-all"
                            title="Edit Custom Pricing"
                          >
                            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => svc.pricing.uuid && handleRemove(svc.pricing.uuid)}
                            disabled={deletingId === svc.pricing.uuid}
                            className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all disabled:opacity-50"
                            title="Unassign Service"
                          >
                            {deletingId === svc.pricing.uuid ? (
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
                            svc.pricing.price_type === "fixed"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                              : svc.pricing.price_type === "from"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10",
                          )}
                        >
                          {svc.pricing.price_type}
                        </span>
                        <span className="text-xs sm:text-sm text-foreground/90 font-bold whitespace-nowrap shrink-0">
                          ₹{svc.pricing.price ?? "-"}
                        </span>
                        <span className="text-xs text-muted-foreground/50 select-none shrink-0">•</span>
                        <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap shrink-0">
                          {svc.pricing.duration ?? "-"} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
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
    </div>
  );
}
