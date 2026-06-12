import { Box } from "@mui/material";
import CreateCategory from "./_components/create-category";
import SearchCategories from "./_components/search-category";
import PredefinedCategoriesSection from "./_components/predefined-categories";
import PageHeader from "../../components/page-header";

export default function Categories() {
  return (
    <Box className="flex flex-col flex-1 min-h-0 w-full">
      <PageHeader
        title="Categories Management"
        subtitle="Organize and manage service categories"
        action={<CreateCategory />}
      />
      <PredefinedCategoriesSection />
      <SearchCategories />
    </Box>
  );
}
