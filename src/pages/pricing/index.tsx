import { useEffect, useState } from "react";
import { User, Layers } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useAppDispatch } from "../../store/hooks";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import ServiceView from "./_components/service-view";
import StaffView from "./_components/staff-view";

export type ViewMode = "service" | "staff";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function StaffServiceManagementPage() {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>("staff");

  useEffect(() => {
    dispatch(listServicesAction({ page: 1, limit: 1000 }));
    dispatch(listStaffAction({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const handleViewChange = (newMode: ViewMode) => {
    setViewMode(newMode);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex flex-col w-full max-w-[1600px] mx-auto pb-10 px-4 md:px-8 pt-4"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Staff Service Pricing
          </h1>
          <p className="text-muted-foreground/80 text-sm">
            Manage which staff provide each service and configure custom pricing or durations.
          </p>
        </div>

        {/* Premium Sliding View Mode Toggle */}
        <div className="relative inline-flex h-11 items-center justify-center rounded-xl bg-muted/60 p-1 text-muted-foreground border border-border/50 backdrop-blur-sm">
          <button
            onClick={() => handleViewChange("staff")}
            className={`relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
              viewMode === "staff" ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {viewMode === "staff" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <User className="h-4 w-4 mr-2 relative z-20" />
            <span className="relative z-20">By Staff</span>
          </button>
          <button
            onClick={() => handleViewChange("service")}
            className={`relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
              viewMode === "service" ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {viewMode === "service" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Layers className="h-4 w-4 mr-2 relative z-20" />
            <span className="relative z-20">By Service</span>
          </button>
        </div>
      </motion.div>

      {/* Main View Container */}
      <motion.div variants={itemVariants} className="w-full flex-1 min-h-[600px] flex flex-col">
        {viewMode === "service" ? <ServiceView /> : <StaffView />}
      </motion.div>
    </motion.div>
  );
}

