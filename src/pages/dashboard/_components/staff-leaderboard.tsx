import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, CheckCircle2, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { EllipsisCell } from "../../../components/ellipse-cell";
import { itemVariants } from "../utils/dashboard.constants";
import type { Staff } from "../../../features/staff/staff.slice";

interface StaffLeaderboardProps {
  staffList: Staff[];
  todayBookings: any[];
  loading: boolean;
}

export const StaffLeaderboard = ({
  staffList,
  todayBookings,
  loading,
}: StaffLeaderboardProps) => {
  const navigate = useNavigate();

  const staffTodayCountMap = useMemo(() => {
    const map = new Map<string | number, number>();
    if (!todayBookings || todayBookings.length === 0) return map;

    todayBookings.forEach((b: any) => {
      if (b.status === "cancelled" || b.status === "expired") return;
      (b.booking_services || []).forEach((bs: any) => {
        if (bs.staff_id) {
          map.set(bs.staff_id, (map.get(bs.staff_id) || 0) + 1);
        }
        if (bs.staff?.uuid) {
          map.set(bs.staff.uuid, (map.get(bs.staff.uuid) || 0) + 1);
        }
        if (bs.staff?.first_name) {
          const nameKey = `${bs.staff.first_name} ${bs.staff.last_name || ""}`.trim().toLowerCase();
          map.set(nameKey, (map.get(nameKey) || 0) + 1);
        }
      });
    });

    return map;
  }, [todayBookings]);

  return (
    <motion.div
      variants={itemVariants}
      className="lg:col-span-2 p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between min-w-0"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Team & Today's Schedule</h3>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {staffList.length} Staff Member{staffList.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time workload and staff schedule for today.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-[220px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={`staff-sk-${i}`} className="p-4 bg-muted/40 rounded-2xl flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="w-24 h-3.5 bg-muted rounded" />
                  <div className="w-16 h-3 bg-muted rounded" />
                </div>
                <div className="w-20 h-6 bg-muted rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ) : staffList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.slice(0, 4).map((staff) => {
              const fullName = `${staff.first_name}${staff.last_name ? ` ${staff.last_name}` : ""}`;
              const initials = fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "ST";
              const photoUrl = staff.photos?.secure_url || staff.photos?.url;
              const nameKey = `${staff.first_name} ${staff.last_name || ""}`.trim().toLowerCase();
              const todayCount =
                (staff.id && staffTodayCountMap.get(staff.id)) ||
                (staff.uuid && staffTodayCountMap.get(staff.uuid)) ||
                staffTodayCountMap.get(nameKey) ||
                0;

              return (
                <div
                  key={staff.uuid || staff.id}
                  className="flex items-center justify-between p-4 bg-background/40 border border-border/50 rounded-2xl hover:border-primary/30 transition-all group min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 border border-primary/10 shrink-0">
                      {photoUrl && <AvatarImage src={photoUrl} alt={fullName} />}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                      <EllipsisCell
                        value={fullName}
                        className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors capitalize truncate"
                      />
                      <EllipsisCell
                        value={staff.title || "Salon Specialist"}
                        className="text-xs text-muted-foreground font-medium capitalize truncate"
                      />
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {todayCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{todayCount} Booked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-muted/70 text-muted-foreground border border-border/50">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Available</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="my-auto flex flex-col items-center justify-center text-center py-6 gap-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No Team Members Added</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Add your stylists and barbers to assign appointments and monitor their daily schedules.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs rounded-full gap-1.5"
              onClick={() => navigate("/staff")}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-muted-foreground">
        <span>
          Team status: <strong className="text-foreground">{staffList.length} Active Member{staffList.length !== 1 ? "s" : ""}</strong>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs font-bold text-primary hover:bg-transparent gap-1"
          onClick={() => navigate("/staff")}
        >
          <span>Manage Team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};
