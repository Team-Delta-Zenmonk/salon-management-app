import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../../store/store";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import SearchBar from "../../../../components/searchbar";
import ListStaff from "../list-staff";

const SearchStaff = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const staffs = useSelector((state: RootState) => state.staff.staffs) ?? [];

  useEffect(() => {
    dispatch(listStaffAction());
  }, [dispatch]);

  const filteredStaffs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return staffs;

    return staffs.filter(
      (s) =>
        `${s.first_name} ${s.last_name || ""}`.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone_number.includes(q)
    );
  }, [staffs, searchQuery]);

  return (
    <Box className="flex flex-col flex-1 min-h-0 px-8 pb-8 space-y-6">
      <Box>
        <SearchBar onSearch={setSearchQuery} placeholder="Search Staff" />
      </Box>
      <Box className="flex-1 min-h-0 overflow-y-auto">
        <ListStaff staffs={filteredStaffs} />
      </Box>
    </Box>
  );
};

export default SearchStaff;
