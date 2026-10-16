import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Share2, Check, ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { EllipsisCell } from "../../../components/ellipse-cell";
import { getStorefrontUrl } from "../../../lib/domain";
import { callSnack } from "../../../components/snackbar";

interface DashboardHeaderProps {
  salonName?: string;
  salonSlug?: string;
  isVerifying: boolean;
  stripeAccountId?: string;
  isConnecting: boolean;
  onStripeConnect: () => void;
  onViewDashboard: () => void;
}

export const DashboardHeader = ({
  salonName,
  salonSlug,
  isVerifying,
  stripeAccountId,
  isConnecting,
  onStripeConnect,
  onViewDashboard,
}: DashboardHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyStorefront = async () => {
    if (!salonSlug) return;
    const url = getStorefrontUrl(salonSlug);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      callSnack("Storefront link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  const handleOpenStorefront = () => {
    if (!salonSlug) return;
    window.open(getStorefrontUrl(salonSlug), "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-6 shrink-0 gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground/80 text-sm flex flex-wrap items-center gap-x-1 gap-y-0.5">
          <span>Welcome back,</span>
          <span className="inline-flex items-center font-medium text-foreground">
            <EllipsisCell value={salonName || "Owner"} maxChars={20} className="align-middle capitalize" />
            <span>!</span>
          </span>
          <span>Here's a quick overview of your salon today.</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {salonSlug && (
          <div className="flex items-center gap-1.5 p-1.5 bg-card/60 border border-border/50 rounded-2xl shadow-sm">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-8 px-3 font-semibold border-border/50 gap-1.5 hover:bg-primary/5 hover:text-primary transition-all"
              onClick={handleCopyStorefront}
              title="Copy your public booking link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Storefront</span>
                </>
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleOpenStorefront}
              title="Open storefront preview"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

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
      </div>
    </motion.div>
  );
};
