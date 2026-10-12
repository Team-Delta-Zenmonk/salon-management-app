import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Store, Sparkles, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callSnack } from "@/components/snackbar";
import { useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";
import {
  getStorefrontThemesService,
  activateStorefrontThemeService,
  createThemePaymentIntentService,
  type StorefrontTheme,
} from "@/features/themes";
import { StorefrontThemeCard } from "./storefront-theme-card";
import { ThemePreviewModal } from "./theme-preview-modal";
import { ThemeCheckoutModal } from "./theme-checkout-modal";

export const StorefrontThemesSection: React.FC = () => {
  const salon = useAppSelector((state: RootState) => state.auth.salon);
  const [themes, setThemes] = useState<StorefrontTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction states
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<StorefrontTheme | null>(null);

  // Purchase states
  const [purchasingTheme, setPurchasingTheme] = useState<StorefrontTheme | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);

  const fetchThemes = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const data = await getStorefrontThemesService();
      setThemes(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load storefront themes";
      setError(msg);
      if (!quiet) {
        callSnack(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // Flow A: Apply an owned / free theme
  const handleApplyTheme = async (themeUuid: string) => {
    setApplyingCode(themeUuid);
    try {
      await activateStorefrontThemeService(themeUuid);
      callSnack("Theme updated successfully! Changes will be reflected shortly on your storefront.", "success");
      await fetchThemes(true);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to activate storefront theme";
      callSnack(message, "error");
    } finally {
      setApplyingCode(null);
    }
  };

  // Flow B: Start purchase flow for a premium locked theme
  const handleStartPurchase = async (theme: StorefrontTheme) => {
    // Guard: Prevent triggering payment flow if already purchased or current
    if (theme.is_purchased || theme.is_current) {
      callSnack("You already own this theme. You can activate it directly.", "info");
      return;
    }

    const uuid = theme.uuid || theme.theme_uuid || theme.code;
    if (!uuid) {
      callSnack("Theme identifier is missing.", "error");
      return;
    }

    setIsPreparingCheckout(true);
    setPurchasingTheme(theme);
    try {
      const res = await createThemePaymentIntentService(uuid);
      if (!res.clientSecret) {
        throw new Error("Missing client secret from payment provider");
      }
      setClientSecret(res.clientSecret);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to initiate payment for theme";
      callSnack(message, "error");
      setPurchasingTheme(null);
      setClientSecret(null);
    } finally {
      setIsPreparingCheckout(false);
    }
  };

  const handlePurchaseSuccess = async () => {
    const purchasedName = purchasingTheme?.name || "Theme";
    callSnack(`Theme "${purchasedName}" purchased successfully!.`, "success");
    setPurchasingTheme(null);
    setClientSecret(null);
    await fetchThemes(true);
  };

  return (
    <div className="w-full space-y-5 pt-8 border-t border-border/60">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Store className="h-4 w-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Choose Your Storefront Theme
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            This is how your clients will see and experience your salon online. Select, preview, and activate your brand’s storefront layout.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchThemes(false)}
          disabled={loading}
          className="rounded-full px-3.5 h-8 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Themes
        </Button>
      </div>

      {/* Content State: Loading, Error, or Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border/60 p-4 space-y-3 bg-card/40 animate-pulse"
            >
              <div className="w-full aspect-[16/10] bg-muted/60 rounded-xl" />
              <div className="space-y-2 pt-1">
                <div className="h-4 bg-muted/80 rounded w-1/2" />
                <div className="h-3 bg-muted/50 rounded w-3/4" />
              </div>
              <div className="pt-2 flex gap-2">
                <div className="h-8 bg-muted/60 rounded flex-1" />
                <div className="h-8 bg-muted/60 rounded flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Failed to load storefront themes</p>
            <p className="text-xs text-muted-foreground max-w-md">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchThemes(false)}
            className="text-xs h-8 px-4"
          >
            Try Again
          </Button>
        </div>
      ) : themes.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card/40 p-10 flex flex-col items-center justify-center text-center space-y-2">
          <Sparkles className="w-8 h-8 text-muted-foreground/60" />
          <p className="text-sm font-semibold text-foreground">No storefront themes available</p>
          <p className="text-xs text-muted-foreground">Check back later for new storefront designs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {themes.map((theme) => {
            const themeKey = (theme.uuid || theme.theme_uuid || theme.code || theme.id || theme.name) as string;
            const themeUuid = (theme.uuid || theme.theme_uuid || theme.code) as string;
            return (
              <StorefrontThemeCard
                key={themeKey}
                theme={theme}
                isApplying={applyingCode === themeUuid}
                isPurchasing={isPreparingCheckout && (purchasingTheme?.uuid || purchasingTheme?.theme_uuid || purchasingTheme?.code) === themeUuid}
                onPreview={(t) => setPreviewTheme(t)}
                onApply={handleApplyTheme}
                onBuy={handleStartPurchase}
              />
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <ThemePreviewModal
        theme={previewTheme}
        isOpen={!!previewTheme}
        onClose={() => setPreviewTheme(null)}
        onApply={handleApplyTheme}
        onBuy={handleStartPurchase}
        isApplying={applyingCode === previewTheme?.code}
      />

      {/* Stripe Payment Checkout Modal */}
      <ThemeCheckoutModal
        theme={purchasingTheme}
        clientSecret={clientSecret}
        isOpen={!!purchasingTheme && !!clientSecret}
        onClose={() => {
          setPurchasingTheme(null);
          setClientSecret(null);
        }}
        onSuccess={handlePurchaseSuccess}
        salonName={salon?.name}
      />
    </div>
  );
};

