import { Controller, useFormContext } from "react-hook-form";
import { Store, CreditCard, Wallet, ShieldAlert } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PaymentPolicyCardProps {
  isSaving?: boolean;
}

const POLICY_OPTIONS = [
  {
    value: "pay_at_venue",
    title: "Pay at Venue (No upfront payment)",
    description: "Customers can book instantly without a card. They will pay the full amount at the salon after their service. Lowest friction, but higher risk of no-shows.",
    icon: Wallet,
    badgeText: "Lowest Friction",
    badgeVariant: "secondary" as const,
  },
  {
    value: "partial_deposit",
    title: "Require Partial Deposit",
    description: "Customers must pay a percentage of the total service cost upfront to secure their booking. The rest is paid at the salon.",
    icon: ShieldAlert,
    badgeText: "Balanced Protection",
    badgeVariant: "outline" as const,
  },
  {
    value: "full_upfront",
    title: "Require Full Payment Upfront",
    description: "Customers must pay 100% of the service cost online during checkout to secure their slot. Best for protecting your time.",
    icon: CreditCard,
    badgeText: "Max Security",
    badgeVariant: "default" as const,
  },
];

export default function PaymentPolicyCard({ isSaving }: PaymentPolicyCardProps) {
  const { control } = useFormContext();

  return (
    <Card className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Store className="w-5 h-5 text-primary" />
              Booking Payment Policy
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Choose how you want to charge customers when they book online through the app.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <Controller
          name="payment_policy"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-3"
            >
              {POLICY_OPTIONS.map((option) => {
                const isSelected = field.value === option.value;
                const Icon = option.icon;

                return (
                  <div
                    key={option.value}
                    onClick={() => !isSaving && field.onChange(option.value)}
                    className={cn(
                      "relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                        : "border-border/60 bg-background/50 hover:border-border hover:bg-accent/40"
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`policy-${option.value}`}
                      disabled={isSaving}
                      className="mt-1"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <Label
                          htmlFor={`policy-${option.value}`}
                          className="font-bold text-sm text-foreground cursor-pointer flex items-center gap-2"
                        >
                          <Icon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                          {option.title}
                        </Label>
                        <Badge variant={option.badgeVariant} className="text-[10px] py-0 px-2 rounded-full">
                          {option.badgeText}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {option.description}
                      </p>

                      {option.value === "partial_deposit" && isSelected && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 pt-3 border-t border-border/40 flex items-center gap-3"
                        >
                          <Label className="text-xs font-semibold text-foreground whitespace-nowrap">
                            Deposit Percentage:
                          </Label>
                          <Controller
                            name="deposit_percentage"
                            control={control}
                            render={({ field: depositField, fieldState }) => (
                              <div className="space-y-1">
                                <div className="relative flex items-center w-28">
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    disabled={isSaving}
                                    placeholder="20"
                                    className="h-8 text-xs pr-7 font-bold text-foreground"
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
                                {fieldState.error && (
                                  <p className="text-[10px] text-destructive font-medium">
                                    {fieldState.error.message}
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
            </RadioGroup>
          )}
        />
      </CardContent>
    </Card>
  );
}
