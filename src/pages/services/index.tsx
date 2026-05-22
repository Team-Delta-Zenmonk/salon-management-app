import { Box, Typography } from "@mui/material";
import SearchService from "./_components/search-service";
import CreateService from "./_components/create-service";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { listServicesAction } from "../../features/service/list-services/list-service.action";

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
    <Box className="flex flex-col flex-1 min-h-0 w-full">
      <Box className="flex justify-between items-start px-8 pb-6 shrink-0">
        <Box>
          <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
            Service Management
          </Typography>
          <Box>Create and manage your services</Box>
        </Box>
        <CreateService onCreatedOrUpdated={refreshServices} />
      </Box>
      <SearchService
        selectedCategoryUuid={selectedCategoryUuid}
        onCategoryChange={setSelectedCategoryUuid}
        refreshServices={refreshServices}
      />
    </Box>
  );
}
