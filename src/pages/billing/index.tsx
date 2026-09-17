import { useState, useEffect, useCallback } from "react";
import {
  loadStripe,
  type StripeElementsOptions,
} from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Sparkles,
  Check,
  ShieldCheck,
  Globe,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Clock,
  Loader2,
  Building2,
  PhoneCall,
  FileText,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";
import { getSalonProfileAction } from "@/features/auth/profile/get-salon-profile/getSalonProfile.action";
import {
  createSubscriptionIntent,
  getSubscriptionInvoices,
  type SubscriptionInvoice,
} from "@/features/subscription/subscription.service";
import { SUBSCRIPTION_PLAN } from "@/common/enums/subscription-plan.enum";
import { SUBSCRIPTION_STATUS } from "@/common/enums/subscription-status.enum";
import { callSnack } from "@/components/snackbar";
import { getStorefrontUrl } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stripeAppearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#f97316",
    colorBackground: "#ffffff",
    colorText: "#0f0f0f",
    colorDanger: "#ef4444",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    spacingUnit: "4px",
    borderRadius: "10px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e5e7eb",
      boxShadow: "none",
      padding: "10px 12px",
    },
    ".Input:focus": {
      border: "1px solid #f97316",
      boxShadow: "0 0 0 3px rgba(249,115,22,0.15)",
    },
    ".Label": {
      fontWeight: "500",
      fontSize: "12px",
      marginBottom: "4px",
    },
    ".Tab": {
      border: "1px solid #e5e7eb",
    },
    ".Tab:hover": {
      border: "1px solid #f97316",
    },
    ".Tab--selected": {
      border: "2px solid #f97316",
      backgroundColor: "#fff7ed",
    },
  },
};

