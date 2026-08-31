import InfiniteScroll from "react-infinite-scroll-component";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { Loader2, SearchX } from "lucide-react";
import { deleteServiceService } from "../../../../features/service/delete-service/delete-service.service";
import { callSnack } from "../../../../components/snackbar";
import ServiceDialog from "../service-dailog";
import { listServicesAction } from "../../../../features/service/list-services/list-service.action";
import AssignStaffDialog from "../assign-staff-dialog";
import DeleteDialog from "../../../../components/delete-dialog";
import { ServiceCard } from "./service-card";
import { SubServicesDrawer } from "./sub-services-drawer";
import { motion } from "framer-motion";
import type { Service } from "../../../../features/service/service.slice";

interface ListServicesProps {
  searchQuery: string;
  categoryUuid?: string;
  refreshServices?: (cb?: () => void) => Promise<void>;
  hasMore: boolean;
  fetchMoreServices: () => void;
  total: number;
}

export default function ListServices({
  searchQuery,
  categoryUuid,
  refreshServices: refreshServicesProp,
  hasMore,
  fetchMoreServices,
}: Readonly<ListServicesProps>) {
  const dispatch = useAppDispatch();
  const servicesState = useAppSelector((state: RootState) => state.service);
  const services = useMemo(() => servicesState?.data ?? [], [servicesState?.data]);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [subServiceOpen, setSubServiceOpen] = useState(false);
  const [subServiceParent, setSubServiceParent] = useState<Service | null>(null);
  const [editingSubServiceParent, setEditingSubServiceParent] = useState<string | null>(null);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [selectedServiceForStaff, setSelectedServiceForStaff] = useState<Service | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [deletingSubServiceParent, setDeletingSubServiceParent] = useState<string | null>(null);

  // Sub-services drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeParentService, setActiveParentService] = useState<Service | null>(null);

  // Used to trigger refetching of sub-services in a specific ServiceCard or drawer
  const [refreshTriggers, setRefreshTriggers] = useState<Record<string, number>>({});

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return services
      .filter((s) => !s.parent_id)
      .filter((s) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
  }, [services, searchQuery]);

  const refreshServices = async (cb?: () => void) => {
    if (refreshServicesProp) {
      await refreshServicesProp(cb);
    } else if (categoryUuid && categoryUuid !== "all") {
      await dispatch(listServicesAction({ category_uuid: categoryUuid, page: 1, limit: 10 }));
    } else {
      await dispatch(listServicesAction({ page: 1, limit: 10 }));
    }
  };

  const triggerSubServiceRefresh = (parentUuid: string) => {
    setRefreshTriggers((prev) => ({
      ...prev,
      [parentUuid]: (prev[parentUuid] || 0) + 1,
    }));
  };

  const handleServiceDeleteClick = (service: Service, parentUuid?: string) => {
    setDeletingService(service);
    if (parentUuid) {
      setDeletingSubServiceParent(parentUuid);
    } else {
      setDeletingSubServiceParent(null);
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService) return;

    try {
      setDeleteLoading(true);
      await deleteServiceService(deletingService.uuid);

      if (deletingSubServiceParent) {
        triggerSubServiceRefresh(deletingSubServiceParent);
        callSnack("Sub-service deleted successfully", "success");
      } else {
        await refreshServices();
        callSnack("Service deleted successfully", "success");
      }
    } catch {
      callSnack("Failed to delete service", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeletingService(null);
      setDeletingSubServiceParent(null);
    }
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingService(null);
    setDeletingSubServiceParent(null);
  };

  const handleEdit = (service: Service, parentUuid?: string) => {
    setSelectedService(service);
    setEditingSubServiceParent(parentUuid || null);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedService(null);
    setEditingSubServiceParent(null);
  };

  const handleOpenSubService = (parentService: Service) => {
    setSubServiceParent(parentService);
    setSubServiceOpen(true);
  };

  const handleCloseSubService = () => {
    setSubServiceOpen(false);
    setSubServiceParent(null);
  };

  const handleAssignStaff = (service: Service) => {
    setSelectedServiceForStaff(service);
    setStaffDialogOpen(true);
  };

  const handleManageOptions = (service: Service) => {
    setActiveParentService(service);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          All Services
          <span className="text-primary text-base font-medium bg-primary/10 px-2.5 py-0.5 rounded-full">
            {filteredServices.length}
          </span>
        </h2>
      </div>

      <InfiniteScroll
        dataLength={filteredServices.length}
        next={fetchMoreServices}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
          </div>
        }
        scrollableTarget="servicesScrollableDiv"
        endMessage={
          filteredServices.length > 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm flex items-center justify-center gap-2">
              <div className="w-12 h-px bg-border/50"></div>
              End of services
              <div className="w-12 h-px bg-border/50"></div>
            </div>
          ) : null
        }
      >
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {filteredServices.map((service: Service) => (
            <ServiceCard
              key={service.uuid}
              service={service}
              onEdit={handleEdit}
              onDelete={handleServiceDeleteClick}
              onAddSubService={handleOpenSubService}
              onAssignStaff={handleAssignStaff}
              onManageOptions={handleManageOptions}
              deleteLoading={deleteLoading}
              refreshTrigger={refreshTriggers[service.uuid] || 0}
            />
          ))}
        </motion.div>
      </InfiniteScroll>

      {filteredServices.length === 0 && (
        <div className="bg-card/40 border border-dashed border-border/50 rounded-3xl p-12 flex flex-col items-center justify-center mt-4">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No services found</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            We couldn't find any services matching your criteria. Try adjusting your search or category filters.
          </p>
        </div>
      )}

      {activeParentService && (
        <SubServicesDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setActiveParentService(null);
          }}
          parentService={activeParentService}
          onEdit={handleEdit}
          onDelete={handleServiceDeleteClick}
          onAddSubService={handleOpenSubService}
          onAssignStaff={handleAssignStaff}
          deleteLoading={deleteLoading}
          refreshTrigger={refreshTriggers[activeParentService.uuid] || 0}
        />
      )}

      {selectedService && (
        <ServiceDialog
          open={editOpen}
          onClose={handleCloseEdit}
          mode="update"
          service={selectedService}
          onCreated={async () => {
            if (editingSubServiceParent) {
              triggerSubServiceRefresh(editingSubServiceParent);
            }
            await refreshServices();
          }}
        />
      )}
      {subServiceParent && (
        <ServiceDialog
          open={subServiceOpen}
          onClose={handleCloseSubService}
          mode="create"
          parentService={subServiceParent}
          onCreated={async () => {
            if (subServiceParent?.uuid) {
              triggerSubServiceRefresh(subServiceParent.uuid);
            }
            await refreshServices();
          }}
        />
      )}
      {selectedServiceForStaff && (
        <AssignStaffDialog
          open={staffDialogOpen}
          onClose={() => {
            setStaffDialogOpen(false);
            setSelectedServiceForStaff(null);
          }}
          serviceUuid={selectedServiceForStaff.uuid}
          service={selectedServiceForStaff}
          onStaffAssigned={refreshServices}
        />
      )}

      {deletingService && (
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={handleCloseDelete}
          title={deletingSubServiceParent ? "Delete Sub-service" : "Delete Service"}
          itemName={deletingService.name}
          isLoading={deleteLoading}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  );
}
