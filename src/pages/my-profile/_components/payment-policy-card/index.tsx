import { Controller, useFormContext } from "react-hook-form";
import { Store, CreditCard, Wallet, ShieldAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
    description: "Customers can book instantly without a card and pay after their service at the salon.",
    icon: Wallet,
    badgeText: "Lowest Friction",
    badgeVariant: "secondary" as const,
  },
  {
    value: "partial_deposit",
    title: "Require Partial Deposit",
    description: "Customers pay a percentage upfront to secure their booking. Rest is paid at the salon.",
    icon: ShieldAlert,
    badgeText: "Balanced Protection",
    badgeVariant: "outline" as const,
  },
  {
    value: "full_upfront",
    title: "Require Full Payment Upfront",
    description: "Customers pay 100% online during checkout to secure their slot.",
    icon: CreditCard,
    badgeText: "Max Security",
    badgeVariant: "default" as const,
  },
];

export default function PaymentPolicyCard({ isSaving }: Readonly<PaymentPolicyCardProps>) {
  const { control } = useFormContext();

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
        <Controller
          name="allowed_payment_policies"
          control={control}
          render={({ field, fieldState }) => {
            const selectedValues: string[] = Array.isArray(field.value) ? field.value : [field.value].filter(Boolean);

            const toggleValue = (value: string) => {
              if (isSaving) return;
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
                    const isSelected = selectedValues.includes(option.value);
                    const Icon = option.icon;

                    return (
                      <div
                        key={option.value}
                        onClick={() => toggleValue(option.value)}
                        className={cn(
                          "relative flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none min-w-0 w-full overflow-hidden",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                            : "border-border/50 bg-background/50 hover:border-border hover:bg-accent/40"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleValue(option.value)}
                          disabled={isSaving}
                          className="mt-1 shrink-0"
                        />

                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <Label
                              className="font-bold text-sm text-foreground cursor-pointer flex items-center gap-2"
                            >
                              <Icon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                              {option.title}
                            </Label>
                            <Badge variant={option.badgeVariant} className="text-[10px] py-0 px-2 rounded-full">
                              {option.badgeText}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed break-words">
                            {option.description}
                          </p>

                          {option.value === "partial_deposit" && isSelected && (
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
