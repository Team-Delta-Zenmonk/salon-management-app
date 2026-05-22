import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store/store";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { resetStaff } from "../../../../features/staff/staff.slice";
import SearchBar from "../../../../components/searchbar";
import ListStaff from "../list-staff";
import { callSnack } from "../../../../components/snackbar";

const SearchStaff = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const staffState = useSelector((state: RootState) => state.staff);
  const data = staffState?.data ?? [];
  const total = staffState?.total ?? 0;
  const page = staffState?.page ?? 1;
  const limit = staffState?.limit ?? 10;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await dispatch(listStaffAction({ page: 1, limit: 10 })).unwrap();
      } catch {
        callSnack("Failed to fetch staff", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [dispatch]);

  useEffect(() => {
    const trimmedSearch = searchQuery.trim();

    const fetchSearchResults = async () => {
      dispatch(resetStaff());
      setIsLoading(true);
      try {
        await dispatch(
          listStaffAction({
            page: 1,
            limit: 10,
            search: trimmedSearch || undefined,
          })
        ).unwrap();
      } catch {
        callSnack("Failed to search staff", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSearchResults();
  }, [searchQuery, dispatch]);

  const fetchMoreStaff = useCallback(async () => {
    try {
      await dispatch(
        listStaffAction({
          page: page + 1,
          limit: limit,
          search: searchQuery.trim() || undefined,
        })
      ).unwrap();
    } catch {
      callSnack("Failed to load more staff", "error");
    }
  }, [dispatch, page, limit, searchQuery]);

  const hasMore = data.length < total;

  return (
    <Box className="flex flex-col flex-1 min-h-0 px-8 pb-8 space-y-6">
      <Box>
        <SearchBar onSearch={setSearchQuery} placeholder="Search Staff" />
      </Box>

      <Box className="flex-1 min-h-0 overflow-y-auto" id="scrollableDiv">
        {isLoading && data.length === 0 ? (
          <Box className="flex items-center justify-center h-full">
            <CircularProgress />
          </Box>
        ) : (
          <ListStaff
            staffs={data}
            total={total}
            hasMore={hasMore}
            fetchMoreStaff={fetchMoreStaff}
            searchQuery={searchQuery}
          />
        )}
      </Box>
    </Box>
  );
};

export default SearchStaff;
