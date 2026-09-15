import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { STATIC_DASHBOARD_DATA, itemVariants } from "../utils/dashboard.constants";
import { EllipsisCell } from "../../../components/ellipse-cell";

export const StaffLeaderboard = () => {
  return (
    <motion.div
      variants={itemVariants}
      className="lg:col-span-2 p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm flex flex-col justify-between"
    >
      <div>
        <h3 className="text-lg font-bold text-foreground">Top Performing Staff</h3>
        <p className="text-sm text-muted-foreground">Highest rated and most booked staff this week.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {STATIC_DASHBOARD_DATA.staffPerformance.map((staff) => (
          <div
            key={staff.name}
            className="flex items-center justify-between p-4 bg-background/40 border border-border/40 rounded-2xl hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 border border-primary/10 shrink-0">
                <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {staff.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <EllipsisCell value={staff.name} className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors" />
                <EllipsisCell value={staff.role} className="text-xs text-muted-foreground font-medium" />
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
              <span className="text-xs font-bold text-foreground">{staff.bookings} Bookings</span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-yellow-600">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500 animate-pulse" />
                <span>{staff.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground font-medium border-t border-border/20 pt-4">
        <p>
          Overall customer satisfaction: <span className="text-green-600 font-bold">98.4%</span>
        </p>
        <Button variant="ghost" className="h-auto p-0 text-xs font-bold text-primary hover:bg-transparent">
          Manage Staff Performance &rarr;
        </Button>
      </div>
    </motion.div>
  );
};
