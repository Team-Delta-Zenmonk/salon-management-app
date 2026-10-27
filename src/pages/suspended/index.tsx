import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";
import { APP_NAME, ADMIN_EMAIL } from "@/constants/app";
import LogoutButton from "@/components/logout";
import { closeSnackbar, setAppSuspended } from "@/components/snackbar";

export default function SuspendedPage() {
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setAppSuspended(true);
    closeSnackbar();
  }, []);

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

          <div className="flex justify-center pt-2">
            <div className="w-full max-w-[200px]">
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

