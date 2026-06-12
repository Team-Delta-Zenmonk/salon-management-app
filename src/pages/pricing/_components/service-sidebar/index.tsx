import { Box, Typography, Avatar } from "@mui/material";
import clsx from "clsx";
import type { ServiceType } from "../../types/staff-service.types";
import { CategoryOutlined } from "@mui/icons-material";
import { useEffect } from "react";
import SearchBar from "../../../../components/searchbar";

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
    <Box className="h-full flex flex-col pt-6">
      <Box className="px-6 flex items-center justify-between pb-4">
        <Typography fontWeight="800" className="text-[var(--text-muted)] text-xs uppercase tracking-widest">
          Active Services
        </Typography>
        <Box className="bg-[var(--primary-50)] text-[var(--primary-700)] text-xs font-bold px-2.5 py-0.5 rounded-full">
          {services.length} total
        </Box>
      </Box>

      <Box className="px-6 pb-4">
        <Box className="relative">
          <SearchBar onSearch={() => { }} placeholder="Search Category" />
        </Box>
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        <Box className="flex flex-col gap-1.5 mt-2">
          {services.map((s) => {
            const isSelected = selectedServiceUuid === s.uuid;

            return (
              <Box
                key={s.uuid}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all relative overflow-hidden group",
                  isSelected
                    ? "bg-[var(--surface)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[var(--border-subtle)]"
                    : "bg-transparent border border-transparent hover:bg-[var(--surface-muted)]",
                )}
                onClick={() => onSelectService(s.uuid)}
              >
                {isSelected && (
                  <Box className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-900)] rounded-r-full shadow-[2px_0_4px_rgba(15,23,42,0.15)]" />
                )}
                <Avatar
                  src={s.logo ?? undefined}
                  className="w-10 h-10 text-sm ml-1 shadow-sm rounded-xl"
                  style={!isSelected ? { opacity: 0.8 } : {}}
                >
                  <CategoryOutlined fontSize="small" />
                </Avatar>

                <Box className="min-w-0 flex-1 pl-1">
                  <Typography className="truncate capitalize text-sm" fontWeight={isSelected ? "800" : "600"} color={isSelected ? "var(--text-primary)" : "var(--text-muted)"}>
                    {s.name}
                  </Typography>
                  <Typography className="text-[11px] truncate text-[var(--text-muted)] mt-0.5">
                    Base: ₹{s.price ?? "-"}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          {services.length === 0 && (
            <Box className="border border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center text-[var(--text-muted)] text-sm mt-2">
              No services available.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
