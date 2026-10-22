import React, { useState, useEffect } from "react";
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
import { getStorefrontThemeScreens } from "@/utils/theme-preview";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

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
  const screens = getStorefrontThemeScreens(theme, isMobile);

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

  const activeScreen = screens[currentSlideIndex] || screens[0];

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden bg-card/60 backdrop-blur-sm ${
        theme.is_current
          ? "border-primary/60 ring-2 ring-primary/20 shadow-lg shadow-primary/5 bg-primary/[0.02]"
          : "border-border/70 hover:border-border hover:shadow-md hover:bg-card"
      }`}
    >
      <div
        onClick={() => onPreview(theme)}
        className={cn(
          "relative w-full overflow-hidden select-none border-b border-border/50 bg-muted/40 cursor-pointer",
          isMobile ? "aspect-[4/5] sm:aspect-[16/10]" : "aspect-[16/10]"
        )}
      >
        {screens.length > 0 ? (
          <Carousel
            setApi={setCarouselApi}
            plugins={[
              Autoplay({
                delay: 3500,
                stopOnInteraction: false,
              }),
            ]}
            opts={{
              loop: true,
            }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full -ml-0 pointer-events-none">
              {screens.map((screen, idx) => (
                <CarouselItem key={`${screen.screen}-${idx}`} className="pl-0 w-full h-full">
                  <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-muted/30">
                    {/* Blurred ambiance backdrop on vertical mode to avoid awkward empty bars */}
                    {isMobile && (
                      <img
                        src={screen.src}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                      />
                    )}
                    <img
                      src={screen.src}
                      alt={`${theme.name} - ${screen.label}`}
                      className={cn(
                        "w-full h-full transition-transform duration-500 group-hover:scale-105 pointer-events-none",
                        isMobile
                          ? "relative z-10 object-contain p-2 max-h-full drop-shadow-md"
                          : "object-cover object-top"
                      )}
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/60 via-muted/30 to-background/50 p-4 text-center">
            <Sparkles className="w-8 h-8 text-primary/40 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-foreground/80">{theme.name}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Storefront Layout</span>
          </div>
        )}

        {/* Screen Tag & Dots in Bottom Left */}
        {screens.length > 1 && (
          <div
            className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-2 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {activeScreen?.label && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-sm transition-all duration-300">
                {activeScreen.label}
              </span>
            )}
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 shadow-sm">
              {screens.map((_, idx) => {
                const isActive = currentSlideIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      carouselApi?.scrollTo(idx);
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                      isActive
                        ? "w-4 bg-white shadow-sm ring-1 ring-white/50"
                        : "w-1.5 bg-white/40 hover:bg-white/80"
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                    title={`Slide ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Status Badge in Top Right */}
        <div className="absolute top-2.5 right-2.5 z-10" onClick={(e) => e.stopPropagation()}>
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

        {/* Tap/Hover indicator overlay */}
        <div className="absolute inset-0 bg-background/60 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center gap-2 p-4 pointer-events-none">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(theme);
            }}
            className="h-8 px-3 text-xs font-semibold gap-1.5 shadow-md bg-card/90 hover:bg-card border border-border pointer-events-auto cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            Preview Mockup
          </Button>
        </div>
      </div>

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

