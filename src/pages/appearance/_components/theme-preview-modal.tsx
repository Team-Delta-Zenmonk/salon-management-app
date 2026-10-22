import React, { useState, useEffect } from "react";
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
import { getStorefrontThemeScreens } from "@/utils/theme-preview";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

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
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlideIndex(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  if (!theme) return null;

  const priceNumber = Number(theme.price) || 0;
  const isFree = Boolean(theme.is_free) || priceNumber === 0;
  const formattedPrice = isFree ? "Free" : `₹${priceNumber.toLocaleString("en-IN")}`;
  const screens = getStorefrontThemeScreens(theme, isMobile);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-screen h-screen max-w-none max-h-none rounded-none sm:w-[94vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl flex flex-col p-0 gap-0 overflow-hidden border-0 sm:border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl"
      >
        <DialogHeader className="p-3 sm:p-4 sm:px-6 border-b border-border/70 bg-card/60 backdrop-blur-md shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-8 sm:pr-10">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  {theme.name}
                </DialogTitle>
                {theme.is_current ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] sm:text-xs font-semibold gap-1 px-2 py-0.5">
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
              <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5">
                <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/70 shrink-0" />
                Storefront preview mockup showing how clients experience your salon booking page.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {theme.is_current ? (
                <Button disabled size="sm" variant="outline" className="h-8 px-3 text-xs font-semibold gap-1.5 opacity-90 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
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
                  className="h-8 px-3.5 sm:px-4 text-xs font-semibold gap-1.5 shadow-sm cursor-pointer"
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
                  className="h-8 px-3.5 sm:px-4 text-xs font-bold gap-1.5 shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  Buy for {formattedPrice}
                </Button>
              )}
            </div>
          </div>

          {screens.length > 1 && (
            <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-border/50 gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {screens.map((screen, idx) => {
                  const isActive = currentSlideIndex === idx;
                  return (
                    <button
                      key={screen.screen}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(idx)}
                      className={cn(
                        "px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer border",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {screen.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 px-2">
                {screens.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => carouselApi?.scrollTo(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                      currentSlideIndex === idx
                        ? "w-4 bg-primary"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    )}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 sm:p-5 lg:p-6 bg-muted/20 flex items-center justify-center">
          <div
            className={cn(
              "w-full mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 shadow-md bg-card relative",
              isMobile
                ? "max-w-[340px] max-h-[72dvh] aspect-[363/803] flex items-center justify-center bg-black/5 dark:bg-black/40"
                : "max-w-4xl xl:max-w-5xl aspect-[1854/967]"
            )}
          >
            {screens.length > 0 ? (
              <Carousel
                setApi={setCarouselApi}
                plugins={[
                  Autoplay({
                    delay: 4500,
                    stopOnInteraction: false,
                  }),
                ]}
                opts={{
                  loop: true,
                }}
                className="w-full h-full"
              >
                <CarouselContent className="-ml-0 h-full">
                  {screens.map((screen, idx) => (
                    <CarouselItem key={`${screen.screen}-${idx}`} className="pl-0 w-full h-full">
                      <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-card">
                        {isMobile && (
                          <img
                            src={screen.src}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-25 scale-110 pointer-events-none"
                          />
                        )}
                        <img
                          src={screen.src}
                          alt={`${theme.name} - ${screen.label}`}
                          className={cn(
                            "w-full h-full block select-none",
                            isMobile
                              ? "relative z-10 object-contain max-h-[70dvh] drop-shadow-lg p-1.5"
                              : "object-cover"
                          )}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {screens.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background border-border/80 shadow-md backdrop-blur-sm flex cursor-pointer" />
                    <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background border-border/80 shadow-md backdrop-blur-sm flex cursor-pointer" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
                <Sparkles className="w-10 h-10 text-primary/40 animate-pulse" />
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
