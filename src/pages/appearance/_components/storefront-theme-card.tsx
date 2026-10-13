import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Eye,
  Loader2,
  Check,
} from "lucide-react";
import type { StorefrontTheme } from "@/features/themes/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getStorefrontThemePreviewSrc } from "@/utils/theme-preview";

interface StorefrontThemeCardProps {
  theme: StorefrontTheme;
  isApplying: boolean;
  isPurchasing: boolean;
  onPreview: (theme: StorefrontTheme) => void;
  onApply: (themeUuid: string) => void;
  onBuy: (theme: StorefrontTheme) => void;
}

export const StorefrontThemeCard: React.FC<StorefrontThemeCardProps> = ({
  theme,
  isApplying,
  isPurchasing,
  onPreview,
  onApply,
  onBuy,
}) => {
  const priceNumber = Number(theme.price) || 0;
  const isFree = theme.is_free || priceNumber === 0;
  const formattedPrice = isFree ? "Free" : `₹${priceNumber.toLocaleString("en-IN")}`;

  const isMobile = useMediaQuery("(max-width: 639px)");
  const previewSrc = getStorefrontThemePreviewSrc(theme, isMobile);

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden bg-card/60 backdrop-blur-sm ${
        theme.is_current
          ? "border-primary/60 ring-2 ring-primary/20 shadow-lg shadow-primary/5 bg-primary/[0.02]"
          : "border-border/70 hover:border-border hover:shadow-md hover:bg-card"
      }`}
    >
      <div className="relative w-full aspect-[16/10] bg-muted/40 overflow-hidden select-none border-b border-border/50">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={theme.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/60 via-muted/30 to-background/50 p-4 text-center">
            <Sparkles className="w-8 h-8 text-primary/40 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-foreground/80">{theme.name}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Storefront Layout</span>
          </div>
        )}

        {/* Status Badge in Top Right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {theme.is_current ? (
            <Badge className="bg-emerald-500/90 text-white font-medium text-[11px] shadow-sm backdrop-blur-md border-0 gap-1 px-2.5 py-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </Badge>
          ) : !isFree && theme.is_purchased ? (
            <Badge
              variant="secondary"
              className="bg-card/90 text-foreground font-medium text-[11px] backdrop-blur-md border border-border/80 shadow-sm px-2 py-0.5"
            >
              Purchased
            </Badge>
          ) : !isFree && !theme.is_purchased ? (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 backdrop-blur-md text-[11px] font-semibold gap-1 px-2 py-0.5"
            >
              <Lock className="w-2.5 h-2.5" />
              Premium
            </Badge>
          ) : null}
        </div>

        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onPreview(theme)}
            className="h-8 px-3 text-xs font-semibold gap-1.5 shadow-md bg-card/90 hover:bg-card border border-border cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            Preview Mockup
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
              {theme.name}
            </h3>
            <span
              className={`text-xs font-mono font-bold ${
                isFree
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              }`}
            >
              {isFree ? "Free" : `${formattedPrice} (Lifetime)`}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {theme.description ||
              "Clean, modern client-facing booking experience designed to increase appointments."}
          </p>
        </div>

        {/* Actions Row */}
        <div className="pt-2 border-t border-border/40 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPreview(theme)}
            className="flex-1 sm:flex-initial h-8 px-2.5 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Button>

          {/* 3-State Action Button */}
          {theme.is_current ? (
            <Button
              type="button"
              disabled
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-not-allowed opacity-90"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Current Theme
            </Button>
          ) : theme.is_purchased ? (
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() => onApply((theme.uuid || theme.theme_uuid || theme.code) as string)}
              disabled={isApplying}
              className="flex-1 h-8 text-xs font-semibold gap-1.5 shadow-sm cursor-pointer"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply Theme
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => onBuy(theme)}
              disabled={isPurchasing}
              className="flex-1 h-8 text-xs font-bold gap-1.5 shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  Buy for {formattedPrice}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

