import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Store, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FIELD_LIMITS } from "@/common/field-limits";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { onboardStripeAction } from "@/features/stripe/onboard-stripe/onboard-stripe.action";
import { callSnack } from "@/components/snackbar";

interface PaymentPolicyCardProps {
  isSaving?: boolean;
}

const POLICY_OPTIONS = [
  {
    value: "pay_at_venue",
    title: "Pay at Venue (No upfront payment)",
    description: "Customers can book instantly without a card and pay after their service at the salon.",
    badgeText: "Lowest Friction",
    badgeVariant: "secondary" as const,
    requiresStripe: false,
  },
  {
    value: "partial_deposit",
    title: "Require Partial Deposit",
    description: "Customers pay a percentage upfront to secure their booking. Rest is paid at the salon.",
    badgeText: "Balanced Protection",
    badgeVariant: "outline" as const,
    requiresStripe: true,
  },
  {
    value: "full_upfront",
    title: "Require Full Payment Upfront",
    description: "Customers pay 100% online during checkout to secure their slot.",
    badgeText: "Max Security",
    badgeVariant: "default" as const,
    requiresStripe: true,
  },
];

export default function PaymentPolicyCard({ isSaving }: Readonly<PaymentPolicyCardProps>) {
  const { control } = useFormContext();
  const dispatch = useAppDispatch();
  const salon = useAppSelector((state) => state.auth.salon);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  const hasStripeAccount = Boolean(salon?.stripe_account_id);

  const handleConnectStripe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsConnectingStripe(true);
      const res = await dispatch(onboardStripeAction()).unwrap();
      if (res?.message?.url) {
        window.location.href = res.message.url;
      }
    } catch {
      callSnack("Failed to start Stripe onboarding", "error");
    } finally {
      setIsConnectingStripe(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden w-full max-w-full">
      <CardHeader className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <Store className="w-5 h-5 text-primary shrink-0" />
              Allowed Booking Payment Options
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Select one or multiple payment options you want to offer your customers at checkout.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-2">
        {!hasStripeAccount && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-300">
            <div className="flex items-start gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-foreground">Account Verification Required for Online Payments</p>
                <p className="text-muted-foreground">
                  Verfiy your account to enable partial deposits or full upfront payments at checkout.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isConnectingStripe || isSaving}
              onClick={handleConnectStripe}
              className="shrink-0 text-xs font-semibold gap-1.5 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
            >
              {isConnectingStripe ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Verify Account
                  <ExternalLink className="w-3 h-3" />
                </>
              )}
            </Button>
          </div>
        )}

        <Controller
          name="allowed_payment_policies"
          control={control}
          render={({ field, fieldState }) => {
            const selectedValues: string[] = Array.isArray(field.value) ? field.value : [field.value].filter(Boolean);

            const toggleValue = (value: string, isDisabled: boolean) => {
              if (isSaving || isDisabled) return;
              let nextValues: string[];
              if (selectedValues.includes(value)) {
                if (selectedValues.length <= 1) return;
                nextValues = selectedValues.filter((v) => v !== value);
              } else {
                nextValues = [...selectedValues, value];
              }
              field.onChange(nextValues);
            };

            return (
              <div className="space-y-3">
                <div className="grid gap-3">
                  {POLICY_OPTIONS.map((option) => {
                    const isDisabledByStripe = option.requiresStripe && !hasStripeAccount;
                    const isSelected = selectedValues.includes(option.value);
                    const isCheckboxDisabled = isSaving || isDisabledByStripe;

                    return (
                      <div
                        key={option.value}
                        onClick={() => toggleValue(option.value, isDisabledByStripe)}
                        className={cn(
                          "relative flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 select-none min-w-0 w-full overflow-hidden",
                          isDisabledByStripe
                            ? "opacity-55 cursor-not-allowed border-border/40 bg-muted/20"
                            : "cursor-pointer",
                          isSelected && !isDisabledByStripe
                            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                            : !isDisabledByStripe && "border-border/50 bg-background/50 hover:border-border hover:bg-accent/40"
                        )}
                      >
                        <Checkbox
                          checked={isSelected && !isDisabledByStripe}
                          onCheckedChange={() => toggleValue(option.value, isDisabledByStripe)}
                          disabled={isCheckboxDisabled}
                          className="mt-1 shrink-0"
                        />

                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <Label
                              className={cn(
                                "font-bold text-sm text-foreground flex items-center gap-2",
                                isDisabledByStripe ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"
                              )}
                            >
                              {option.title}
                            </Label>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isDisabledByStripe && (
                                <Badge variant="secondary" className="text-[9px] py-0 px-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                  Verify Account First
                                </Badge>
                              )}
                              <Badge variant={option.badgeVariant} className="text-[10px] py-0 px-2 rounded-full">
                                {option.badgeText}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed break-words">
                            {option.description}
                          </p>

                          {option.value === "partial_deposit" && isSelected && !isDisabledByStripe && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-3 min-w-0"
                            >
                              <Label className="text-xs font-semibold text-foreground whitespace-nowrap">
                                Deposit Percentage:
                              </Label>
                              <Controller
                                name="deposit_percentage"
                                control={control}
                                render={({ field: depositField, fieldState: depState }) => (
                                  <div className="space-y-1">
                                    <div className="relative flex items-center w-28">
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={FIELD_LIMITS.PERCENTAGE}
                                        disabled={isSaving}
                                        placeholder="20"
                                        className={cn(
                                          "h-8 text-xs pr-7 transition-colors",
                                          depositField.value != null && depositField.value !== ""
                                            ? "font-bold text-foreground"
                                            : "font-normal text-muted-foreground",
                                          "placeholder:font-normal placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]"
                                        )}
                                        value={depositField.value ?? ""}
                                        onChange={(e) => {
                                          const raw = e.target.value.replace(/[^0-9]/g, "");
                                          const val = raw === "" ? null : Number(raw);
                                          depositField.onChange(val);
                                        }}
                                      />
                                      <span className="absolute right-2.5 text-xs text-muted-foreground font-bold pointer-events-none">
                                        %
                                      </span>
                                    </div>
                                    {depState?.error && (
                                      <p className="text-[10px] text-destructive font-medium">
                                        {depState.error.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {fieldState?.error && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}
