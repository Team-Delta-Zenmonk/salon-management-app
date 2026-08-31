import SearchService from "./_components/search-service";
import CreateService from "./_components/create-service";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import { motion } from "framer-motion";

const ALL_CATEGORIES_VALUE = "all";

export default function Services() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState(ALL_CATEGORIES_VALUE);

  const refreshServices = useCallback(
    async (cb?: () => void) => {
      if (selectedCategoryUuid === ALL_CATEGORIES_VALUE) {
        await dispatch(listServicesAction({}));
      } else {
        await dispatch(listServicesAction({ category_uuid: selectedCategoryUuid }));
      }
      cb?.();
    },
    [dispatch, selectedCategoryUuid]
  );

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
            Services
          </h1>
          <p className="text-muted-foreground/80 text-sm">
            Create, organize, and manage your salon's services, pricing, and staff.
          </p>
        </div>
        <div className="shrink-0">
          <CreateService onCreatedOrUpdated={refreshServices} />
        </div>
      </motion.div>
      <SearchService
        selectedCategoryUuid={selectedCategoryUuid}
        onCategoryChange={setSelectedCategoryUuid}
        refreshServices={refreshServices}
      />
    </div>
  );
}

