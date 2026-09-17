import { useNavigate } from "react-router-dom";
import {
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";

export default function SubscriptionWidget() {
  const navigate = useNavigate();
  const { salon } = useAppSelector((state: RootState) => state.auth);

  if (!salon) return null;

  const status = salon.subscription_status || "trial";
  const plan = salon.subscription_plan || "trial";
  const trialEndsAt = salon.trial_ends_at
    ? new Date(salon.trial_ends_at)
    : null;
  const expiresAt = salon.subscription_expires_at
    ? new Date(salon.subscription_expires_at)
    : null;
  const now = new Date();

  let daysLeft: number | null = null;
  if (status === "trial" && trialEndsAt) {
    const diffMs = trialEndsAt.getTime() - now.getTime();
    daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } else if (status === "active" && expiresAt) {
    const diffMs = expiresAt.getTime() - now.getTime();
    daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  const isExpired =
    status === "expired" ||
    status === "suspended" ||
    (status === "trial" && daysLeft !== null && daysLeft <= 0);

  if (salon.is_active === false || status === "suspended") {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold">Account Suspended</span>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold hidden sm:inline">Trial Expired</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => navigate("/billing")}
          className="h-6 px-2.5 text-[11px] font-bold rounded-full gap-1 shadow-xs"
        >
          <span>Upgrade</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  if (status === "active") {
    return (
      <button
        onClick={() => navigate("/billing")}
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition-all group"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="capitalize">{plan} Plan</span>
        {daysLeft !== null && daysLeft <= 10 && (
          <span className="text-[10px] text-muted-foreground font-normal hidden md:inline">
            ({daysLeft}d left)
          </span>
        )}
      </button>
    );
  }

  const isUrgent = daysLeft !== null && daysLeft <= 2;

  const trialText =
    daysLeft === 0 ? (
      <strong className="font-bold text-destructive">
        Expires today (Last day)
      </strong>
    ) : daysLeft === 1 ? (
      <>
        <strong className="font-bold">1</strong> day left in trial
      </>
    ) : daysLeft !== null ? (
      <>
        <strong className="font-bold">{daysLeft}</strong> days left in trial
      </>
    ) : (
      "Free Trial Active"
    );

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs transition-all ${
        isUrgent
          ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
          : "bg-primary/10 border-primary/20 text-foreground"
      }`}
    >
      <Clock
        className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? "text-amber-600 dark:text-amber-400" : "text-primary"}`}
      />
      <span className="font-medium text-[11px] sm:text-xs">{trialText}</span>
      <Button
        size="sm"
        onClick={() => navigate("/billing")}
        className="h-6 px-2 text-[11px] font-bold rounded-full gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
      >
        <span>Upgrade</span>
        <Sparkles className="w-2.5 h-2.5" />
      </Button>
    </div>
  );
}
