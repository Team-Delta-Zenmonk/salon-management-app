import { Box, Typography, IconButton, Collapse, Chip } from "@mui/material";
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

interface ListServicesProps {
  searchQuery: string;
  categoryUuid?: string;
  refreshServices?: (cb?: () => void) => Promise<void>;
}

export default function ListServices({
  searchQuery,
  categoryUuid,
  refreshServices: refreshServicesProp,
}: ListServicesProps) {
  const dispatch = useAppDispatch();

  const services = useAppSelector((state: RootState) => state.service.services) ?? [];

  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [subServiceOpen, setSubServiceOpen] = useState(false);
  const [subServiceParent, setSubServiceParent] = useState<any | null>(null);
  const [editingSubServiceParent, setEditingSubServiceParent] = useState<string | null>(null);
  const [subServicesMap, setSubServicesMap] = useState<Record<string, any[]>>({});
  const [subLoadingMap, setSubLoadingMap] = useState<Record<string, boolean>>({});

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
      await dispatch(listServicesAction({ category_uuid: categoryUuid }));
    } else {
      await dispatch(listServicesAction(undefined));
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

  const handleDelete = async (uuid: string) => {
    try {
      setIsLoading(true);
      await deleteServiceService(uuid);
      await refreshServices();
      callSnack("Service deleted successfully", "success");
    } catch {
      callSnack("Failed to delete service", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubServiceDelete = async (parentUuid: string, subUuid: string) => {
    try {
      setIsLoading(true);
      await deleteServiceService(subUuid);
      const res = await listSubServicesService(parentUuid);
      setSubServicesMap((p) => ({ ...p, [parentUuid]: res?.rows ?? [] }));

      callSnack("Sub-service deleted successfully", "success");
    } catch {
      callSnack("Failed to delete sub-service", "error");
    } finally {
      setIsLoading(false);
    }
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

  const afterSubServiceCreation = async (parentUuid: string) => {
    const res = await listSubServicesService(parentUuid);
    setSubServicesMap((p) => ({ ...p, [parentUuid]: res?.rows ?? [] }));
  };

  return (
    <Box className="space-y-4">
      {filteredServices.map((service: any) => {
        const isExpanded = expandedService === service.uuid;
        const subServices = subServicesMap[service.uuid] ?? [];
        const subLoading = subLoadingMap[service.uuid] ?? false;

        return (
          <Box key={service.uuid} className="bg-white border border-gray-300 rounded-lg p-6">
            <Box className="flex justify-between items-start">
              <Box className="flex gap-4">
                {service.logo && (
                  <img src={service.logo} alt={service.name} className="w-14 h-14 rounded-full object-cover" />
                )}

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

                <IconButton>
                  <Person2OutlinedIcon className="text-green-600!" />
                </IconButton>

                <IconButton onClick={() => handleOpenSubService(service)} disabled={isLoading}>
                  <AddOutlinedIcon className="text-(--primary-800)!" />
                </IconButton>

                <IconButton onClick={() => handleEdit(service)} disabled={isLoading}>
                  <ModeEditOutlineOutlinedIcon className="text-purple-800!" />
                </IconButton>

                <IconButton disabled={isLoading} onClick={() => handleDelete(service.uuid)}>
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
                        {sub.logo && (
                          <img src={sub.logo} alt={sub.name} className="w-10 h-10 rounded-full object-cover" />
                        )}
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
                        <IconButton onClick={() => handleEdit(sub, service.uuid)} disabled={isLoading}>
                          <ModeEditOutlineOutlinedIcon className="text-purple-800!" />
                        </IconButton>
                        <IconButton onClick={() => handleSubServiceDelete(service.uuid, sub.uuid)} disabled={isLoading}>
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

      {filteredServices.length === 0 && (
        <Box className="bg-gray-200 border border-gray-400 rounded-lg p-8 text-center">
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
    </Box>
  );
}
