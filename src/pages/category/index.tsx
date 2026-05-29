import { Box, Typography } from "@mui/material";
import CreateCategory from "./_components/create-category";
import SearchCategories from "./_components/search-category";
import PredefinedCategoriesSection from "./_components/predefined-categories";

export default function Categories() {
  return (
    <Box className="flex flex-col flex-1 min-h-0 w-full">
      <Box className="flex flex-wrap justify-between items-center px-4 md:px-8 pb-6 shrink-0 gap-4">
        <Box>
          <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
            Categories Management
          </Typography>
          <Box>Organize and manage service categories</Box>
        </Box>
        <CreateCategory />
      </Box>
      <PredefinedCategoriesSection />
      <SearchCategories />
    </Box>
  );
}
