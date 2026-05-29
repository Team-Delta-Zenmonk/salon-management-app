import { Box, Typography } from "@mui/material";
import CreateStaff from "./_components/create-staff";
import SearchStaff from "./_components/serach-staff";

export default function Staff() {
  return (
    <Box className="flex flex-col flex-1 min-h-0 w-full">
      <Box className="flex flex-wrap justify-between items-center px-4 md:px-8 pb-6 shrink-0 gap-4">
        <Box>
          <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
            Staff Management
          </Typography>
          <Box>Manage staff members of your salon</Box>
        </Box>
        <CreateStaff />
      </Box>
      <SearchStaff />
    </Box>
  );
}
