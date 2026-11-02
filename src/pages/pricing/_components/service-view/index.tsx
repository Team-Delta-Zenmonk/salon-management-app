import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { listSubServicesService } from "../../../../features/service/list-sub-services/list-sub-services.service";
import type { ServiceType } from "../../types/staff-service.types";
import ServiceSidebar from "../service-sidebar";
import StaffPricingPanel from "../staff-pricing-panel";
import type { Service } from "../../../../features/service/service.slice";

interface SubServicePagination {
  items: ServiceType[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
}

export default function ServiceView() {
  const serviceState = useAppSelector((state: RootState) => state.service);
  const allServices = useMemo(() => serviceState?.data ?? [], [serviceState?.data]);
  const parentServices = useMemo(() => allServices.filter((s: Service) => !s.parent_id), [allServices]);
  const [selectedServiceUuid, setSelectedServiceUuid] = useState<string | null>(() => {
    const parentServicesInit = (serviceState?.data ?? []).filter((s: Service) => !s.parent_id);
    return parentServicesInit.length > 0 ? parentServicesInit[0].uuid : null;
  });
  const [subServicesMap, setSubServicesMap] = useState<Record<string, SubServicePagination>>({});

  useEffect(() => {
    if (parentServices.length === 0) return;
    if (!selectedServiceUuid) {
      setSelectedServiceUuid(parentServices[0].uuid);
    }
  }, [parentServices, selectedServiceUuid]);

  const fetchSubServicesForParent = useCallback(
    async (parentUuid: string, page = 1) => {
      const isInitial = page === 1;

      setSubServicesMap((prev) => {
        const current = prev[parentUuid];
        return {
          ...prev,
          [parentUuid]: {
            items: isInitial ? current?.items || [] : current?.items || [],
            page,
            limit: 10,
            total: current?.total || 0,
            hasMore: current?.hasMore ?? true,
            loading: isInitial,
            loadingMore: !isInitial,
          },
        };
      });

      try {
        const res = await listSubServicesService(parentUuid, { page, limit: 10 });
        const rows: Service[] = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
        const total: number = res?.count ?? res?.total ?? rows.length;

        const mappedRows: ServiceType[] = rows.map((c: Service) => ({
          id: c.id,
          uuid: c.uuid,
          name: c.name,
          price_type: c.price_type,
          price: c.price,
          duration: c.duration ? Number(c.duration) : undefined,
          logo: c.logo,
          sub_services_count: c.sub_services_count,
        }));

        setSubServicesMap((prev) => {
          const prevItems = isInitial ? [] : prev[parentUuid]?.items || [];
          const existingIds = new Set(prevItems.map((item) => item.id));
          const newItems = mappedRows.filter((item) => !existingIds.has(item.id));
          const combined = [...prevItems, ...newItems];

          return {
            ...prev,
            [parentUuid]: {
              items: combined,
              page,
              limit: 10,
              total,
              hasMore: combined.length < total,
              loading: false,
              loadingMore: false,
            },
          };
        });
      } catch {
        setSubServicesMap((prev) => ({
          ...prev,
          [parentUuid]: {
            items: isInitial ? [] : prev[parentUuid]?.items || [],
            page,
            limit: 10,
            total: isInitial ? 0 : prev[parentUuid]?.total || 0,
            hasMore: false,
            loading: false,
            loadingMore: false,
          },
        }));
      }
    },
    [],
  );

  const handleExpandParent = useCallback(
    async (parentUuid: string) => {
      if (!subServicesMap[parentUuid]) {
        await fetchSubServicesForParent(parentUuid, 1);
      }
    },
    [subServicesMap, fetchSubServicesForParent],
  );

  useEffect(() => {
    if (!selectedServiceUuid) return;
    if (!subServicesMap[selectedServiceUuid]) {
      fetchSubServicesForParent(selectedServiceUuid, 1);
    }
  }, [selectedServiceUuid, subServicesMap, fetchSubServicesForParent]);

  const loadMoreSubServices = useCallback(() => {
    if (!selectedServiceUuid) return;
    const currentInfo = subServicesMap[selectedServiceUuid];
    if (!currentInfo || currentInfo.loading || currentInfo.loadingMore || !currentInfo.hasMore) return;
    fetchSubServicesForParent(selectedServiceUuid, currentInfo.page + 1);
  }, [selectedServiceUuid, subServicesMap, fetchSubServicesForParent]);

  const servicesTree: ServiceType[] = useMemo(
    () =>
      parentServices.map(
        (p: Service): ServiceType => {
          const subInfo = subServicesMap[p.uuid];
          return {
            id: p.id,
            uuid: p.uuid,
            name: p.name,
            price_type: p.price_type,
            price: p.price,
            duration: p.duration ? Number(p.duration) : undefined,
            logo: p.logo,
            sub_services_count: p.sub_services_count,
            children: subInfo?.items ?? [],
            subServicesHasMore: Boolean(subInfo?.hasMore),
            subServicesLoadingMore: Boolean(subInfo?.loadingMore),
            onFetchMoreSubServices: loadMoreSubServices,
          };
        },
      ),
    [parentServices, subServicesMap, loadMoreSubServices],
  );

  const selectedService = useMemo(
    () => servicesTree.find((s) => s.uuid === selectedServiceUuid) ?? null,
    [servicesTree, selectedServiceUuid],
  );

  const selectedSubInfo = selectedServiceUuid ? subServicesMap[selectedServiceUuid] : null;
  const isSubServicesLoading = Boolean(
    selectedServiceUuid &&
      (selectedSubInfo?.loading ?? (selectedSubInfo === undefined))
  );

  const subServicesLoadingMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    Object.keys(subServicesMap).forEach((uuid) => {
      map[uuid] = subServicesMap[uuid].loading;
    });
    return map;
  }, [subServicesMap]);

  return (
    <div
      style={{
        minHeight: "var(--pricing-container-min-height)",
      }}
      className="flex flex-1 min-h-0 gap-4 sm:gap-6 w-full flex-col lg:flex-row items-stretch lg:h-[var(--pricing-container-height)] lg:max-h-[var(--pricing-container-max-height)]"
    >
      <div
        style={{
          minHeight: "var(--pricing-container-min-height)",
        }}
        className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl w-full h-[var(--pricing-mobile-card-height)] lg:h-full lg:w-[var(--pricing-sidebar-width)] lg:max-h-[var(--pricing-container-max-height)] flex flex-col min-h-0 shadow-sm overflow-hidden shrink-0"
      >
        <ServiceSidebar
          services={servicesTree}
          selectedServiceUuid={selectedServiceUuid}
          onSelectService={setSelectedServiceUuid}
          onExpandParent={handleExpandParent}
          loadingMap={subServicesLoadingMap}
          isLoading={serviceState?.isInitialLoading || (serviceState?.loading && parentServices.length === 0)}
        />
      </div>

      <div
        style={{
          minHeight: "var(--pricing-container-min-height)",
        }}
        className="flex-1 min-w-0 w-full flex flex-col min-h-[400px] lg:h-full lg:min-h-0 lg:max-h-[var(--pricing-container-max-height)] bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm overflow-hidden"
      >
        <div id="service-staff-panel-scroll" className="flex-1 h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <StaffPricingPanel
            selectedService={selectedService}
            isLoadingSubServices={isSubServicesLoading}
          />
        </div>
      </div>
    </div>
  );
}

