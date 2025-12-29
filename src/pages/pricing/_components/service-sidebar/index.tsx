import { Box, Typography, IconButton, Collapse, CircularProgress, Divider } from "@mui/material";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { useState } from "react";
import clsx from "clsx";
import type { ServiceType } from "../../types/staff-service.types";

interface ServiceSideBarProps {
  services: ServiceType[];
  selectedServiceUuid: string | null;
  onSelectService: (uuid: string) => void;
  onExpandParent: (uuid: string) => Promise<void> | void;
  loadingMap: Record<string, boolean>;
}

export default function ServiceSidebar({
  services,
  selectedServiceUuid,
  onSelectService,
  onExpandParent,
  loadingMap,
}: ServiceSideBarProps) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = async (uuid: string) => {
    const next = !openMap[uuid];
    setOpenMap((p) => ({ ...p, [uuid]: next }));
    if (next) await onExpandParent(uuid);
  };

  return (
    <Box className="h-full flex flex-col">
      <Box className="px-4 pt-4 pb-2">
        <Typography fontWeight="bold" className="text-(--primary-900)">
          Services
        </Typography>
        <Typography className="text-xs text-gray-500 mt-1">Main services and their sub-services.</Typography>
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        <Box className="flex flex-col gap-2">
          {services.map((s) => {
            const isSelected = selectedServiceUuid === s.uuid;
            const isOpen = !!openMap[s.uuid];
            const loading = !!loadingMap[s.uuid];

            return (
              <Box key={s.uuid} className="flex flex-col">
                <Box
                  className={clsx(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer border",
                    isSelected ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => onSelectService(s.uuid)}
                >
                  <Box className="w-[34px] flex items-center justify-center shrink-0">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(s.uuid);
                      }}
                    >
                      {isOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                    </IconButton>
                  </Box>

                  <Box className="min-w-0 flex-1">
                    <Typography className="truncate" fontWeight={isSelected ? "bold" : "medium"}>
                      {s.name}
                    </Typography>
                    <Typography className="text-xs text-gray-500 truncate">
                      Base: ₹{s.price ?? "-"} · {s.duration ?? "-"}m · {s.price_type ?? "-"}
                    </Typography>
                  </Box>
                </Box>

                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Box className="pl-[34px] pb-2 pr-2">
                    <Box className="ml-2 border-l border-gray-200 pl-4 flex flex-col gap-2">
                      {loading ? (
                        <Box className="flex items-center gap-2 text-gray-500 text-sm py-2">
                          <CircularProgress size={16} /> Loading subservices...
                        </Box>
                      ) : (s.children?.length ?? 0) === 0 ? (
                        <Typography className="text-sm text-gray-500 py-1">No sub-services</Typography>
                      ) : (
                        <>
                          <Typography className="text-xs text-gray-500 font-medium">Sub-services</Typography>

                          {s.children!.map((child) => (
                            <Box key={child.uuid} className="p-2 border border-gray-200 rounded-md bg-white">
                              <Typography className="truncate text-sm font-medium text-gray-800">
                                {child.name}
                              </Typography>
                              <Typography className="text-xs text-gray-500">
                                Base: ₹{child.price ?? "-"} · {child.duration ?? "-"}m · {child.price_type ?? "-"}
                              </Typography>
                              <Typography className="text-xs text-sky-800 mt-1">
                                Adjust staff pricing from the right panel
                              </Typography>
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            );
          })}

          {services.length === 0 && (
            <Box className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">
              No services available.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
