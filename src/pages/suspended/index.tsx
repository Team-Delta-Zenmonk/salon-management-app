import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";
import { APP_NAME, ADMIN_EMAIL } from "@/constants/app";
import LogoutButton from "@/components/logout";
import { Button } from "@/components/ui/button";
import { closeSnackbar, setAppSuspended } from "@/components/snackbar";
import { getSalonProfileAction } from "@/features/auth/profile/get-salon-profile/getSalonProfile.action";

export default function SuspendedPage() {
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    if (!salon?.uuid) return;
    setIsChecking(true);
    try {
      const updated = await dispatch(getSalonProfileAction(salon.uuid)).unwrap();
      if (updated && updated.is_active !== false && updated.subscription_status !== "suspended") {
        setAppSuspended(false);
        navigate("/dashboard", { replace: true });
      }
    } catch {
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    setAppSuspended(true);
    closeSnackbar();
    if (salon?.uuid) {
      dispatch(getSalonProfileAction(salon.uuid));
    }
  }, [dispatch, salon?.uuid]);

  useEffect(() => {
    if (salon && salon.is_active !== false && salon.subscription_status !== "suspended") {
      setAppSuspended(false);
      navigate("/dashboard", { replace: true });
    }
  }, [salon, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 antialiased font-sans">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm relative overflow-hidden">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive mb-6 shadow-xs">
            <ShieldAlert className="h-10 w-10" />
          </div>

          <span className="inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold font-mono text-destructive border border-destructive/20 mb-3 uppercase tracking-wider">
            Account Suspended
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">
            Your Salon Account is Suspended
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Your salon account has been suspended. Kindly contact the administrator for assistance.
          </p>

          <div className="p-4 rounded-xl bg-muted/60 border border-border mb-6 flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Administrator Email</span>
            <a
              href={`mailto:${ADMIN_EMAIL}`}
              className="text-sm sm:text-base font-semibold text-primary hover:underline break-all"
            >
              {ADMIN_EMAIL}
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={checkStatus}
              disabled={isChecking}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "Checking Status..." : "Check Status"}
            </Button>
            <div className="w-full sm:w-auto">
              <LogoutButton />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
