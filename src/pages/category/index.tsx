import { useState } from "react";
import { motion } from "framer-motion";
import CreateCategory from "./_components/create-category";
import SearchCategories from "./_components/search-category";
import PredefinedCategoriesSection from "./_components/predefined-categories";
import SearchBar from "../../components/searchbar";

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="text-muted-foreground/80 text-sm">
            Organize and manage your service categories. Choose from templates or create a custom one.
          </p>
        </div>
        <div className="shrink-0">
          <CreateCategory />
        </div>
      </motion.div>

      <div className="px-4 md:px-8 pb-4 shrink-0">
        <SearchBar onSearch={setSearchQuery} placeholder="Search Categories..." />
      </div>

      <PredefinedCategoriesSection />
      
      <SearchCategories searchQuery={searchQuery} />
    </div>
  );
}
