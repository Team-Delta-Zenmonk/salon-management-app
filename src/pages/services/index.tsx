import { Box, Typography } from "@mui/material";
import CreateService from "./_components/create-service";
import SearchService from "./_components/search-service";

export default function Services() {
  return (
    <Box className="space-y-8 flex flex-col w-full h-full px-8">
      <Box className="flex justify-between items-start">
        <Box>
          <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
            Service Management
          </Typography>
          <Box>Create and manage your categories</Box>
        </Box>
        <CreateService />
      </Box>
      <SearchService />
    </Box>
  );
}
