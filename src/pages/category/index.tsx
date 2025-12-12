import { Box, Typography } from "@mui/material";
import CreateCategory from "./_components/create-category";
import SearchCategories from "./_components/search-category";

export default function Categories() {
  return (
    <Box className="space-y-8 flex flex-col w-full h-full px-8">
      <Box className="flex justify-between items-start">
        <Box>
          <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
            Categories Management
          </Typography>
          <Box>Organize and manage service categories</Box>
        </Box>
        <CreateCategory />
      </Box>
      <Box>
        <SearchCategories />
      </Box>
    </Box>
  );
}
