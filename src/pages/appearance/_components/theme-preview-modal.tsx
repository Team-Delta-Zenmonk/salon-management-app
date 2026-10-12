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
import { CheckCircle2, Lock, Sparkles, ExternalLink } from "lucide-react";
import type { StorefrontTheme } from "@/features/themes/types";

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
  if (!theme) return null;

  const priceNumber = Number(theme.price) || 0;
  const formattedPrice = `₹${priceNumber.toLocaleString("en-IN")}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-border/80 shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 bg-card/60 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {theme.name}
                </DialogTitle>
                {theme.is_current ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Active Theme
                  </Badge>
                ) : !theme.is_free && priceNumber > 0 && theme.is_purchased ? (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px] font-semibold">
                    Purchased
                  </Badge>
                ) : !theme.is_free && priceNumber > 0 && !theme.is_purchased ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] font-semibold gap-1">
                    <Lock className="w-3 h-3" />
                    Premium ({formattedPrice})
                  </Badge>
                ) : null}
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Preview how your storefront looks to clients when this theme is active.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              {theme.is_current ? (
                <Button disabled size="sm" variant="outline" className="h-9 px-4 text-xs font-semibold gap-1.5 opacity-80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Currently Applied
                </Button>
              ) : theme.is_purchased ? (
                <Button
                  size="sm"
                  onClick={() => {
                    onClose();
                    onApply((theme.uuid || theme.theme_uuid || theme.code) as string);
                  }}
                  disabled={isApplying}
                  className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply Theme
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    onClose();
                    onBuy(theme);
                  }}
                  className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Buy for {formattedPrice}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20">
          <div className="rounded-xl overflow-hidden border border-border/80 shadow-inner bg-card flex flex-col items-center justify-center min-h-[360px]">
            {theme.preview_image ? (
              <img
                src={theme.preview_image}
                alt={theme.name}
                className="w-full h-auto object-cover max-h-[620px] transition-all"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-3">
                <Sparkles className="w-12 h-12 text-primary/40 animate-pulse" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">Visual preview placeholder</p>
                  <p className="text-xs max-w-sm">
                    High-definition storefront mockup will be displayed here for the <strong>{theme.name}</strong> theme.
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

