import { Box, Typography, Avatar } from "@mui/material";
import clsx from "clsx";
import type { ServiceType } from "../../types/staff-service.types";
import { CategoryOutlined } from "@mui/icons-material";
import { useEffect } from "react";

interface ServiceSideBarProps {
  services: ServiceType[];
  selectedServiceUuid: string | null;
  onSelectService: (uuid: string) => void;
  onExpandParent?: (uuid: string) => Promise<void> | void;
  loadingMap?: Record<string, boolean>;
}

export default function ServiceSidebar({
  services,
  selectedServiceUuid,
  onSelectService,
}: Readonly<ServiceSideBarProps>) {
  useEffect(() => {
    if (services.length > 0 && !selectedServiceUuid) {
      onSelectService(services[0].uuid);
    }
  }, [services, selectedServiceUuid, onSelectService]);

  return (
    <Box className="h-full flex flex-col">
      <Box className="px-4 pt-4 pb-2">
        <Typography fontWeight="bold" className="text-(--primary-900)">
          Services
        </Typography>
        <Typography className="text-xs text-gray-500 mt-1">
          Select a main service to manage its assigned staff.
        </Typography>
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        <Box className="flex flex-col gap-2 mt-2">
          {services.map((s) => {
            const isSelected = selectedServiceUuid === s.uuid;

            return (
              <Box
                key={s.uuid}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-colors",
                  isSelected
                    ? "bg-indigo-50 border-indigo-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    : "bg-white border-gray-200 hover:bg-gray-50",
                )}
                onClick={() => onSelectService(s.uuid)}
              >
                <Avatar
                  src={s.logo ?? undefined}
                  className={clsx(
                    "w-10 h-10 text-sm",
                    isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400",
                  )}
                >
                  <CategoryOutlined fontSize="small" />
                </Avatar>

                <Box className="min-w-0 flex-1">
                  <Typography className="truncate text-sm text-gray-900" fontWeight={isSelected ? "bold" : "medium"}>
                    {s.name}
                  </Typography>
                  <Typography className="text-xs text-gray-500 truncate">
                    Base: ₹{s.price ?? "-"} · {s.duration ?? "-"}m
                  </Typography>
                </Box>
              </Box>
            );
          })}

          {services.length === 0 && (
            <Box className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm mt-2">
              No services available.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
