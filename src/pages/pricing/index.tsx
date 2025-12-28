import { Box, Typography, Divider } from "@mui/material";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import { listSubServicesService } from "../../features/service/list-sub-services/list-sub-services.service";
import type { ServiceType } from "./types/staff-service.types";
import ServiceSidebar from "./_components/service-sidebar";
import StaffPricingPanel from "./_components/staff-pricing-panel";

export default function StaffServiceManagementPage() {
  const dispatch = useAppDispatch();

  // ✅ Use paginated data from service slice
  const serviceState = useAppSelector((state: RootState) => state.service);
  const servicesState = serviceState?.data ?? [];

  const parentServices = useMemo(
    () => servicesState.filter((s: any) => !s.parent_id),
    [servicesState]
  );

  const [selectedServiceUuid, setSelectedServiceUuid] = useState<string | null>(null);
  const [childrenMap, setChildrenMap] = useState<Record<string, ServiceType[]>>({});
  const [subLoadingMap, setSubLoadingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // ✅ Load a big chunk of services for pricing (no infinite scroll here)
    dispatch(listServicesAction({ page: 1, limit: 100 }));
    // Staff can stay paginated but 50 is fine for dialog usage
    dispatch(listStaffAction({ page: 1, limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedServiceUuid && parentServices.length > 0) {
      setSelectedServiceUuid(parentServices[0].uuid);
    }
  }, [parentServices, selectedServiceUuid]);

  const fetchSubServicesForParent = useCallback(
    async (parentUuid: string) => {
      if (childrenMap[parentUuid]) return;

      try {
        setSubLoadingMap((p) => ({ ...p, [parentUuid]: true }));
        const res = await listSubServicesService(parentUuid);
        const rows = Array.isArray(res) ? res : res?.rows ?? [];
        const nodes: ServiceType[] = rows.map((c: any) => ({
          id: c.id,
          uuid: c.uuid,
          name: c.name,
          price_type: c.price_type,
          price: c.price,
          duration: c.duration,
        }));
        setChildrenMap((p) => ({ ...p, [parentUuid]: nodes }));
      } catch {
        setChildrenMap((p) => ({ ...p, [parentUuid]: [] }));
      } finally {
        setSubLoadingMap((p) => ({ ...p, [parentUuid]: false }));
      }
    },
    [childrenMap]
  );

  const handleExpandParent = useCallback(
    async (parentUuid: string) => {
      await fetchSubServicesForParent(parentUuid);
    },
    [fetchSubServicesForParent]
  );

  useEffect(() => {
    if (!selectedServiceUuid) return;
    fetchSubServicesForParent(selectedServiceUuid);
  }, [selectedServiceUuid, fetchSubServicesForParent]);

  const services: ServiceType[] = useMemo(
    () =>
      parentServices.map(
        (p: any): ServiceType => ({
          uuid: p.uuid,
          name: p.name,
          price_type: p.price_type,
          price: p.price,
          duration: p.duration,
          children: childrenMap[p.uuid] ?? [],
        })
      ),
    [parentServices, childrenMap]
  );

  const selectedService = useMemo(
    () => services.find((s) => s.uuid === selectedServiceUuid) ?? null,
    [services, selectedServiceUuid]
  );

  return (
    <Box className="flex flex-col w-full h-full px-8 py-6 gap-6">
      <Box>
        <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900)">
          Staff Service Management
        </Typography>
        <Typography className="text-gray-600">
          Manage staff-specific price and duration for services and subservices.
        </Typography>
      </Box>
      <Divider />
      <Box className="flex flex-1 min-h-0 gap-6 w-full flex-col lg:flex-row">
        <Box className="bg-white border border-gray-200 rounded-lg w-full lg:w-[380px] flex flex-col min-h-0">
          <Box className="flex-1 min-h-0 overflow-y-auto">
            <ServiceSidebar
              services={services}
              selectedServiceUuid={selectedServiceUuid}
              onSelectService={setSelectedServiceUuid}
              onExpandParent={handleExpandParent}
              loadingMap={subLoadingMap}
            />
          </Box>
        </Box>
        <Box className="flex-1 min-w-0 flex flex-col min-h-0">
          <Box className="flex-1 min-h-0 overflow-y-auto">
            <StaffPricingPanel selectedService={selectedService} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
