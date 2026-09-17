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
    <div className="w-full px-4 md:px-8 pb-8 space-y-6">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border/40 shadow-xs mb-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Staff Directory
          <span className="text-primary text-base font-medium bg-primary/10 px-2.5 py-0.5 rounded-full">
            {total}
          </span>
        </h2>
        <div className="w-full md:w-[320px]">
          <SearchBar onSearch={setSearchQuery} placeholder="Search staff members..." />
        </div>
      </div>

      <div className="flex-1 min-h-0 pt-2" id="scrollableDiv">
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
