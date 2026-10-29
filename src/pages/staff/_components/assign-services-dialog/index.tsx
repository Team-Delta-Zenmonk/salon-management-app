import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { callSnack } from "../../../../components/snackbar";
import { listServicesAction } from "../../../../features/service/list-services/list-service.action";
import { listStaffServices } from "../../../../features/staff/list-services/list-services.service";
import { listSubServicesService } from "../../../../features/service/list-sub-services/list-sub-services.service";
import { assignStaffToService } from "../../../../features/staff-service/staff-service.service";
import { unassignStaffFromService } from "../../../../features/staff-service/unassign-staff-service.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Label } from "../../../../components/ui/label";
import { Loader2, ChevronDown, Layers, Sparkles, CheckCheck, BookmarkCheck } from "lucide-react";
import type { Service } from "../../../../features/service/service.slice";
import InfiniteScroll from "react-infinite-scroll-component";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import EllipsisCell from "@/components/ellipse-cell";

interface AssignedStaffService {
  uuid: string;
  service_id: number;
  service?: {
    uuid: string;
    id: number;
    parent_id?: number | null;
  };
}

interface SubServicePagination {
  items: Service[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
}

interface AssignServicesDialogProps {
  open: boolean;
  onClose: () => void;
  staff: { uuid: string; first_name?: string | null; last_name?: string | null };
  onAssigned?: () => void;
}

export default function AssignServicesDialog({
  open,
  onClose,
  staff,
  onAssigned,
}: Readonly<AssignServicesDialogProps>) {
  const dispatch = useAppDispatch();

  const serviceState = useAppSelector((state: RootState) => state.service);
  const rootServices = useMemo(() => {
    return (serviceState?.data || []).filter((s) => s.parent_id === null);
  }, [serviceState?.data]);

  const serviceHasMore = Boolean(serviceState?.hasMore);
  const servicePage = serviceState?.page ?? 1;
  const serviceLimit = serviceState?.limit ?? 10;

  const [assignedStaffServices, setAssignedStaffServices] = useState<AssignedStaffService[]>([]);
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
  const [initialSelectedUuids, setInitialSelectedUuids] = useState<Set<string>>(new Set());

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [subServicesMap, setSubServicesMap] = useState<Record<string, SubServicePagination>>({});

  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAllAssignedStaffServices = useCallback(async (staffUuid: string) => {
    let page = 1;
    const limit = 10;
    const allAssigned: AssignedStaffService[] = [];

    while (true) {
      const res = await listStaffServices(staffUuid, { page, limit });
      const rows: any[] = Array.isArray(res) ? res : (res?.data ?? res?.rows ?? []);
      allAssigned.push(...rows);

      const total = res?.total ?? rows.length;
      if (allAssigned.length >= total || rows.length < limit) {
        break;
      }
      page++;
    }

    return allAssigned;
  }, []);

  const fetchSubServices = useCallback(
    async (parentService: Service, page = 1) => {
      setSubServicesMap((prev) => ({
        ...prev,
        [parentService.uuid]: {
          items: page === 1 ? prev[parentService.uuid]?.items || [] : prev[parentService.uuid]?.items || [],
          page,
          limit: 10,
          total: prev[parentService.uuid]?.total || 0,
          hasMore: prev[parentService.uuid]?.hasMore ?? true,
          loading: true,
        },
      }));

      try {
        const res = await listSubServicesService(parentService.uuid, { page, limit: 10 });
        const rows: Service[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
        const total: number = res?.count ?? res?.total ?? rows.length;

        setSubServicesMap((prev) => {
          const prevItems = page === 1 ? [] : prev[parentService.uuid]?.items || [];
          const existingIds = new Set(prevItems.map((item) => item.id));
          const newItems = rows.filter((item) => !existingIds.has(item.id));
          const combined = [...prevItems, ...newItems];

          return {
            ...prev,
            [parentService.uuid]: {
              items: combined,
              page,
              limit: 10,
              total,
              hasMore: combined.length < total,
              loading: false,
            },
          };
        });
      } catch (err) {
        console.error("Failed to load subservices for", parentService.uuid, err);
        setSubServicesMap((prev) => ({
          ...prev,
          [parentService.uuid]: {
            items: prev[parentService.uuid]?.items || [],
            page,
            limit: 10,
            total: prev[parentService.uuid]?.total || 0,
            hasMore: false,
            loading: false,
          },
        }));
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    setInitialLoading(true);
    setExpanded({});
    setSubServicesMap({});

    dispatch(listServicesAction({ page: 1, limit: 10, include_sub_services: false }));

    fetchAllAssignedStaffServices(staff.uuid)
      .then((rows) => {
        setAssignedStaffServices(rows);
        const assignedUuids = new Set(
          rows.map((ss) => ss.service?.uuid).filter(Boolean) as string[],
        );
        setSelectedUuids(new Set(assignedUuids));
        setInitialSelectedUuids(new Set(assignedUuids));
      })
      .catch((err) => {
        console.error("Failed to fetch assigned staff services", err);
        callSnack("Failed to load assigned services", "error");
        setAssignedStaffServices([]);
        setSelectedUuids(new Set());
        setInitialSelectedUuids(new Set());
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [open, staff.uuid, dispatch, fetchAllAssignedStaffServices]);
  const fetchMoreServices = async () => {
    if (initialLoading || !serviceHasMore || serviceState?.loading) return;
    try {
      await dispatch(
        listServicesAction({
          page: servicePage + 1,
          limit: serviceLimit,
          include_sub_services: false,
        }),
      ).unwrap();
    } catch (e) {
      console.error("Failed to load more services:", e);
    }
  };

  const toggleExpand = useCallback(
    (parentService: Service) => {
      const isCurrentlyExpanded = Boolean(expanded[parentService.uuid]);
      setExpanded((prev) => ({ ...prev, [parentService.uuid]: !isCurrentlyExpanded }));

      if (!isCurrentlyExpanded && !subServicesMap[parentService.uuid]) {
        fetchSubServices(parentService, 1);
      }
    },
    [expanded, subServicesMap, fetchSubServices],
  );

  const handleToggleParent = useCallback(
    (parentService: Service) => {
      const parentUuid = parentService.uuid;
      const subInfo = subServicesMap[parentUuid];
      const subItems = subInfo?.items || [];
      const subUuids = subItems.map((s) => s.uuid);

      setSelectedUuids((prev) => {
        const next = new Set(prev);
        const isParentSelected = next.has(parentUuid);

        if (isParentSelected) {
          next.delete(parentUuid);
          subUuids.forEach((u) => next.delete(u));
        } else {
          next.add(parentUuid);
          subUuids.forEach((u) => next.add(u));
        }
        return next;
      });
    },
    [subServicesMap],
  );

  const handleToggleChild = useCallback((subService: Service, parentService: Service) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(subService.uuid)) {
        next.delete(subService.uuid);
      } else {
        next.add(subService.uuid);
      }
      return next;
    });
  }, []);

  const isDirty = useMemo(() => {
    if (selectedUuids.size !== initialSelectedUuids.size) return true;
    for (const uuid of selectedUuids) {
      if (!initialSelectedUuids.has(uuid)) return true;
    }
    return false;
  }, [selectedUuids, initialSelectedUuids]);

  const onSubmit = async () => {
    setSaving(true);

    try {
      const existingAssignedMap = new Map<string, AssignedStaffService>();
      assignedStaffServices.forEach((ss) => {
        const sUuid = ss.service?.uuid;
        if (sUuid) existingAssignedMap.set(sUuid, ss);
      });

      const allKnownServices = new Map<string, Service>();
      rootServices.forEach((s) => allKnownServices.set(s.uuid, s));
      Object.values(subServicesMap).forEach((sub) => {
        sub.items.forEach((s) => allKnownServices.set(s.uuid, s));
      });

      const toAssign: {
        staff_uuid: string;
        service_uuid: string;
        price_type?: string;
        price?: number;
        duration?: number;
      }[] = [];

      selectedUuids.forEach((serviceUuid) => {
        if (!existingAssignedMap.has(serviceUuid)) {
          const srv = allKnownServices.get(serviceUuid);
          toAssign.push({
            staff_uuid: staff.uuid,
            service_uuid: serviceUuid,
            price_type: srv?.price_type,
            price: srv?.price ? Number(srv.price) : undefined,
            duration: srv?.duration ? Number(srv.duration) : undefined,
          });
        }
      });

      const toUnassign: string[] = [];
      existingAssignedMap.forEach((ss, serviceUuid) => {
        if (!selectedUuids.has(serviceUuid)) {
          if (ss.uuid) toUnassign.push(ss.uuid);
        }
      });

      if (toAssign.length > 0) {
        await assignStaffToService({ staff_services: toAssign });
      }

      if (toUnassign.length > 0) {
        await unassignStaffFromService({ staff_services: toUnassign, cascade: false });
      }

      callSnack("Staff services updated successfully", "success");
      onAssigned?.();
      onClose();
    } catch (err: unknown) {
      const error = err as any;
      const responseData = error?.response?.data;
      const backendMessage =
        typeof responseData === "string"
          ? responseData
          : responseData?.message ||
            responseData?.error ||
            (Array.isArray(responseData?.errors) && responseData.errors[0]?.message);
      callSnack(backendMessage || error?.message || "Failed to update staff services", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (saving) return;
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[540px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Assign Services
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Assign or unassign main services and subservices for{" "}
            <span className="font-semibold text-foreground">
              {staff.first_name ? `${staff.first_name} ${staff.last_name || ""}`.trim() : "staff member"}
            </span>
            .
          </p>
        </DialogHeader>

        <div className="flex flex-col py-4 px-6 max-h-[calc(100vh-220px)] min-h-[260px] overflow-hidden">
          {initialLoading ? (
            <div className="flex flex-col justify-center items-center py-16 flex-1 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              <span className="text-xs text-muted-foreground">Loading services...</span>
            </div>
          ) : rootServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <p className="text-base font-semibold text-foreground">No services found</p>
              <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                You haven&apos;t added any services yet. Add services first to assign them to staff members.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Select services & subservices:
                </span>
                <span className="text-xs font-medium text-primary">
                  {selectedUuids.size} selected
                </span>
              </div>

              <div className="border border-border/50 rounded-2xl bg-muted/5 overflow-hidden">
                <div
                  id="assign-services-scrollable"
                  className="max-h-[360px] overflow-y-auto p-3 flex flex-col gap-2"
                >
                  <InfiniteScroll
                    dataLength={rootServices.length}
                    next={fetchMoreServices}
                    hasMore={serviceHasMore}
                    scrollableTarget="assign-services-scrollable"
                    loader={
                      <div className="flex justify-center py-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary/60" />
                      </div>
                    }
                  >
                  <div className="flex flex-col gap-2">
                    {rootServices.map((service) => {
                      const isParentSelected = selectedUuids.has(service.uuid);
                      const subInfo = subServicesMap[service.uuid];
                      const subItems = subInfo?.items || [];
                      const isExpanded = Boolean(expanded[service.uuid]);

                      const hasAssignedSubService = assignedStaffServices.some(
                        (ss) => ss.service?.parent_id === service.id && selectedUuids.has(ss.service?.uuid || "")
                      );

                      const subSelectedCount = subItems.filter((sub) =>
                        selectedUuids.has(sub.uuid),
                      ).length;
                      const hasSubSelected = subSelectedCount > 0 || hasAssignedSubService;
                      const allSubSelected = subItems.length > 0 && subSelectedCount === subItems.length;

                      const isPartiallyAssigned = !isParentSelected && hasSubSelected;
                      const isIndeterminate = isPartiallyAssigned && !allSubSelected;
                      const isEffectivelyChecked = isParentSelected || allSubSelected;

                      return (
                        <div key={service.uuid} className="flex flex-col gap-1.5">
                          <div
                            className={clsx(
                              "flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 group/parent",
                              isEffectivelyChecked
                                ? "bg-primary/10 border-primary/30"
                                : isPartiallyAssigned
                                  ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/15"
                                  : "bg-card/60 border-border/50 hover:bg-card hover:border-border",
                            )}
                          >
                            <div
                              onClick={() => handleToggleParent(service)}
                              className="flex items-center space-x-3 flex-1 min-w-0 select-none cursor-pointer"
                            >
                              <Checkbox
                                checked={isEffectivelyChecked}
                                indeterminate={isIndeterminate}
                                onCheckedChange={() => handleToggleParent(service)}
                                className="pointer-events-none shrink-0"
                              />
                              <span
                                className={clsx(
                                  "p-1.5 rounded-lg border transition-colors shrink-0",
                                  isEffectivelyChecked
                                    ? "bg-primary/10 border-primary/20 text-primary"
                                    : isPartiallyAssigned
                                      ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                                      : "bg-muted/40 border-border/30 text-muted-foreground group-hover/parent:text-foreground",
                                )}
                              >
                                {isPartiallyAssigned ? (
                                  <BookmarkCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <Layers className="w-3.5 h-3.5" />
                                )}
                              </span>
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm font-semibold tracking-wide text-foreground min-w-0 select-none cursor-pointer">
                                    <EllipsisCell value={service.name} className="min-w-0 w-full capitalize" />
                                  </Label>
                                  {isPartiallyAssigned && (
                                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                                      Partial Subservices
                                    </span>
                                  )}
                                </div>
                                {service.price !== undefined && (
                                  <span className="text-[11px] text-muted-foreground">
                                    ₹{service.price} · {service.duration} mins
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(service);
                              }}
                              title={isExpanded ? "Hide subservices" : "Show subservices"}
                              className={clsx(
                                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ml-2 cursor-pointer border",
                                isExpanded
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <span>Subservices</span>
                              <ChevronDown
                                className={clsx(
                                  "w-3.5 h-3.5 transition-transform duration-200",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </button>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="ml-5 flex flex-col gap-1.5 border-l-2 border-primary/20 pl-3.5 py-1">
                                  {subInfo?.loading && subItems.length === 0 ? (
                                    <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                      <span>Loading subservices...</span>
                                    </div>
                                  ) : subItems.length === 0 ? (
                                    <div className="py-2 text-xs text-muted-foreground italic">
                                      No subservices found for this service.
                                    </div>
                                  ) : (
                                    <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
                                      <div
                                        id={`subservices-scroll-${service.uuid}`}
                                        className="max-h-[200px] overflow-y-auto p-2 flex flex-col gap-1.5"
                                      >
                                        <InfiniteScroll
                                          dataLength={subItems.length}
                                          next={() => fetchSubServices(service, subInfo.page + 1)}
                                          hasMore={Boolean(subInfo?.hasMore)}
                                          scrollableTarget={`subservices-scroll-${service.uuid}`}
                                          loader={
                                            <div className="flex justify-center py-2">
                                              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/60" />
                                            </div>
                                          }
                                        >
                                          <div className="flex flex-col gap-1.5">
                                            {subItems.map((sub) => {
                                              const isChildChecked = selectedUuids.has(sub.uuid);
                                              return (
                                                <div
                                                  key={sub.uuid}
                                                  onClick={() => handleToggleChild(sub, service)}
                                                  className={clsx(
                                                    "flex items-center justify-between p-2 rounded-lg border transition-all duration-150 cursor-pointer select-none",
                                                    isChildChecked
                                                      ? "bg-primary/8 border-primary/25"
                                                      : "bg-card/40 border-border/30 hover:bg-muted/30 hover:border-border/60",
                                                  )}
                                                >
                                                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                                                    <Checkbox
                                                      checked={isChildChecked}
                                                      onCheckedChange={() => handleToggleChild(sub, service)}
                                                      className="pointer-events-none shrink-0"
                                                    />
                                                    <span className="p-1 rounded bg-muted/40 text-muted-foreground shrink-0">
                                                      <Sparkles className="w-3 h-3 text-primary/70" />
                                                    </span>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                      <span className="text-xs font-medium text-foreground truncate capitalize">
                                                        {sub.name}
                                                      </span>
                                                      <span className="text-[10px] text-muted-foreground">
                                                        ₹{sub.price} · {sub.duration} mins
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </InfiniteScroll>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </InfiniteScroll>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          {rootServices.length > 0 && (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={saving || initialLoading || !isDirty}
              className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
