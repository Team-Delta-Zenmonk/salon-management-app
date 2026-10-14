import { motion } from "framer-motion";
import { CalendarClock, Users, CreditCard, TrendingUp } from "lucide-react";
import { itemVariants } from "../utils/dashboard.constants";

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
  walkInClients = 0,
  onlineClients = 0,
  avgTicketSize,
  timeRange,
}: StatsGridProps) => {
  const rangeLabel = timeRange === "7d" ? "Last 7 Days" : "Last 30 Days";

  const getClientBadge = () => {
    if (uniqueClients === 0) return { text: undefined, color: undefined };
    if (walkInClients > 0 && onlineClients === 0) {
      return { text: "Walk-in", color: "bg-primary/10 text-primary border border-primary/20" };
    }
    if (walkInClients > 0 && onlineClients > 0) {
      return { text: "Walk-in & Online", color: "bg-primary/10 text-primary border border-primary/20" };
    }
    return { text: "Online", color: "bg-primary/10 text-primary border border-primary/20" };
  };

  const getClientSubtitle = () => {
    if (uniqueClients === 0) return "Ready for first client";
    if (walkInClients > 0 && onlineClients > 0) {
      return `${walkInClients} walk-in • ${onlineClients} online`;
    }
    if (walkInClients > 0 && onlineClients === 0) {
      return `${walkInClients} walk-in customer${walkInClients !== 1 ? "s" : ""}`;
    }
    return `${uniqueClients} customer${uniqueClients !== 1 ? "s" : ""}`;
  };

  const clientBadge = getClientBadge();
  const clientSubtitle = getClientSubtitle();

  const stats = [
    {
      title: `Revenue (${rangeLabel})`,
      value: `₹${totalRevenue.toLocaleString()}`,
      badge: totalRevenue > 0 ? "Actual Earnings" : "No Earnings Yet",
      badgeColor:
        totalRevenue > 0
          ? "bg-primary/10 text-primary border border-primary/20"
          : "bg-muted/70 text-muted-foreground border border-border/40",
      subtitle:
        completedBookings > 0
          ? `From ${completedBookings} completed appointment${completedBookings !== 1 ? "s" : ""}`
          : "No completed bookings",
      icon: CreditCard,
    },
    {
      title: `Bookings (${rangeLabel})`,
      value: completedBookings.toString(),
      badge: undefined,
      badgeColor: undefined,
      subtitle:
        completedBookings > 0
          ? `${completedBookings} completed appointment${completedBookings !== 1 ? "s" : ""}`
          : "No completed bookings",
      icon: CalendarClock,
    },
    {
      title: "Customers",
      value: uniqueClients.toString(),
      badge: clientBadge.text,
      badgeColor: clientBadge.color,
      subtitle: clientSubtitle,
      icon: Users,
    },
    {
      title: "Avg. Ticket Size",
      value: `₹${avgTicketSize.toLocaleString()}`,
      badge: "Per Booking",
      badgeColor: "bg-primary/10 text-primary border border-primary/20",
      subtitle: completedBookings > 0 ? "Average spent per client" : "Calculated from bookings",
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
              <div className="w-16 h-5 rounded-full bg-muted/60 animate-pulse" />
            </div>
            <div className="space-y-2 mt-1">
              <div className="w-24 h-3 rounded bg-muted/60 animate-pulse" />
              <div className="w-20 h-7 rounded bg-muted/60 animate-pulse" />
              <div className="w-28 h-2.5 rounded bg-muted/40 animate-pulse" />
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
              {stat.badge && (
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full truncate ${stat.badgeColor}`}
                >
                  {stat.badge}
                </span>
              )}
            </div>

            <div className="relative z-10 mt-1 min-w-0">
              <p className="font-semibold text-xs text-muted-foreground/80 mb-0.5 truncate">{stat.title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground truncate">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">{stat.subtitle}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
