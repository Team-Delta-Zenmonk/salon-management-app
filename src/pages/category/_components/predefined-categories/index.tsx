import { Box, Typography, Chip, Avatar } from "@mui/material";
import { useState } from "react";
import PredefinedCategoryDetailsDialog from "./_components/confirm-predefined-categories-dialog";
import type { PredefinedCategory } from "./predefine-categories.type";
import predefinedCategoriesData from "../predefined-categories/predefine-categories.json";

export default function PredefinedCategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState<PredefinedCategory | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleCategoryClick = (category: PredefinedCategory) => {
    setSelectedCategory(category);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <Box className="shrink-0 min-h-0 pb-6 flex flex-col gap-3">
        <Typography variant="body2" className="text-gray-600 mb-4">
          Click on any template below to view details and create a category
        </Typography>

        <Box className="flex flex-wrap gap-3">
          {predefinedCategoriesData.map((category, index) => (
            <Box
              key={category.name}
              onClick={() => handleCategoryClick(category)}
              className="flex items-center gap-1.5 pr-3 pl-1 py-1 bg-white border border-[var(--border-subtle)] rounded-xl cursor-pointer hover:border-[var(--primary-main)] hover:shadow-sm transition-all group"            >
              <Box
                className="w-6 h-6 rounded bg-[var(--primary-50)] text-[var(--primary-900)] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[var(--primary-900)] group-hover:text-white transition-colors"
              >
                {category.name.charAt(0).toUpperCase()}
              </Box>
              <Typography className="text-xs font-semibold text-[var(--primary-900)] select-none">
                {category.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {selectedCategory && (
        <PredefinedCategoryDetailsDialog open={detailsOpen} onClose={handleDetailsClose} category={selectedCategory} />
      )}
    </>
  );
}
