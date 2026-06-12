import { Box } from "@mui/material";
import CreateStaff from "./_components/create-staff";
import SearchStaff from "./_components/serach-staff";
import PageHeader from "../../components/page-header";

export default function Staff() {
  return (
    <Box className="flex flex-col flex-1 min-h-0 w-full">
      <PageHeader
        title="Staff Management"
        subtitle="Manage staff members of your salon"
        action={<CreateStaff />}
      />
      <SearchStaff />
    </Box>
  );
}
