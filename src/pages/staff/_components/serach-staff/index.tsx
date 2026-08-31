import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store/store";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { resetStaff } from "../../../../features/staff/staff.slice";
import SearchBar from "../../../../components/searchbar";
import ListStaff from "../list-staff";
import { callSnack } from "../../../../components/snackbar";
import { StaffListSkeleton } from "../staff-skeleton";

const SearchStaff = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const staffState = useSelector((state: RootState) => state.staff);
  const data = staffState?.data;
  const total = staffState?.total ?? 0;
  const page = staffState?.page ?? 1;
  const limit = staffState?.limit ?? 10;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await dispatch(listStaffAction({ page: 1, limit: 1000 })).unwrap();
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
            limit: 1000,
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

  // Default sorting alphabetically by first name
  const sortedStaff = useMemo(() => {
    const result = [...(data ?? [])];
    result.sort((a, b) => {
      const nameA = `${a.first_name} ${a.last_name ?? ""}`.trim().toLowerCase();
      const nameB = `${b.first_name} ${b.last_name ?? ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
    return result;
  }, [data]);

  const hasMore = data.length < total;

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 md:px-8 pb-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-border/10 mb-2">
        <div className="w-full md:w-[320px]">
          <SearchBar onSearch={setSearchQuery} placeholder="Search staff members..." />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" id="scrollableDiv">
        {isLoading && data.length === 0 ? (
          <div className="w-full">
            <StaffListSkeleton />
          </div>
        ) : (
          <ListStaff
            staffs={sortedStaff}
            hasMore={hasMore}
            fetchMoreStaff={fetchMoreStaff}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default SearchStaff;
