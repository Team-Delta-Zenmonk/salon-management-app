import { motion } from "framer-motion";
import { CalendarClock, Users, CreditCard, TrendingUp } from "lucide-react";
import { itemVariants } from "../utils/dashboard.constants";
import {
  formatCompactNumber,
  formatIndianCurrency,
} from "@/utils/format-number";

interface StatsGridProps {
  loading: boolean;
  totalRevenue: number;
  completedBookings: number;
  uniqueClients: number;
  walkInClients?: number;
  onlineClients?: number;
  avgTicketSize: number;
  timeRange: "7d" | "30d";
}

export const StatsGrid = ({
  loading,
  totalRevenue,
  completedBookings,
  uniqueClients,
  avgTicketSize,
  timeRange,
}: StatsGridProps) => {
  const rangeLabel = timeRange === "7d" ? "Last 7 Days" : "Last 30 Days";

  const stats = [
    {
      title: `Revenue (${rangeLabel})`,
      value: formatIndianCurrency(totalRevenue, true),
      icon: CreditCard,
    },
    {
      title: `Bookings (${rangeLabel})`,
      value: formatCompactNumber(completedBookings),
      icon: CalendarClock,
    },
    {
      title: "Customers",
      value: formatCompactNumber(uniqueClients),
      icon: Users,
    },
    {
      title: "Avg. Ticket Size",
      value: formatIndianCurrency(avgTicketSize, true),
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`stat-sk-${i}`}
            className="p-4 sm:p-5 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm flex flex-col gap-3 min-w-0"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-muted/60 animate-pulse" />
            </div>
            <div className="space-y-2 mt-1">
              <div className="w-24 h-3 rounded bg-muted/60 animate-pulse" />
              <div className="w-20 h-7 rounded bg-muted/60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            className="group relative overflow-hidden p-4 sm:p-5 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col justify-between gap-3 rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 min-w-0"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

            <div className="flex items-start justify-between relative z-10 gap-2">
              <div className="w-10 h-10 bg-background/50 rounded-xl flex items-center justify-center border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="relative z-10 mt-1 min-w-0">
              <p className="font-semibold text-xs text-muted-foreground/80 mb-0.5 truncate">{stat.title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground truncate">{stat.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
