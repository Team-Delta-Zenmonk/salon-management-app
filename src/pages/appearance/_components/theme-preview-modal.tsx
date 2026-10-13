import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Sparkles, Check, Monitor } from "lucide-react";
import type { StorefrontTheme } from "@/features/themes/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getStorefrontThemePreviewSrc } from "@/utils/theme-preview";

interface ThemePreviewModalProps {
  theme: StorefrontTheme | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (themeUuid: string) => void;
  onBuy: (theme: StorefrontTheme) => void;
  isApplying?: boolean;
}

export const ThemePreviewModal: React.FC<ThemePreviewModalProps> = ({
  theme,
  isOpen,
  onClose,
  onApply,
  onBuy,
  isApplying = false,
}) => {
  const isMobile = useMediaQuery("(max-width: 639px)");
  if (!theme) return null;

  const priceNumber = Number(theme.price) || 0;
  const isFree = Boolean(theme.is_free) || priceNumber === 0;
  const formattedPrice = isFree ? "Free" : `₹${priceNumber.toLocaleString("en-IN")}`;
  const previewSrc = getStorefrontThemePreviewSrc(theme, isMobile);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[96vw] max-w-[1380px] sm:max-w-[96vw] lg:max-w-[1280px] xl:max-w-[1380px] h-[92dvh] sm:h-[92vh] max-h-[960px] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl"
      >
        <DialogHeader className="p-3.5 sm:p-5 sm:px-7 border-b border-border/70 bg-card/60 backdrop-blur-md shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-8 sm:pr-10">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-base sm:text-2xl font-bold tracking-tight text-foreground">
                  {theme.name}
                </DialogTitle>
                {theme.is_current ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] sm:text-xs font-semibold gap-1 px-2 sm:px-2.5 py-0.5">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Active Theme
                  </Badge>
                ) : !isFree && theme.is_purchased ? (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5">
                    Purchased
                  </Badge>
                ) : !isFree && !theme.is_purchased ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] sm:text-xs font-semibold gap-1 px-2 sm:px-2.5 py-0.5">
                    <Lock className="w-3 h-3" />
                    Premium ({formattedPrice})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5">
                    Free Included
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-[11px] sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/70 shrink-0" />
                Storefront preview mockup showing how clients experience your salon booking page.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {theme.is_current ? (
                <Button disabled size="sm" variant="outline" className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-semibold gap-1.5 opacity-90 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Currently Applied
                </Button>
              ) : theme.is_purchased || isFree ? (
                <Button
                  size="sm"
                  onClick={() => {
                    onClose();
                    onApply((theme.uuid || theme.theme_uuid || theme.code) as string);
                  }}
                  disabled={isApplying}
                  className="h-8 sm:h-10 px-3.5 sm:px-5 text-xs sm:text-sm font-semibold gap-1.5 sm:gap-2 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Apply Theme
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    onClose();
                    onBuy(theme);
                  }}
                  className="h-8 sm:h-10 px-3.5 sm:px-5 text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Buy for {formattedPrice}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 h-full overflow-y-auto overscroll-contain p-3 sm:p-6 lg:p-8 bg-muted/20">
          <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-5xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 shadow-xl bg-card">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt={theme.name}
                className="w-full h-auto object-contain block select-none transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-3 min-h-[320px]">
                <Sparkles className="w-12 h-12 text-primary/40 animate-pulse" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">Visual preview placeholder</p>
                  <p className="text-xs max-w-sm">
                    Storefront mockup will be displayed here for the <strong>{theme.name}</strong> theme.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
