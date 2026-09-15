import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface DashboardHeaderProps {
  salonName?: string;
  isVerifying: boolean;
  stripeAccountId?: string;
  isConnecting: boolean;
  onStripeConnect: () => void;
  onViewDashboard: () => void;
}

export const DashboardHeader = ({
  salonName,
  isVerifying,
  stripeAccountId,
  isConnecting,
  onStripeConnect,
  onViewDashboard,
}: DashboardHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 shrink-0 gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground/80 text-sm">
          Welcome back, {salonName || "Owner"}! Here's a quick overview of your salon today.
        </p>
      </div>

      <div className="flex-shrink-0">
        {isVerifying ? (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-2xl shadow-sm text-yellow-700 dark:text-yellow-500">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-yellow-600 dark:text-yellow-500" />
            <div className="text-left">
              <span className="text-xs font-bold">Verifying Payouts Setup</span>
              <p className="text-[10px] text-muted-foreground">This may take a few moments...</p>
            </div>
          </div>
        ) : !stripeAccountId ? (
          <div className="flex items-center gap-4 p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <div className="text-left">
                <p className="text-xs font-extrabold text-red-600 dark:text-red-500">Payouts Setup Required</p>
                <p className="text-[10px] text-muted-foreground">Salon hidden from search</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs h-8 px-3.5 font-semibold shadow-sm shadow-red-600/20"
              onClick={onStripeConnect}
              disabled={isConnecting}
            >
              {isConnecting ? "Redirecting..." : "Connect Stripe"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-3 bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <div className="text-left">
                <p className="text-xs font-extrabold text-green-600 dark:text-green-500">Payouts Active</p>
                <p className="text-[10px] text-muted-foreground">Salon visible & live</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/20 rounded-xl text-xs h-8 px-3.5 font-semibold"
              onClick={onViewDashboard}
            >
              Stripe Dashboard
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
