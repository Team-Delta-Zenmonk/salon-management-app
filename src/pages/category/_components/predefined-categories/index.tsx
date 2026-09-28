import { useState, useRef, useEffect, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import PredefinedCategoryDetailsDialog from "./_components/confirm-predefined-categories-dialog";
import type { PredefinedCategory } from "./predefine-categories.type";
import predefinedCategoriesData from "../predefined-categories/predefine-categories.json";
import { Scissors, Palette, Sparkles, Hand, Brush, Flame, Flower2, Heart, LayoutGrid } from "lucide-react";

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("haircut") || n.includes("styling")) return Scissors;
  if (n.includes("color")) return Palette;
  if (n.includes("facial") || n.includes("skin")) return Sparkles;
  if (n.includes("manicure") || n.includes("pedicure") || n.includes("nail")) return Hand;
  if (n.includes("makeup") || n.includes("lash") || n.includes("brow")) return Brush;
  if (n.includes("waxing") || n.includes("hair removal")) return Flame;
  if (n.includes("massage") || n.includes("spa")) return Flower2;
  if (n.includes("bridal") || n.includes("grooming") || n.includes("package")) return Heart;
  return LayoutGrid;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const REPEATED_CATEGORIES = [
  ...predefinedCategoriesData,
  ...predefinedCategoriesData,
  ...predefinedCategoriesData,
  ...predefinedCategoriesData,
  ...predefinedCategoriesData,
  ...predefinedCategoriesData,
];
const COPIES_COUNT = 6;

export default function PredefinedCategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState<PredefinedCategory | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);
  const animFrameId = useRef<number | null>(null);

  const handleInfiniteWrap = useCallback(() => {
    const container = scrollRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const singleSetWidth = inner.scrollWidth / COPIES_COUNT;
    if (!singleSetWidth) return;

    if (container.scrollLeft <= singleSetWidth) {
      container.scrollLeft += singleSetWidth * 2;
    } else if (container.scrollLeft >= singleSetWidth * 4) {
      container.scrollLeft -= singleSetWidth * 2;
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const singleSetWidth = inner.scrollWidth / COPIES_COUNT;
    if (singleSetWidth) {
      container.scrollLeft = singleSetWidth * 2;
    }
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      const container = scrollRef.current;
      if (container && !isPaused && !isDragging.current) {
        container.scrollLeft += delta * 0.035;
        handleInfiniteWrap();
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPaused, handleInfiniteWrap]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    hasDragged.current = false;
    setIsPaused(true);
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftStart.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;

    const x = e.pageX - container.offsetLeft;
    const distance = x - startX.current;

    if (Math.abs(distance) > 5) {
      hasDragged.current = true;
    }

    container.scrollLeft = scrollLeftStart.current - distance;
    handleInfiniteWrap();
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    setIsPaused(false);
  };

  const handleScroll = () => {
    handleInfiniteWrap();
  };

  const handleCategoryClick = (category: PredefinedCategory) => {
    if (hasDragged.current) return;
    setSelectedCategory(category);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="shrink-0 px-4 md:px-8 pb-8 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Quick Templates
          </h2>
        </div>

        <div className="relative -mx-4 px-4 md:-mx-8 md:px-8">
          <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <style
            dangerouslySetInnerHTML={{
              __html: `
            .marquee-scroll::-webkit-scrollbar {
              display: none;
            }
            .marquee-scroll {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `,
            }}
          />

          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onScroll={handleScroll}
            onMouseEnter={() => setIsPaused(true)}
            className="marquee-scroll overflow-x-auto pb-4 pt-2 cursor-grab active:cursor-grabbing select-none"
          >
            <div ref={innerRef} className="flex gap-3 w-max">
              {REPEATED_CATEGORIES.map((category, index) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <button
                    key={`${category.name}-${index}`}
                    onClick={() => handleCategoryClick(category)}
                    className="group relative inline-flex items-center gap-3 rounded-full border border-border/50 bg-card/60 backdrop-blur-md px-5 py-2.5 text-sm font-medium transition-all hover:shadow-md hover:shadow-primary/5 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shrink-0"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground/90 group-hover:text-primary font-medium transition-colors select-none whitespace-nowrap">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {selectedCategory && (
        <PredefinedCategoryDetailsDialog
          open={detailsOpen}
          onClose={handleDetailsClose}
          category={selectedCategory}
        />
      )}
    </>
  );
}
