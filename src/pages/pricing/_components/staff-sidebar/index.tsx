import { useEffect, useMemo } from "react";
import clsx from "clsx";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { motion } from "framer-motion";
import type { Staff } from "../../../../features/staff/staff.slice";

interface StaffSidebarProps {
  selectedStaffUuid: string | null;
  onSelectStaff: (uuid: string) => void;
}

export default function StaffSidebar({ selectedStaffUuid, onSelectStaff }: Readonly<StaffSidebarProps>) {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = useMemo(() => staffState?.data ?? [], [staffState?.data]);

  useEffect(() => {
    if (staffs.length > 0 && !selectedStaffUuid) {
      onSelectStaff(staffs[0].uuid);
    }
  }, [staffs, selectedStaffUuid, onSelectStaff]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Staff Members
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Select a staff member to view and manage their services.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 custom-scrollbar">
        <div className="flex flex-col gap-2">
          {staffs.map((staff: Staff, idx: number) => {
            const isSelected = selectedStaffUuid === staff.uuid;
            const staffName = `${staff.first_name} ${staff.last_name || ""}`.trim();
            const initials = `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`.toUpperCase();

            return (
              <motion.div
                key={staff.uuid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className={clsx(
                  "flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer border transition-all duration-200 relative overflow-hidden group",
                  isSelected
                    ? "bg-primary/10 border-primary/40 shadow-[0_2px_8px_rgba(var(--primary),0.08)]"
                    : "bg-card/60 backdrop-blur-md border-border/50 hover:bg-card/80 hover:border-border/80",
                )}
                onClick={() => onSelectStaff(staff.uuid)}
              >
                {/* Active side indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="activeStaffIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Avatar
                  className={clsx(
                    "w-10 h-10 text-sm font-semibold border-2 transition-transform duration-200 group-hover:scale-105",
                    isSelected 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {staff.photos?.url && <AvatarImage src={staff.photos.url} alt={staffName} />}
                  <AvatarFallback className="bg-transparent font-bold">{initials}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className={clsx("truncate text-sm transition-colors", isSelected ? "font-bold text-foreground" : "font-medium text-foreground/90 group-hover:text-foreground")}>
                    {staffName}
                  </p>
                  <p className="text-xs text-muted-foreground/80 truncate mt-0.5">{staff.email}</p>
                </div>
              </motion.div>
            );
          })}

          {staffs.length === 0 && (
            <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm mt-2 bg-muted/20">
              No staff available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

