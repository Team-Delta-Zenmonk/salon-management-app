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
  const serviceState = useAppSelector((state: RootState) => state.service);
  const allServices = serviceState?.data ?? [];
  const parentServices = useMemo(() => allServices.filter((s: any) => !s.parent_id), [allServices]);
  const [selectedServiceUuid, setSelectedServiceUuid] = useState<string | null>(null);
  const [subServicesByParentUuid, setSubServicesByParentUuid] = useState<Record<string, ServiceType[]>>({});
  const [subServicesLoadingByParentUuid, setSubServicesLoadingByParentUuid] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(listServicesAction({ page: 1, limit: 100 }));
    dispatch(listStaffAction({ page: 1, limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (parentServices.length === 0) return;
    setSelectedServiceUuid((prev) => prev ?? parentServices[0].uuid);
  }, [parentServices]);

  const fetchSubServicesForParent = useCallback(
    async (parentUuid: string) => {
      if (subServicesByParentUuid[parentUuid]) return;
      try {
        setSubServicesLoadingByParentUuid((p) => ({ ...p, [parentUuid]: true }));

        const res = await listSubServicesService(parentUuid);
        const rows = Array.isArray(res) ? res : res?.rows ?? [];

        const subServices: ServiceType[] = rows.map((c: any) => ({
          id: c.id,
          uuid: c.uuid,
          name: c.name,
          price_type: c.price_type,
          price: c.price,
          duration: c.duration,
        }));

        setSubServicesByParentUuid((p) => ({ ...p, [parentUuid]: subServices }));
      } catch {
        setSubServicesByParentUuid((p) => ({ ...p, [parentUuid]: [] }));
      } finally {
        setSubServicesLoadingByParentUuid((p) => ({ ...p, [parentUuid]: false }));
      }
    },
    [subServicesByParentUuid]
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

  const servicesTree: ServiceType[] = useMemo(
    () =>
      parentServices.map(
        (p: any): ServiceType => ({
          id: p.id,
          uuid: p.uuid,
          name: p.name,
          price_type: p.price_type,
          price: p.price,
          duration: p.duration,
          children: subServicesByParentUuid[p.uuid] ?? [],
        })
      ),
    [parentServices, subServicesByParentUuid]
  );

  const selectedService = useMemo(
    () => servicesTree.find((s) => s.uuid === selectedServiceUuid) ?? null,
    [servicesTree, selectedServiceUuid]
  );

  return (
    <Box className="flex flex-col w-full h-full gap-6">
      <Box className="px-8">
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
              services={servicesTree}
              selectedServiceUuid={selectedServiceUuid}
              onSelectService={setSelectedServiceUuid}
              onExpandParent={handleExpandParent}
              loadingMap={subServicesLoadingByParentUuid}
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
