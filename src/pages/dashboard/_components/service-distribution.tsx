import { motion } from "framer-motion";
import { Sparkles, Scissors, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { EllipsisCell } from "../../../components/ellipse-cell";
import { itemVariants } from "../utils/dashboard.constants";
import type { TopBookedService } from "../utils/dashboard-view.model";
import type { Service } from "../../../features/service/service.slice";

interface ServiceDistributionProps {
  topServices: TopBookedService[];
  catalogServices: Service[];
  loading: boolean;
  timeRange: "7d" | "30d";
}

export const ServiceDistribution = ({
  topServices,
  catalogServices,
  loading,
  timeRange,
}: ServiceDistributionProps) => {
  const navigate = useNavigate();
  const rangeText = timeRange === "7d" ? "last 7 days" : "last 30 days";

  return (
    <motion.div
      variants={itemVariants}
      className="p-6 md:p-8 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between min-w-0"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Most Booked Services</h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {timeRange === "7d" ? "7D" : "30D"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {topServices.length > 0
            ? `Top services by booking volume in the ${rangeText}.`
            : `Your active salon services (${catalogServices.length} live).`}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-[220px]">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={`srv-sk-${i}`} className="p-3 bg-muted/40 rounded-xl space-y-2 animate-pulse">
                <div className="flex justify-between">
                  <div className="w-24 h-3.5 bg-muted rounded" />
                  <div className="w-12 h-3.5 bg-muted rounded" />
                </div>
                <div className="w-full h-2 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : topServices.length > 0 ? (
          <div className="flex flex-col gap-3">
            {topServices.slice(0, 4).map((service, index) => (
              <div
                key={service.name}
                className="group p-3 rounded-xl bg-background/40 border border-border/40 hover:border-primary/30 transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <EllipsisCell
                      value={service.name}
                      className="font-semibold text-foreground group-hover:text-primary transition-colors capitalize" maxChars={30}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="text-muted-foreground font-medium">
                      {service.count} booking{service.count !== 1 ? "s" : ""}
                    </span>
                    <span className="font-bold text-foreground">{service.percentage}%</span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(service.percentage, 6)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>Revenue: ₹{service.revenue.toLocaleString()}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Share</span>
                </div>
              </div>
            ))}
          </div>
        ) : catalogServices.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-2.5 mb-1">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                No bookings in this period yet. Showing your active service menu:
              </p>
            </div>
            {catalogServices.slice(0, 3).map((service) => (
              <div
                key={service.uuid || service.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Scissors className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <EllipsisCell value={service.name} className="text-xs font-semibold text-foreground capitalize" maxChars={30} />
                    <span className="text-[10px] text-muted-foreground">{service.duration} mins</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground shrink-0">₹{service.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-auto flex flex-col items-center justify-center text-center py-6 gap-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
              <Scissors className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No Services Added</p>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Add services to your catalog so clients can start booking.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs rounded-full"
              onClick={() => navigate("/services")}
            >
              + Add Service
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {topServices.length > 0 ? "Ranked by booking count" : "Active Menu Services"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs font-bold text-primary hover:bg-transparent gap-1"
          onClick={() => navigate("/services")}
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};
