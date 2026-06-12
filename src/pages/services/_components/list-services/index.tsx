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
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

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
}: Readonly<ListServicesProps>) {
  const dispatch = useAppDispatch();
  const services = useAppSelector((state: RootState) => state.service.data) ?? [];

  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [subServiceOpen, setSubServiceOpen] = useState(false);
  const [subServiceParent, setSubServiceParent] = useState<any>(null);
  const [editingSubServiceParent, setEditingSubServiceParent] = useState<string | null>(null);
  const [subServicesMap, setSubServicesMap] = useState<Record<string, any[]>>({});
  const [subLoadingMap, setSubLoadingMap] = useState<Record<string, boolean>>({});
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [selectedServiceForStaff, setSelectedServiceForStaff] = useState<any>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingService, setDeletingService] = useState<any>(null);
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
      <Box className="text-[var(--text-muted)] mb-4 font-semibold text-sm uppercase tracking-wider">
        Services List ({total})
      </Box>

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
            <Box className="text-center py-4 text-[var(--text-muted)]">
              <Typography variant="body2">No more services to load</Typography>
            </Box>
          ) : null
        }
      >
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", lg: "repeat(2, 1fr)" }} gap={3} alignItems="start">
          {filteredServices.map((service: any) => {
            const isExpanded = expandedService === service.uuid;
            const subServices = subServicesMap[service.uuid] ?? [];
            const subLoading = subLoadingMap[service.uuid] ?? false;

            return (
              <Box key={service.uuid} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[20px] p-6 shadow-sm flex flex-col min-w-0">
                <Box className="flex flex-col md:flex-row gap-5 items-start md:items-center">
                  <Box className="flex items-center gap-4 flex-1 min-w-0 w-full">
                    <Avatar
                      variant="rounded"
                      src={service.logo || undefined}
                      alt={service.name}
                      sx={{ width: 56, height: 56, borderRadius: '16px', backgroundColor: "var(--primary-50)", color: "var(--primary-700)", fontWeight: "bold" }}
                    >
                      {!service.logo && service.name ? service.name.charAt(0).toUpperCase() : null}
                    </Avatar>
                    <Box className="flex-1 min-w-0">
                      <Typography fontWeight="700" className="text-[var(--text-primary)] capitalize truncate block w-full text-[18px]">
                        {service.name}
                      </Typography>
                      {service.description && (
                        <Typography className="text-[var(--text-muted)] text-[14px] truncate mt-0.5">
                          {service.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <Box className="flex flex-wrap gap-2 items-center">
                      <Chip size="small" label={service.gender} className="bg-[var(--error-50)] text-[var(--error-600)] font-bold border-none uppercase text-[11px]" sx={{ height: 28, borderRadius: 2 }} />
                      <Chip size="small" label={`${service.price_type} ₹${service.price}`} className="bg-[var(--success-50)] text-[var(--success-700)] font-bold border-none text-[11px] uppercase" sx={{ height: 28, borderRadius: 2 }} />
                    </Box>
                    <IconButton size="small" className="border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-muted)]" sx={{ width: 32, height: 32 }} onClick={() => handleToggleExpand(service.uuid)}>
                      {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box className="mt-5 pt-5 border-t border-dashed border-[var(--border-subtle)] flex flex-col gap-4">
                    {subLoading && <Typography className="text-[var(--text-muted)] text-sm">Loading sub-services...</Typography>}
                    {!subLoading && subServices.length === 0 && (
                      <Typography className="text-[var(--text-muted)] text-sm">No sub-services found.</Typography>
                    )}
                    {!subLoading &&
                      subServices.map((sub) => (
                        <Box
                          key={sub.uuid}
                          className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-4 flex justify-between items-center"
                        >
                          <Box className="flex gap-4 items-center flex-1 min-w-0">
                            <Avatar src={sub.logo || undefined} alt={sub.name} sx={{ width: 48, height: 48, backgroundColor: "var(--surface-muted)", color: "var(--text-primary)", fontWeight: "bold", borderRadius: 3 }}>
                              {!sub.logo && sub.name ? sub.name.charAt(0).toUpperCase() : null}
                            </Avatar>
                            <Box className="flex flex-col">
                              <Typography fontWeight="700" className="text-[var(--text-primary)] capitalize text-[15px]">{sub.name}</Typography>
                              <Box className="flex items-center gap-1.5 mt-0.5 text-[var(--text-muted)]">
                                <AccessTimeOutlinedIcon sx={{ fontSize: '14px' }} />
                                <Typography variant="caption" className="font-semibold uppercase text-[11px] tracking-wide">{sub.duration || 60} MIN</Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Box className="flex gap-4 items-center">
                            <Typography fontWeight="700" className="text-[var(--text-primary)] text-[15px]">₹{sub.price}</Typography>
                            <Chip size="small" icon={<AccessTimeOutlinedIcon sx={{ fontSize: '16px' }} />} label={`${sub.duration || 60} m`} className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-semibold border-none text-xs" sx={{ height: 28, px: 0.5 }} />
                            <Box className="flex gap-1">
                              <IconButton size="small" className="text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-50)]" onClick={() => handleEdit(sub, service.uuid)} disabled={deleteLoading}>
                                <ModeEditOutlineOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                className="text-[var(--text-muted)] hover:text-[var(--error-600)] hover:bg-[var(--error-50)]"
                                onClick={() => handleSubServiceDeleteClick(sub, service.uuid)}
                                disabled={deleteLoading}
                              >
                                <DeleteOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                  </Box>
                </Collapse>

                <Box className="flex justify-between items-center mt-6 pt-5 border-t border-dashed border-[var(--border-subtle)]">
                  <Typography className="text-[var(--text-muted)] text-xs font-bold">
                    {dayjs(service.created_at).format("MMM DD, YYYY")}
                  </Typography>
                  <Box className="flex gap-2.5">
                    <IconButton size="medium" className="text-[var(--success-600)] hover:bg-[var(--success-50)]" onClick={() => handleOpenSubService(service)} disabled={deleteLoading}>
                      <AddOutlinedIcon />
                    </IconButton>
                    <IconButton size="medium" className="border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-muted)]" onClick={() => handleAssignStaff(service)} disabled={deleteLoading}>
                      <Person2OutlinedIcon />
                    </IconButton>
                    <IconButton size="medium" className="border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-muted)]" onClick={() => handleEdit(service)} disabled={deleteLoading}>
                      <ModeEditOutlineOutlinedIcon />
                    </IconButton>
                    <IconButton size="medium" className="border border-[var(--error-200)] rounded-xl text-[var(--error-600)] bg-white hover:bg-[var(--error-50)]" disabled={deleteLoading} onClick={() => handleServiceDeleteClick(service)}>
                      <DeleteOutlinedIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </InfiniteScroll>

      {filteredServices.length === 0 && (
        <Box className="bg-[var(--surface-muted)] border border-dashed border-[var(--border-subtle)] rounded-[20px] p-10 text-center mt-4">
          <Typography className="text-[var(--text-muted)] font-medium">No services found</Typography>
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
