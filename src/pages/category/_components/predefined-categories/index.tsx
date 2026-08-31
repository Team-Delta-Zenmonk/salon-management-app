import { useState, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import PredefinedCategoryDetailsDialog from "./_components/confirm-predefined-categories-dialog";
import type { PredefinedCategory } from "./predefine-categories.type";
import predefinedCategoriesData from "../predefined-categories/predefine-categories.json";
import { Scissors, Palette, Sparkles, Hand, Brush, Flame, Flower2, Heart, LayoutGrid, ChevronRight, ChevronLeft } from "lucide-react";

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
      staggerChildren: 0.05
    }
  }
};

export default function PredefinedCategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState<PredefinedCategory | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (category: PredefinedCategory) => {
    setSelectedCategory(category);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedCategory(null);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="shrink-0 px-4 md:px-8 pb-8 flex flex-col gap-5 overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Quick Templates</h2>
        </div>

        <div className="relative -mx-4 px-4 md:-mx-8 md:px-8">
          {/* Gradient Masks for smooth fading edges */}
          <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Marquee Animation Styles */}
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 35s linear infinite;
              display: flex;
              width: max-content;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}} />

          <div className="overflow-hidden pb-4 pt-2">
            <div className="animate-marquee gap-3">
              {/* Duplicate the array to create a seamless loop effect */}
              {[...predefinedCategoriesData, ...predefinedCategoriesData].map((category, index) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <button
                    key={`${category.name}-${index}`}
                    onClick={() => handleCategoryClick(category)}
                    className="group relative inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-5 py-2.5 text-sm font-medium transition-all hover:shadow-md hover:shadow-primary/5 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shrink-0"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground/90 group-hover:text-primary font-medium transition-colors select-none whitespace-nowrap">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {selectedCategory && (
        <PredefinedCategoryDetailsDialog open={detailsOpen} onClose={handleDetailsClose} category={selectedCategory} />
      )}
    </>
  );
}
