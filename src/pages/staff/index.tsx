import { motion } from "framer-motion";
import CreateStaff from "./_components/create-staff";
import SearchStaff from "./_components/serach-staff";

export default function Staff() {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-background">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Staff Management
          </h1>
          <p className="text-muted-foreground/80 text-sm">
            Manage your salon's team members, roles, availability, and service assignments.
          </p>
        </div>
        <div className="shrink-0">
          <CreateStaff />
        </div>
      </motion.div>
      <SearchStaff />
    </div>
  );
}
