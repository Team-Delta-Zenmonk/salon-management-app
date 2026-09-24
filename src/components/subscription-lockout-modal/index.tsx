import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Sparkles, ArrowRight, ShieldAlert, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";

import { APP_NAME } from "@/constants/app";

export default function SubscriptionLockoutModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const [isBillingPage, setIsBillingPage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const appName = APP_NAME;

  useEffect(() => {
    const handleExpiredEvent = (event: Event) => {
      const customEvt = event as CustomEvent<{
        message?: string;
        code?: string;
      }>;
      setErrorMessage(
        customEvt.detail?.message ||
        "Your trial period has ended. Operational features are paused until you choose a plan.",
      );
      setIsOpen(true);
    };

    window.addEventListener(`${appName}:subscription-expired`, handleExpiredEvent);
    return () => {
      window.removeEventListener(
        `${appName}:subscription-expired`,
        handleExpiredEvent,
      );
    };
  }, []);

  useEffect(() => {
    const isUnlockedRoute =
      location.pathname === "/appearance" ||
      location.pathname.startsWith("/login") ||
      location.pathname.startsWith("/salon-onboarding");

    if (!isUnlockedRoute && salon?.subscription_status === "expired") {
      setErrorMessage(
        "Your trial has expired. Upgrade your plan to restore full operational features.",
      );
      setIsOpen(true);
    }
    setIsBillingPage(location.pathname === "/billing")
  }, [location.pathname, salon?.subscription_status]);

  const handleNavigateToBilling = () => {
    navigate("/billing");
  };

  const isSuspended =
    salon?.is_active === false ||
    salon?.subscription_status === "suspended" ||
    errorMessage.toLowerCase().includes("inactive") ||
    errorMessage.toLowerCase().includes("suspended");

  return (
    <Dialog open={isBillingPage ? false : isOpen} onOpenChange={isBillingPage ? setIsOpen : undefined}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-6 overflow-hidden rounded-2xl border-2 border-destructive/30 bg-card shadow-2xl"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-destructive/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <DialogHeader className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-bold mx-auto uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {isSuspended
                  ? "Account Suspended"
                  : "Operational Access Paused"}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {isSuspended
                ? "Account Temporarily Inactive"
                : `Your ${appName} Trial Has Ended`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {isSuspended
                ? `Your salon account has been suspended or deactivated. Please reach out to ${appName} administration to reactivate your access.`
                : errorMessage ||
                "Your appointments, staff management, and operational services are currently on hold. Upgrade your subscription to continue seamlessly."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>What happens next?</span>
            </div>
            <ul className="space-y-1.5 text-muted-foreground pl-6 list-disc">
              <li>
                Your customer data, staff roster, and past records remain 100%
                safe.
              </li>
              <li>Your public storefront URL is preserved.</li>
              <li>
                {isSuspended
                  ? "Contact support to restore access."
                  : "Operational scheduling resumes instantly upon selecting a plan."}
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {isSuspended ? (
              <a
                href={`mailto:support@${appName}.com?subject=Account%20Reactivation%20Request`}
                className="w-full inline-flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-md hover:bg-primary/90 transition-colors"
              >
                Contact {appName} Support
              </a>
            ) : (
              <Button
                size="lg"
                onClick={handleNavigateToBilling}
                className="w-full gap-2 font-bold shadow-md shadow-primary/20"
              >
                <span>View Plans & Upgrade Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
