import { Box, Typography } from "@mui/material";
import SearchService from "./_components/search-service";

export default function Services() {
  return (
    <Box className="space-y-8 flex flex-col w-full h-full px-8">
      <Box className="flex justify-between items-start">
        <Box>
          <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
            Service Management
          </Typography>
          <Box>Create and manage your services</Box>
        </Box>
      </Box>
      <SearchService />
    </Box>
  );
}
