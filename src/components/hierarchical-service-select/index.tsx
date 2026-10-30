import React, { useState, useEffect, useRef, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronRight, ChevronLeft, Loader2, Check, ChevronDown } from "lucide-react";
import { listSubServicesService } from "@/features/service/list-sub-services/list-sub-services.service";
import { listServicesAction } from "@/features/service/list-services/list-service.action";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Service } from "@/features/service/service.slice";
import EllipsisCell from "@/components/ellipse-cell";
import { cn } from "@/lib/utils";

export interface HierarchicalServiceSelectProps {
  value?: string | number;
  onChange: (serviceId: string, serviceObj?: Service) => void;
  disabledServices?: Set<number>;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  subServiceCache?: Record<number, Service>;
  valueMode?: "id" | "uuid";
  allowClearOption?: {
    label: string;
    value: string;
  };
  triggerClassName?: string;
}

export default function HierarchicalServiceSelect({
  value,
  onChange,
  disabledServices,
  disabled = false,
  placeholder = "Select Service",
  hasError = false,
  subServiceCache = {},
  valueMode = "id",
  allowClearOption,
  triggerClassName,
}: Readonly<HierarchicalServiceSelectProps>) {
  const dispatch = useAppDispatch();
  const reduxServiceState = useAppSelector((state) => state.service);
  const reduxServices = reduxServiceState?.data ?? [];
  const reduxHasMore = reduxServiceState?.hasMore ?? false;
  const reduxLoading = reduxServiceState?.loading ?? false;

  const [open, setOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<Service | null>(null);

  const [subServices, setSubServices] = useState<Service[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subHasMore, setSubHasMore] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const [localRootPage, setLocalRootPage] = useState(1);
  const [isRefreshingRoots, setIsRefreshingRoots] = useState(false);

  const [localCache, setLocalCache] = useState<Record<string, Service>>({});

  const rootListRef = useRef<HTMLDivElement>(null);
  const subListRef = useRef<HTMLDivElement>(null);

  const rootServices = React.useMemo(() => {
    return (reduxServices || []).filter((s) => s.parent_id === null || s.parent_id === undefined);
  }, [reduxServices]);

  const isLoadingRootServices = isRefreshingRoots || reduxLoading;

  const fetchFreshRootServices = useCallback(async () => {
    setIsRefreshingRoots(true);
    setLocalRootPage(1);
    try {
      await dispatch(listServicesAction({ page: 1, limit: 10 })).unwrap();
    } catch (err) {
      console.error("Failed to fetch services on open", err);
    } finally {
      setIsRefreshingRoots(false);
    }
  }, [dispatch]);

  const handleRootScrollEnd = useCallback(() => {
    if (!reduxHasMore || reduxLoading || isRefreshingRoots) return;
    const nextPage = localRootPage + 1;
    setLocalRootPage(nextPage);
    dispatch(listServicesAction({ page: nextPage, limit: 10 }));
  }, [reduxHasMore, reduxLoading, isRefreshingRoots, localRootPage, dispatch]);

  useEffect(() => {
    if (Object.keys(subServiceCache).length > 0) {
      setLocalCache((prev) => {
        const next = { ...prev };
        Object.entries(subServiceCache).forEach(([id, svc]) => {
          next[id] = svc;
          if (svc.uuid) next[svc.uuid] = svc;
        });
        return next;
      });
    }
  }, [subServiceCache]);

  const selectedLabel = React.useMemo(() => {
    if (allowClearOption && String(value) === String(allowClearOption.value)) {
      return allowClearOption.label;
    }
    if (!value) return null;

    const valStr = String(value);
    const inRoot = rootServices.find(
      (s) => String(s.id) === valStr || s.uuid === valStr
    );
    if (inRoot) return inRoot.name;

    if (localCache[valStr]) return localCache[valStr].name;

    return null;
  }, [value, rootServices, localCache, allowClearOption]);

  const handleRootScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isLoadingRootServices) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 24) {
      handleRootScrollEnd();
    }
  };

  const handleSubScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!subHasMore || subLoading || !activeParent) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 24) {
      loadMoreSubServices();
    }
  };

  const loadSubServices = useCallback(async (parent: Service, page = 1) => {
    setSubLoading(true);
    try {
      const res = await listSubServicesService(parent.uuid, { page, limit: 10 });
      const rows: Service[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      const total: number = res?.count ?? res?.total ?? rows.length;

      setSubServices((prev) => {
        const base = page === 1 ? [] : prev;
        const existingIds = new Set(base.map((item) => item.id));
        const newItems = rows.filter((item) => !existingIds.has(item.id));
        return [...base, ...newItems];
      });

      setLocalCache((prev) => {
        const next = { ...prev };
        rows.forEach((s) => {
          next[String(s.id)] = s;
          if (s.uuid) next[s.uuid] = s;
        });
        return next;
      });

      setSubPage(page);
      setSubHasMore(page * 10 < total);
    } catch (err) {
      console.error("Failed to load sub-services for", parent.uuid, err);
      setSubHasMore(false);
    } finally {
      setSubLoading(false);
    }
  }, []);

  const loadMoreSubServices = () => {
    if (!activeParent || subLoading || !subHasMore) return;
    loadSubServices(activeParent, subPage + 1);
  };

  const handleSelectRootService = (service: Service) => {
    const hasSubServices = Number(service.sub_services_count ?? 0) > 0;

    if (hasSubServices) {
      setActiveParent(service);
      setSubServices([]);
      loadSubServices(service, 1);
    } else {
      const selectedVal = valueMode === "uuid" ? service.uuid : String(service.id);
      onChange(selectedVal, service);
      setOpen(false);
    }
  };

  const handleSelectSubService = (subService: Service) => {
    const selectedVal = valueMode === "uuid" ? subService.uuid : String(subService.id);
    onChange(selectedVal, subService);
    setOpen(false);
    setActiveParent(null);
  };

  const handleSelectClearOption = () => {
    if (allowClearOption) {
      onChange(allowClearOption.value, undefined);
      setOpen(false);
      setActiveParent(null);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setActiveParent(null);
        } else {
          fetchFreshRootServices();
        }
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-1.5 rounded-md border border-input-border bg-input-bg px-3 text-sm transition-all outline-none select-none hover:border-input-border-hover focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 text-left capitalize h-10 leading-none",
          hasError && "border-input-border-error ring-input-ring-error ring-2",
          triggerClassName
        )}
      >
        <span className={cn("truncate flex-1 flex items-center min-w-0 leading-normal", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel ? (
            <EllipsisCell value={selectedLabel} maxChars={35} className="truncate" />
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[280px] sm:w-[320px] p-0 shadow-lg border border-border bg-popover z-50 rounded-xl overflow-hidden"
      >
        {activeParent ? (
          <div className="flex flex-col max-h-[300px]">
            <div className="flex items-center gap-2 p-2.5 border-b border-border/60 bg-muted/20">
              <button
                type="button"
                onClick={() => setActiveParent(null)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Back to all services"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground truncate block capitalize">
                  {activeParent.name}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Select sub-service
                </span>
              </div>
            </div>

            <div
              ref={subListRef}
              onScroll={handleSubScroll}
              className="flex-1 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-border/20"
            >
              {subServices.length === 0 && subLoading ? (
                <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading sub-services...
                </div>
              ) : subServices.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No sub-services found.
                </div>
              ) : (
                subServices.map((sub) => {
                  const itemValue = valueMode === "uuid" ? sub.uuid : String(sub.id);
                  const isSelected = String(itemValue) === String(value);
                  const isRowDisabled = disabledServices?.has(sub.id);

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      disabled={isRowDisabled}
                      onClick={() => handleSelectSubService(sub)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 capitalize",
                        isSelected
                          ? "bg-primary text-primary-foreground font-medium"
                          : isRowDisabled
                          ? "opacity-40 cursor-not-allowed text-muted-foreground"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs font-medium">{sub.name}</div>
                        <div className={cn("text-[11px]", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {sub.duration} mins · ₹{sub.price}
                        </div>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })
              )}

              {subLoading && subServices.length > 0 && (
                <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Loading more...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col max-h-[300px]">
            <div className="p-2.5 border-b border-border/60 bg-muted/20">
              <span className="text-xs font-semibold text-foreground">Services</span>
            </div>

            <div
              ref={rootListRef}
              onScroll={handleRootScroll}
              className="flex-1 overflow-y-auto p-1.5 space-y-0.5"
            >
              {allowClearOption && (
                <button
                  type="button"
                  onClick={handleSelectClearOption}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 font-medium",
                    String(value) === String(allowClearOption.value)
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span className="truncate flex-1 text-xs">
                    {allowClearOption.label}
                  </span>
                  {String(value) === String(allowClearOption.value) && (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  )}
                </button>
              )}

              {rootServices.length === 0 && isLoadingRootServices ? (
                <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading services...
                </div>
              ) : rootServices.length === 0 && !allowClearOption ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No services available.
                </div>
              ) : (
                rootServices.map((service) => {
                  const itemValue = valueMode === "uuid" ? service.uuid : String(service.id);
                  const isSelected = String(itemValue) === String(value);
                  const isRowDisabled = disabledServices?.has(service.id);
                  const hasSubServices = Number(service.sub_services_count ?? 0) > 0;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      disabled={isRowDisabled}
                      onClick={() => handleSelectRootService(service)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 capitalize",
                        isSelected
                          ? "bg-primary text-primary-foreground font-medium"
                          : isRowDisabled
                          ? "opacity-40 cursor-not-allowed text-muted-foreground"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span className="truncate flex-1 text-xs font-medium">
                        {service.name}
                      </span>

                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : hasSubServices ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                      ) : null}
                    </button>
                  );
                })
              )}

              {isLoadingRootServices && rootServices.length > 0 && (
                <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Loading more...
                </div>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
