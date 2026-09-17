import { useState, useEffect, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Globe, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { checkSlugAvailability } from "@/features/salon-onboarding/check-slug/check-slug.service";
import { getStorefrontDomain } from "@/lib/domain";
import type { SalonOnboardingForm } from "@/pages/salon-onboarding/schema/salon-onboarding.schema";
import { Label } from "@/components/ui/label";

type StatusState = "idle" | "checking" | "available" | "unavailable" | "error";

export default function SlugInput() {
  const { control, setError, clearErrors, watch } = useFormContext<SalonOnboardingForm>();
  const [status, setStatus] = useState<StatusState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const currentSlug = watch("salon.slug");

  const sanitizeSlug = (value: string): string => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-/, "");
  };

  const verifySlug = useCallback(
    async (slugVal: string) => {
      const clean = slugVal.replace(/-$/, "");
      if (clean.length < 3) {
        setStatus("idle");
        setStatusMessage("");
        return;
      }

      setStatus("checking");
      setStatusMessage("Checking availability...");

      try {
        const res = await checkSlugAvailability(clean);
        if (res.available) {
          setStatus("available");
          setStatusMessage(`${clean}.${getStorefrontDomain()} is ready for your brand!`);
          clearErrors("salon.slug");
        } else {
          setStatus("unavailable");
          setStatusMessage(res.reason || "This URL is already taken");
          setError("salon.slug", {
            type: "manual",
            message: res.reason || "This URL is already taken",
          });
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Unable to verify URL availability";
        setStatus("error");
        setStatusMessage(errorMsg);
        setError("salon.slug", {
          type: "manual",
          message: errorMsg,
        });
      }
    },
    [clearErrors, setError]
  );

  useEffect(() => {
    if (!currentSlug || currentSlug.length < 3) {
      setStatus("idle");
      setStatusMessage("");
      return;
    }

    const timer = setTimeout(() => {
      verifySlug(currentSlug);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentSlug, verifySlug]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="salon-slug" className="text-sm font-medium flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-primary" />
          Storefront Subdomain URL
        </Label>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Client Facing
        </span>
      </div>

      <Controller
        name="salon.slug"
        control={control}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
          <div>
            <div
              className={`flex items-center rounded-xl border bg-background transition-all shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 ${
                error || status === "unavailable" || status === "error"
                  ? "border-destructive focus-within:border-destructive"
                  : status === "available"
                  ? "border-emerald-500/80 focus-within:border-emerald-500"
                  : "border-input hover:border-input-border-hover focus-within:border-primary"
              }`}
            >
              <div className="px-3.5 py-2.5 bg-muted/60 text-muted-foreground text-xs font-semibold select-none border-r border-border/60">
                https://
              </div>
              <input
                id="salon-slug"
                type="text"
                value={value || ""}
                onChange={(e) => {
                  const cleaned = sanitizeSlug(e.target.value);
                  onChange(cleaned);
                }}
                onBlur={onBlur}
                placeholder="your-salon"
                maxLength={50}
                autoComplete="off"
                spellCheck="false"
                data-test-id="input-salon-slug"
                className="flex-1 bg-transparent px-3 py-2 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
              />
              <div className="px-3.5 py-2.5 bg-muted/60 text-muted-foreground text-xs font-semibold select-none border-l border-border/60">
                .{getStorefrontDomain()}
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              {status === "checking" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Checking availability...</span>
                </div>
              )}

              {status === "available" && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {(status === "unavailable" || status === "error" || error) && (
                <div className="flex items-center gap-2 text-xs text-destructive font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error?.message || statusMessage}</span>
                </div>
              )}

              {value && value.length >= 3 && status !== "unavailable" && (
                <div className="mt-2.5 p-3 rounded-lg bg-primary/5 border border-primary/15 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground truncate">
                      Storefront preview:{" "}
                      <span className="font-semibold text-foreground">
                        https://{value}.{getStorefrontDomain()}
                      </span>
                    </span>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    Instant Live
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
}
