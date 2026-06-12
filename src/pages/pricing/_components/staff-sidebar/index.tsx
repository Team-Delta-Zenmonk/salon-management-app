import { Box, Typography, Avatar } from "@mui/material";
import { useEffect } from "react";
import clsx from "clsx";
import SearchBar from "../../../../components/searchbar";
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
    <Box className="h-full flex flex-col pt-6">
      <Box className="px-6 flex items-center justify-between pb-4">
        <Typography fontWeight="800" className="text-[var(--text-muted)] text-xs uppercase tracking-widest">
          Staff Members
        </Typography>
        <Box className="bg-[var(--primary-50)] text-[var(--primary-700)] text-xs font-bold px-2.5 py-0.5 rounded-full">
          {staffs.length} total
        </Box>
      </Box>
      <Box className="px-6 pb-4">
        <Box className="relative">
          <SearchBar onSearch={() => { }} placeholder="Search Staff Member" />
        </Box>
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        <Box className="flex flex-col gap-1.5">
          {staffs.map((staff: any) => {
            const isSelected = selectedStaffUuid === staff.uuid;
            const staffName = `${staff.first_name} ${staff.last_name || ""}`.trim();
            const initials = `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`.toUpperCase();

            return (
              <Box
                key={staff.uuid}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all relative overflow-hidden group",
                  isSelected
                    ? "bg-[var(--surface)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[var(--border-subtle)]"
                    : "bg-transparent border border-transparent hover:bg-[var(--surface-muted)]",
                )}
                onClick={() => onSelectStaff(staff.uuid)}
              >
                {isSelected && (
                  <Box className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-900)] rounded-r-full shadow-[2px_0_4px_rgba(15,23,42,0.15)]" />
                )}
                <Avatar
                  src={staff.photos?.url}
                  className="w-10 h-10 text-sm font-semibold ml-1 shadow-sm"
                  style={!isSelected ? { opacity: 0.8 } : {}}
                >
                  {!staff.photos?.url && initials}
                </Avatar>

                <Box className="min-w-0 flex-1 pl-1">
                  <Typography className="truncate capitalize text-sm" fontWeight={isSelected ? "800" : "600"} color={isSelected ? "var(--text-primary)" : "var(--text-muted)"}>
                    {staffName}
                  </Typography>
                  <Typography className="text-[11px] truncate text-[var(--text-muted)] mt-0.5">{staff.email}</Typography>
                </Box>
              </Box>
            );
          })}

          {staffs.length === 0 && (
            <Box className="border border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center text-[var(--text-muted)] text-sm mt-2">
              No staff available.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