interface CheckoutFormProps {
  plan: typeof SUBSCRIPTION_PLAN.MONTHLY | typeof SUBSCRIPTION_PLAN.YEARLY;
  amount: number;
  salonName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ plan, amount, salonName, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);
    setErrorMsg(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/billing?payment=success`,
        payment_method_data: {
          billing_details: {
            name: salonName,
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMsg(error.message || "Payment failed. Please try again.");
      setIsPaying(false);
      return;
    }

    callSnack("Payment successful! Activating your subscription...", "success");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="rounded-xl bg-muted/60 border border-border/80 p-3.5 sm:p-4 space-y-2 text-xs">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Target Plan:</span>
          <span className="font-semibold text-foreground capitalize">
            {plan} ({plan === "yearly" ? "365 days" : "30 days"})
          </span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Base amount:</span>
          <span className="font-mono text-foreground">
            ₹{plan === "yearly" ? "21,178" : "2,117"}
          </span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>GST (18%):</span>
          <span className="font-mono text-foreground">
            ₹{plan === "yearly" ? "3,812" : "382"}
          </span>
        </div>
        <div className="pt-2 border-t border-border flex justify-between items-baseline">
          <span className="font-bold text-foreground text-sm">Total Due:</span>
          <span className="text-xl sm:text-2xl font-extrabold text-primary font-mono">
            ₹{amount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="min-h-[180px]">
        <PaymentElement
          options={{
            layout: {
              type: "accordion",
              defaultCollapsed: false,
              radios: "always",
              spacedAccordionItems: false,
            },
          }}
        />
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPaying}
          className="w-full sm:flex-1 text-xs py-2.5 h-auto cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isPaying}
          className="w-full sm:flex-1 text-xs font-bold gap-2 py-2.5 h-auto shadow-md shadow-primary/25 cursor-pointer"
        >
          {isPaying ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              Pay ₹{amount.toLocaleString("en-IN")}
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Secured by{" "}
        <span className="font-semibold text-foreground">Stripe</span> • 256-bit encryption • Tax invoice generated automatically
      </p>
    </form>
  );
}

export default function PlanAndBillingPage() {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);

  const [checkoutPlan, setCheckoutPlan] = useState<
    typeof SUBSCRIPTION_PLAN.MONTHLY | typeof SUBSCRIPTION_PLAN.YEARLY | null
  >(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentAmount, setIntentAmount] = useState<number>(0);
  const [loadingPlan, setLoadingPlan] = useState<
    typeof SUBSCRIPTION_PLAN.MONTHLY | typeof SUBSCRIPTION_PLAN.YEARLY | null
  >(null);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  const currentStatus = salon?.subscription_status || SUBSCRIPTION_STATUS.TRIAL;
  const currentPlan = salon?.subscription_plan || SUBSCRIPTION_PLAN.YEARLY;
  const trialEndsAt = salon?.trial_ends_at ? new Date(salon.trial_ends_at) : null;
  const expiresAt = salon?.subscription_expires_at
    ? new Date(salon.subscription_expires_at)
    : null;
  const now = new Date();

  let daysLeft: number | null = null;
  if (currentStatus === SUBSCRIPTION_STATUS.TRIAL && trialEndsAt) {
    daysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000));
  } else if (currentStatus === SUBSCRIPTION_STATUS.ACTIVE && expiresAt) {
    daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000));
  }

  const storefrontUrl = salon?.slug ? getStorefrontUrl(salon.slug) : null;

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoadingInvoices(true);
      setInvoices(await getSubscriptionInvoices());
    } catch {
    } finally {
      setIsLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", "/billing");
      handlePaymentSuccess();
    }
  }, []);

  const isActiveYearly =
    currentPlan === SUBSCRIPTION_PLAN.YEARLY &&
    currentStatus === SUBSCRIPTION_STATUS.ACTIVE &&
    expiresAt &&
    expiresAt > now;

  const openCheckout = async (
    plan: typeof SUBSCRIPTION_PLAN.MONTHLY | typeof SUBSCRIPTION_PLAN.YEARLY
  ) => {
    if (isActiveYearly && plan === SUBSCRIPTION_PLAN.MONTHLY) {
      callSnack(
        `Your yearly plan is active until ${expiresAt?.toLocaleDateString("en-IN", { dateStyle: "long" })}. You can switch to monthly after it expires.`,
        "error"
      );
      return;
    }

    try {
      setLoadingPlan(plan);
      const res = await createSubscriptionIntent(plan);
      setClientSecret(res.clientSecret);
      setIntentAmount(res.amount);
      setCheckoutPlan(plan);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Could not start checkout. Please try again.";
      callSnack(msg, "error");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsActivating(true);
    let attempts = 0;
    const poll = async () => {
      try {
        const updatedSalon = await dispatch(getSalonProfileAction(salon!.uuid)).unwrap();
        if (updatedSalon?.subscription_status === "active") {
          callSnack("Subscription activated! Welcome to ZenMonk Pro 🎉", "success");
          setIsActivating(false);
          setClientSecret(null);
          setCheckoutPlan(null);
          fetchInvoices();
          return;
        }
      } catch {
      }
      attempts++;
      if (attempts < 10) {
        setTimeout(poll, 1500);
      } else {
        setIsActivating(false);
        callSnack("Payment received! Your subscription will activate shortly.", "success");
        setClientSecret(null);
        setCheckoutPlan(null);
        fetchInvoices();
      }
    };
    poll();
  };

  const closeCheckout = () => {
    setClientSecret(null);
    setCheckoutPlan(null);
  };

  const stripeOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: stripeAppearance,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          <CreditCard className="w-4 h-4" />
          <span>SaaS Platform & Entitlements</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Plan & Billing Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          Manage your ZenMonk subscription, monitor your 14-day trial, and upgrade anytime.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-medium text-muted-foreground">Current Plan:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize bg-primary/15 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                {currentPlan === "yearly"
                  ? "Yearly Plan (Best Value)"
                  : currentPlan === "monthly"
                  ? "Monthly Plan"
                  : "14-Day Free Trial"}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                  currentStatus === "active"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : currentStatus === "trial"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {currentStatus === "active"
                  ? "Active"
                  : currentStatus === "trial"
                  ? "14-Day Free Trial"
                  : "Expired"}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                {salon?.name || "Your Salon"}
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {currentStatus === "trial" && trialEndsAt && (
                  <span>
                    Trial ends{" "}
                    <strong>{trialEndsAt.toLocaleDateString(undefined, { dateStyle: "long" })}</strong>{" "}
                    ({daysLeft === 0 ? "Last day!" : `${daysLeft} days left`})
                  </span>
                )}
                {currentStatus === "active" && expiresAt && (
                  <span>
                    Renews{" "}
                    <strong>{expiresAt.toLocaleDateString(undefined, { dateStyle: "long" })}</strong>{" "}
                    ({daysLeft === 0 ? "Today" : `${daysLeft} days left`})
                  </span>
                )}
                {currentStatus === "expired" && (
                  <span className="text-destructive font-semibold">
                    Plan expired. Activate a subscription to restore full access.
                  </span>
                )}
              </p>
            </div>

            {storefrontUrl && (
              <div className="pt-2">
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/80 px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span>Storefront:</span>
                  <span className="font-mono text-foreground font-semibold underline underline-offset-2">
                    {storefrontUrl}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              </div>
            )}
          </div>

          {isActivating && (
            <div className="shrink-0 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              Activating subscription...
            </div>
          )}
        </div>

        {currentStatus === "trial" && (
          <div className="mt-6 pt-5 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground text-sm">
                  You are exploring the 14-Day Free Trial of the {currentPlan === "yearly" ? "Yearly Plan (Save ~20%)" : "Monthly Plan"}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  {daysLeft !== null && daysLeft > 0 ? (
                    <>You have <strong>{daysLeft} days remaining</strong> until {trialEndsAt?.toLocaleDateString(undefined, { dateStyle: "medium" })}. Pay now to lock in your discounted rate and prevent service interruption.</>
                  ) : (
                    <>Your trial ends today. Pay now to keep your storefront, staff calendar, and POS permanently active.</>
                  )}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => openCheckout(currentPlan === "yearly" ? "yearly" : "monthly")}
              disabled={loadingPlan !== null}
              className="font-bold text-xs shrink-0 shadow-md shadow-primary/25 gap-1.5 h-9 px-4 cursor-pointer"
            >
              {loadingPlan === currentPlan ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Pay & Activate {currentPlan === "yearly" ? "Yearly (₹24,990)" : "Monthly (₹2,499)"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-lg font-bold text-foreground">Available Subscription Plans</h3>
          <p className="text-xs text-muted-foreground">
            All prices in INR (₹) inclusive of 18% GST. Payments secured by Stripe.
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
      >
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between shadow-xs relative transition-all"
        >
          {currentStatus === "trial" && currentPlan === "trial" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="rounded-full px-3 py-0.5 text-[10px] font-bold shadow-xs uppercase tracking-wider bg-amber-500 text-white">
                Active Free Trial
              </span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Zero Risk</span>
              <h4 className="text-xl font-bold text-foreground mt-1">14-Day Free Trial</h4>
              <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">
                Test-drive the full ZenMonk platform with zero commitment.
              </p>
            </div>
            <div className="pt-2 pb-3 border-b border-border/60">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground font-mono">₹0</span>
                <span className="text-xs text-muted-foreground">for 14 days</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Included with your registration</p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {["Full platform access", "Branded storefront subdomain", "Appointment calendar", "Walk-in bookings", "Basic staff setup"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-6">
            <Button variant="outline" size="default" disabled className="w-full text-xs font-bold opacity-80">
              {currentStatus === "trial" ? "Trial Active (14 Days)" : "Trial Concluded"}
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`rounded-2xl border bg-card p-6 flex flex-col justify-between shadow-xs relative transition-all ${
            currentPlan === "monthly" && currentStatus === "active"
              ? "border-primary ring-2 ring-primary/20"
              : currentPlan === "monthly" && currentStatus === "trial"
              ? "border-amber-500 ring-2 ring-amber-500/30"
              : "border-border/80 hover:border-primary/40"
          }`}
        >
          {currentPlan === "monthly" && currentStatus === "active" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="rounded-full px-3 py-0.5 text-[10px] font-bold shadow-xs uppercase tracking-wider bg-primary text-primary-foreground">
                Current Plan
              </span>
            </div>
          )}
          {currentPlan === "monthly" && currentStatus === "trial" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="rounded-full px-3 py-0.5 text-[10px] font-bold shadow-xs uppercase tracking-wider bg-amber-500 text-white">
                Selected Plan • Trial Active
              </span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pay As You Go</span>
              <h4 className="text-xl font-bold text-foreground mt-1">Monthly Plan</h4>
              <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">
                Flexible month-to-month for busy salons.
              </p>
            </div>
            <div className="pt-2 pb-3 border-b border-border/60">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground font-mono">₹2,499</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Billed monthly • Cancel anytime</p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {["Unlimited bookings", "Branded storefront", "Walk-in POS & receipts", "Staff commissions & tips", "Inventory depletion"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-6 space-y-2">
            {isActiveYearly ? (
              <div className="w-full text-center">
                <Button variant="outline" size="default" disabled className="w-full text-xs font-bold opacity-60 cursor-not-allowed">
                  Not Available During Yearly Plan
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Available after{" "}
                  {expiresAt?.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>
            ) : (
              <Button
                variant={currentPlan === "monthly" ? "default" : "outline"}
                size="default"
                onClick={() => openCheckout("monthly")}
                disabled={loadingPlan !== null}
                className="w-full text-xs font-bold cursor-pointer"
              >
                {loadingPlan === "monthly" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : currentPlan === "monthly" && currentStatus === "active" ? (
                  "Renew Monthly Plan"
                ) : currentPlan === "monthly" && currentStatus === "trial" ? (
                  "Pay & Activate Monthly Plan"
                ) : (
                  "Choose Monthly Plan"
                )}
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`rounded-2xl border-2 border-primary bg-card p-6 flex flex-col justify-between shadow-xl shadow-primary/10 relative overflow-hidden ${
            currentPlan === "yearly" && currentStatus === "active"
              ? "ring-2 ring-primary"
              : currentPlan === "yearly" && currentStatus === "trial"
              ? "ring-2 ring-amber-500/40"
              : ""
          }`}
        >
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
            Best Value • Save ~20%
          </div>
          {currentPlan === "yearly" && currentStatus === "active" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="rounded-full px-3 py-0.5 text-[10px] font-bold shadow-xs uppercase tracking-wider bg-primary text-primary-foreground">
                Current Plan
              </span>
            </div>
          )}
          {currentPlan === "yearly" && currentStatus === "trial" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="rounded-full px-3 py-0.5 text-[10px] font-bold shadow-xs uppercase tracking-wider bg-amber-500 text-white">
                Selected Plan • Trial Active
              </span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Annual Commitment</span>
              <h4 className="text-xl font-bold text-foreground mt-1">Yearly Plan</h4>
              <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">
                Most cost-effective plan for long-term revenue growth.
              </p>
            </div>
            <div className="pt-2 pb-3 border-b border-border/60">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground font-mono">₹24,990</span>
                <span className="text-xs text-muted-foreground">/ year</span>
              </div>
              <p className="text-[10px] text-primary font-semibold mt-0.5">
                = ₹2,082/mo • 2 Months Free (Save ₹4,998)
              </p>
            </div>
            <ul className="space-y-2 text-xs text-foreground font-medium">
              {["Everything in Monthly Plan", "Save ₹4,998/year (2 months free)", "Priority live chat & VIP support", "Unlimited staff seats", "Full POS, inventory & daily reports"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-6">
            <Button
              size="default"
              onClick={() => openCheckout("yearly")}
              disabled={loadingPlan !== null}
              className="w-full text-xs font-bold shadow-md shadow-primary/25 cursor-pointer"
            >
              {loadingPlan === "yearly" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : currentPlan === "yearly" && currentStatus === "active" ? (
                "Renew Yearly Plan"
              ) : currentPlan === "yearly" && currentStatus === "trial" ? (
                "Pay & Lock In Yearly Discount"
              ) : (
                "Choose Yearly Plan (Best Value)"
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-all"
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Multi-Location</span>
              <h4 className="text-xl font-bold text-foreground mt-1">Enterprise</h4>
              <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">
                Tailored for salon chains, multi-branch groups & franchises.
              </p>
            </div>
            <div className="pt-2 pb-3 border-b border-border/60">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground font-mono">Custom</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Custom SLA & volume pricing</p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {["Unlimited branches & chairs", "Multi-branch command center", "Custom domain (yourbrand.com)", "Dedicated account manager", "99.98% Enterprise Uptime SLA"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-6">
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsEnterpriseModalOpen(true)}
              className="w-full text-xs font-bold gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Contact Us / VIP Demo
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <div className="space-y-4 pt-6 border-t border-border/70">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Billing Receipts & Invoices</h3>
            <p className="text-xs text-muted-foreground">
              GST receipts and verified Stripe payment records.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvoices}
            disabled={isLoadingInvoices}
            className="text-xs gap-1.5"
          >
            {isLoadingInvoices ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">No paid invoices yet</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your GST receipts and Stripe transaction records will appear here after your first payment.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Stripe ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground">
                  {invoices.map((inv) => (
                    <tr key={inv.uuid} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </td>
                      <td className="py-3.5 px-4 font-medium capitalize">
                        {inv.plan} ({inv.plan === "yearly" ? "365 days" : "30 days"})
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground text-[10px]">
                        {inv.stripe_payment_intent_id
                          ? inv.stripe_payment_intent_id.slice(0, 24) + "…"
                          : "Manual"}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono">
                        ₹{Number(inv.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Paid
                          </span>
                        ) : inv.status === "failed" ? (
                          <span
                            title={inv.payment_details?.failure_reason || "Payment declined"}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 cursor-help"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!clientSecret && !!checkoutPlan} onOpenChange={closeCheckout}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 border border-border/80 rounded-2xl">
          <div className="bg-primary/10 border-b border-primary/20 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/30 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                    Subscribe to ZenMonk
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Secure checkout powered by Stripe
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-xs capitalize bg-background shrink-0">
                {checkoutPlan} Plan
              </Badge>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {clientSecret && checkoutPlan && (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <CheckoutForm
                  plan={checkoutPlan}
                  amount={intentAmount}
                  salonName={salon?.name || "Your Salon"}
                  onSuccess={handlePaymentSuccess}
                  onCancel={closeCheckout}
                />
              </Elements>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEnterpriseModalOpen} onOpenChange={setIsEnterpriseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Enterprise Plan — Contact Us
            </DialogTitle>
            <DialogDescription>
              Our team will reach out within 24 hours to discuss your requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>📧 <strong className="text-foreground">enterprise@zenmonk.tech</strong></p>
            <p>📞 <strong className="text-foreground">+91 98765 43210</strong></p>
            <p>We offer custom pricing for salon chains with 3+ locations, franchise groups, and high-volume spas.</p>
          </div>
          <Button onClick={() => setIsEnterpriseModalOpen(false)} className="w-full mt-2">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
