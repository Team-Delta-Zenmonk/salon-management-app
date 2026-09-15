import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { STATIC_DASHBOARD_DATA, itemVariants } from "../utils/dashboard.constants";

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {STATIC_DASHBOARD_DATA.stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            className="group relative overflow-hidden p-4 sm:p-5 bg-card/60 backdrop-blur-md text-card-foreground flex flex-col gap-3 rounded-3xl border border-border/50 shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="w-10 h-10 bg-background/50 rounded-xl flex items-center justify-center border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  stat.isPositive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                }`}
              >
                {stat.isPositive && <ArrowUpRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>

            <div className="relative z-10">
              <p className="font-semibold text-xs text-muted-foreground/80 mb-0.5">{stat.title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
