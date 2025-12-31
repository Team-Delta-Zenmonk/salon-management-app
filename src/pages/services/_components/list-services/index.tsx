import { Box, Typography, IconButton, Collapse, Chip, Avatar, CircularProgress } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import dayjs from "dayjs";
import { deleteServiceService } from "../../../../features/service/delete-service/delete-service.service";
import { callSnack } from "../../../../components/snackbar";
import ServiceDialog from "../service-dailog";
import { listServicesAction } from "../../../../features/service/list-services/list-service.action";
import { listSubServicesService } from "../../../../features/service/list-sub-services/list-sub-services.service";
import AssignStaffDialog from "../assign-staff-dialog";
import DeleteDialog from "../../../../components/delete-dialog";

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
  total,
}: ListServicesProps) {
  const dispatch = useAppDispatch();
  const services = useAppSelector((state: RootState) => state.service.data) ?? [];

  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [subServiceOpen, setSubServiceOpen] = useState(false);
  const [subServiceParent, setSubServiceParent] = useState<any | null>(null);
  const [editingSubServiceParent, setEditingSubServiceParent] = useState<string | null>(null);
  const [subServicesMap, setSubServicesMap] = useState<Record<string, any[]>>({});
  const [subLoadingMap, setSubLoadingMap] = useState<Record<string, boolean>>({});
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [selectedServiceForStaff, setSelectedServiceForStaff] = useState<any | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingService, setDeletingService] = useState<any | null>(null);
  const [deletingSubServiceParent, setDeletingSubServiceParent] = useState<string | null>(null);

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

  const fetchSubServices = async (parentUuid: string) => {
    if (subServicesMap[parentUuid]) return;
    try {
      setSubLoadingMap((p) => ({ ...p, [parentUuid]: true }));
      const res = await listSubServicesService(parentUuid);
      setSubServicesMap((p) => ({ ...p, [parentUuid]: res?.rows ?? [] }));
    } catch {
      callSnack("Failed to fetch sub-services", "error");
      setSubServicesMap((p) => ({ ...p, [parentUuid]: [] }));
    } finally {
      setSubLoadingMap((p) => ({ ...p, [parentUuid]: false }));
    }
  };

  const handleToggleExpand = async (uuid: string) => {
    const next = expandedService === uuid ? null : uuid;
    setExpandedService(next);
    if (next) {
      await fetchSubServices(uuid);
    }
  };

  const handleServiceDeleteClick = (service: any) => {
    setDeletingService(service);
    setDeleteDialogOpen(true);
  };

  const handleSubServiceDeleteClick = (service: any, parentUuid: string) => {
    setDeletingService(service);
    setDeletingSubServiceParent(parentUuid);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService) return;

    try {
      setDeleteLoading(true);
      await deleteServiceService(deletingService.uuid);

      if (deletingSubServiceParent) {
        const res = await listSubServicesService(deletingSubServiceParent);
        setSubServicesMap((p) => ({ ...p, [deletingSubServiceParent!]: res?.rows ?? [] }));
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

  const handleEdit = (service: any, parentUuid?: string) => {
    setSelectedService(service);
    setEditingSubServiceParent(parentUuid || null);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedService(null);
    setEditingSubServiceParent(null);
  };

  const handleOpenSubService = (parentService: any) => {
    setSubServiceParent(parentService);
    setSubServiceOpen(true);
  };

  const handleCloseSubService = () => {
    setSubServiceOpen(false);
    setSubServiceParent(null);
  };

  const handleAssignStaff = (service: any) => {
    setSelectedServiceForStaff(service);
    setStaffDialogOpen(true);
  };

  const afterSubServiceCreation = async (parentUuid: string) => {
    const res = await listSubServicesService(parentUuid);
    setSubServicesMap((p) => ({ ...p, [parentUuid]: res?.rows ?? [] }));
  };

  return (
    <>
      <Box className="text-(--primary-900) mb-4">Services List ({total})</Box>

      <InfiniteScroll
        dataLength={filteredServices.length}
        next={fetchMoreServices}
        hasMore={hasMore}
        loader={
          <Box className="flex justify-center py-4">
            <CircularProgress size={24} />
          </Box>
        }
        scrollableTarget="servicesScrollableDiv"
        endMessage={
          filteredServices.length > 0 ? (
            <Box className="text-center py-4 text-gray-500">
              <Typography variant="body2">No more services to load</Typography>
            </Box>
          ) : null
        }
      >
        <Box className="space-y-4">
          {filteredServices.map((service: any) => {
            const isExpanded = expandedService === service.uuid;
            const subServices = subServicesMap[service.uuid] ?? [];
            const subLoading = subLoadingMap[service.uuid] ?? false;

            return (
              <Box key={service.uuid} className="bg-white border border-gray-300 rounded-lg p-6">
                <Box className="flex justify-between items-start">
                  <Box className="flex gap-4">
                    {service.logo && <Avatar src={service.logo} alt={service.name} />}
                    <Box>
                      <Typography className="text-(--primary-900)" fontWeight="bold">
                        {service.name}
                      </Typography>
                      {service.description && (
                        <Typography className="text-gray-600 text-sm">{service.description}</Typography>
                      )}
                      <Box className="flex gap-2 mt-2">
                        <Chip size="small" label={service.gender} />
                        <Chip size="small" label={`${service.price_type} ₹${service.price}`} />
                        {service.is_popular && <Chip size="small" color="warning" label="Popular" />}
                        {!service.is_active && <Chip size="small" color="error" label="Inactive" />}
                      </Box>
                    </Box>
                  </Box>

                  <Box className="flex gap-1">
                    <IconButton onClick={() => handleToggleExpand(service.uuid)}>
                      {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                    <IconButton onClick={() => handleAssignStaff(service)} disabled={deleteLoading}>
                      <Person2OutlinedIcon className="text-green-600!" />
                    </IconButton>
                    <IconButton onClick={() => handleOpenSubService(service)} disabled={deleteLoading}>
                      <AddOutlinedIcon className="text-(--primary-800)!" />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(service)} disabled={deleteLoading}>
                      <ModeEditOutlineOutlinedIcon className="text-purple-800!" />
                    </IconButton>
                    <IconButton disabled={deleteLoading} onClick={() => handleServiceDeleteClick(service)}>
                      <DeleteOutlinedIcon className="text-(--error-800)!" />
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box className="mt-4 pl-6 border-l border-gray-200 space-y-3">
                    {subLoading && <Typography className="text-gray-500">Loading sub-services...</Typography>}
                    {!subLoading && subServices.length === 0 && (
                      <Typography className="text-gray-500">No sub-services yet</Typography>
                    )}
                    {!subLoading &&
                      subServices.map((sub) => (
                        <Box
                          key={sub.uuid}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                        >
                          <Box className="flex gap-3">
                            {sub.logo && <Avatar src={sub.logo} alt={sub.name} />}
                            <Box>
                              <Typography fontWeight="bold">{sub.name}</Typography>
                              {sub.description && (
                                <Typography className="text-gray-600 text-sm">{sub.description}</Typography>
                              )}
                              <Box className="flex gap-2 mt-2">
                                <Chip size="small" label={sub.gender} />
                                <Chip size="small" label={`${sub.price_type} ₹${sub.price}`} />
                                {sub.is_popular && <Chip size="small" color="warning" label="Popular" />}
                                {!sub.is_active && <Chip size="small" color="error" label="Inactive" />}
                              </Box>
                            </Box>
                          </Box>

                          <Box className="flex gap-1">
                            <IconButton onClick={() => handleEdit(sub, service.uuid)} disabled={deleteLoading}>
                              <ModeEditOutlineOutlinedIcon className="text-purple-800!" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleSubServiceDeleteClick(sub, service.uuid)}
                              disabled={deleteLoading}
                            >
                              <DeleteOutlinedIcon className="text-(--error-800)!" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                  </Box>
                </Collapse>

                <Box className="text-gray-400 text-xs mt-4">
                  Created on: {dayjs(service.created_at).format("MMM DD, YYYY")}
                </Box>
              </Box>
            );
          })}
        </Box>
      </InfiniteScroll>

      {filteredServices.length === 0 && (
        <Box className="bg-gray-200 border border-gray-400 rounded-lg p-8 text-center mt-4">
          <Typography>No services found</Typography>
        </Box>
      )}

      {selectedService && (
        <ServiceDialog
          open={editOpen}
          onClose={handleCloseEdit}
          mode="update"
          service={selectedService}
          onCreated={async () => {
            if (editingSubServiceParent) {
              await afterSubServiceCreation(editingSubServiceParent);
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
              await afterSubServiceCreation(subServiceParent.uuid);
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
          title={deletingSubServiceParent ? "Delete Sub-service?" : "Delete Service?"}
          itemName={deletingService.name}
          isLoading={deleteLoading}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  );
}
