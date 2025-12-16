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

interface ListServicesProps {
  searchQuery: string;
  categoryUuid?: string;
}

export default function ListServices({ searchQuery, categoryUuid }: ListServicesProps) {
  const dispatch = useAppDispatch();

  const services = useAppSelector((state: RootState) => state.service.services) ?? [];
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isLoading, setisLoading] = useState(false);

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return services
      .filter((s) => !s.parent_id)
      .filter((s) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
  }, [services, searchQuery]);

  const handleDelete = async (uuid: string) => {
    try {
      setisLoading(true);
      await deleteServiceService(uuid);

      if (categoryUuid && categoryUuid !== "all") {
        await dispatch(listServicesAction({ category_uuid: categoryUuid }));
      } else {
        await dispatch(listServicesAction(undefined));
      }

      callSnack("Service deleted successfully", "success");
    } catch {
      callSnack("Failed to delete service", "error");
    } finally {
      setisLoading(false);
    }
  };

  const handleEdit = (service: any) => {
    setSelectedService(service);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedService(null);
  };

  return (
    <Box className="space-y-4">
      {filteredServices.map((service: any) => {
        const isExpanded = expandedService === service.uuid;

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
                <IconButton onClick={() => setExpandedService(isExpanded ? null : service.uuid)}>
                  {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>

                <IconButton>
                  <Person2OutlinedIcon className="text-green-600!" />
                </IconButton>

                <IconButton>
                  <AddOutlinedIcon className="text-(--primary-800)!" />
                </IconButton>

                <IconButton onClick={() => handleEdit(service)}>
                  <ModeEditOutlineOutlinedIcon className="text-purple-800!" />
                </IconButton>

                <IconButton disabled={isLoading} onClick={() => handleDelete(service.uuid)}>
                  <DeleteOutlinedIcon className="text-(--error-800)!" />
                </IconButton>
              </Box>
            </Box>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box className="mt-4 pl-6 border-l border-gray-200">
                <Typography className="text-gray-500">Sub-services will appear here</Typography>
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
        <ServiceDialog open={editOpen} onClose={handleCloseEdit} mode="update" service={selectedService} />
      )}
    </Box>
  );
}
