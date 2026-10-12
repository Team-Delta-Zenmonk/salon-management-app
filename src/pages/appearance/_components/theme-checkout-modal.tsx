import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { StorefrontTheme } from "@/features/themes/types";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const getStripeAppearance = (isDark: boolean) => ({
  theme: (isDark ? "night" : "stripe") as "night" | "stripe",
  variables: {
    colorPrimary: "#f97316",
    colorBackground: isDark ? "#171717" : "#ffffff",
    colorText: isDark ? "#f5f5f5" : "#0f0f0f",
    colorDanger: "#ef4444",
    colorTextSecondary: isDark ? "#a3a3a3" : "#6b7280",
    colorTextPlaceholder: isDark ? "#737373" : "#9ca3af",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    spacingUnit: "4px",
    borderRadius: "10px",
  },
  rules: {
    ".Input": {
      border: isDark ? "1px solid #262626" : "1px solid #e5e7eb",
      backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
      color: isDark ? "#f5f5f5" : "#0f0f0f",
      boxShadow: "none",
      padding: "10px 12px",
    },
    ".Input:focus": {
      border: "1px solid #f97316",
      boxShadow: "0 0 0 3px rgba(249,115,22,0.2)",
    },
    ".Tab": {
      border: isDark ? "1px solid #262626" : "1px solid #e5e7eb",
      backgroundColor: isDark ? "#141414" : "#f9fafb",
      color: isDark ? "#a3a3a3" : "#6b7280",
    },
    ".Tab--selected": {
      border: "1px solid #f97316",
      backgroundColor: isDark ? "#1f140e" : "#fff7ed",
      color: "#f97316",
      boxShadow: "none",
    },
  },
});

interface ThemeCheckoutFormProps {
  theme: StorefrontTheme;
  salonName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ThemeCheckoutForm: React.FC<ThemeCheckoutFormProps> = ({
  theme,
  salonName,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const priceNum = Number(theme.price) || 0;
  const formattedPrice = `₹${priceNum.toLocaleString("en-IN")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);
    setErrorMsg(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/appearance?theme_purchased=true`,
        payment_method_data: {
          billing_details: {
            name: salonName || "Salon Owner",
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

    if (paymentIntent && paymentIntent.status === "succeeded") {
      setIsPaying(false);
      onSuccess();
    } else {
      setErrorMsg("Payment was not completed. Please try again.");
      setIsPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
        <div className="rounded-xl bg-muted/60 border border-border/80 p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Theme to unlock:</span>
            <span className="font-semibold text-foreground">{theme.name}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>License:</span>
            <span className="font-medium text-foreground">Lifetime Access</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-baseline">
            <span className="font-bold text-foreground text-xs sm:text-sm">Total Due:</span>
            <span className="text-lg sm:text-xl font-extrabold text-primary font-mono">
              {formattedPrice}
            </span>
          </div>
          <div className="pt-2 mt-1 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5 bg-primary/5 -mx-3.5 -mb-3.5 p-2.5 rounded-b-xl">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              Once paid, <strong>{theme.name}</strong> will be permanently unlocked and automatically applied to your storefront.
            </span>
          </div>
        </div>

        <div className="py-1">
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
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2 shrink-0 pt-1">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPaying}
              className="w-full sm:flex-1 text-xs py-2 h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || !elements || isPaying}
              className="w-full sm:flex-1 text-xs font-bold gap-2 py-2 h-9 shadow-md shadow-primary/25 cursor-pointer"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Pay {formattedPrice}
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Secured via Stripe 256-bit encryption</span>
          </div>
        </div>
      </div>
    </form>
  );
};

interface ThemeCheckoutModalProps {
  theme: StorefrontTheme | null;
  clientSecret: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  salonName?: string;
}

export const ThemeCheckoutModal: React.FC<ThemeCheckoutModalProps> = ({
  theme,
  clientSecret,
  isOpen,
  onClose,
  onSuccess,
  salonName,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!theme || !clientSecret) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] w-full max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden border-border/80 shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-border/80 bg-card shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Unlock {theme.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Complete one-time payment to activate this premium storefront theme.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: getStripeAppearance(isDark),
          }}
        >
          <ThemeCheckoutForm
            theme={theme}
            salonName={salonName}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

