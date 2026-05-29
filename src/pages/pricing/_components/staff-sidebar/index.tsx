import { Box, Typography, Avatar } from "@mui/material";
import { useEffect } from "react";
import clsx from "clsx";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";

interface StaffSidebarProps {
  selectedStaffUuid: string | null;
  onSelectStaff: (uuid: string) => void;
}

export default function StaffSidebar({ selectedStaffUuid, onSelectStaff }: Readonly<StaffSidebarProps>) {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];

  useEffect(() => {
    if (staffs.length > 0 && !selectedStaffUuid) {
      onSelectStaff(staffs[0].uuid);
    }
  }, [staffs, selectedStaffUuid, onSelectStaff]);

  return (
    <Box className="h-full flex flex-col">
      <Box className="px-4 pt-4 pb-2">
        <Typography fontWeight="bold" className="text-(--primary-900)">
          Staff Members
        </Typography>
        <Typography className="text-xs text-gray-500 mt-1">
          Select a staff member to view and manage their services.
        </Typography>
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        <Box className="flex flex-col gap-2">
          {staffs.map((staff: any) => {
            const isSelected = selectedStaffUuid === staff.uuid;
            const staffName = `${staff.first_name} ${staff.last_name || ""}`.trim();
            const initials = `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`.toUpperCase();

            return (
              <Box
                key={staff.uuid}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-colors",
                  isSelected
                    ? "bg-indigo-50 border-indigo-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    : "bg-white border-gray-200 hover:bg-gray-50",
                )}
                onClick={() => onSelectStaff(staff.uuid)}
              >
                <Avatar
                  src={staff.photos?.url}
                  className={clsx(
                    "w-10 h-10 text-sm font-semibold",
                    isSelected ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600",
                  )}
                >
                  {!staff.photos?.url && initials}
                </Avatar>

                <Box className="min-w-0 flex-1">
                  <Typography className="truncate text-sm text-gray-900" fontWeight={isSelected ? "bold" : "medium"}>
                    {staffName}
                  </Typography>
                  <Typography className="text-xs text-gray-500 truncate">{staff.email}</Typography>
                </Box>
              </Box>
            );
          })}

          {staffs.length === 0 && (
            <Box className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm mt-2">
              No staff available.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
