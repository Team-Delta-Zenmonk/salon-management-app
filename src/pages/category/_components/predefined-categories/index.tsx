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
      <Box className="shrink-0 min-h-0 px-8 pb-6  flex flex-col gap-3">
        <Typography variant="body2" className="text-gray-600 mb-4">
          Click on any template below to view details and create a category
        </Typography>

        <Box className="flex flex-wrap gap-3">
          {predefinedCategoriesData.map((category, index) => (
            <Chip
              key={category.name}
              label={category.name}
              onClick={() => handleCategoryClick(category)}
              variant="outlined"
              className="cursor-pointer hover:bg-gray-100 py-3"
              avatar={<Avatar alt="Natacha" src={category?.logo} />}
            />
          ))}
        </Box>
      </Box>

      {selectedCategory && (
        <PredefinedCategoryDetailsDialog open={detailsOpen} onClose={handleDetailsClose} category={selectedCategory} />
      )}
    </>
  );
}
