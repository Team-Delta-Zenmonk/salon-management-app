import { Box, Typography, Avatar, Chip, IconButton, Divider } from "@mui/material";
import { EditOutlined, DeleteOutlined, PhoneOutlined, EmailOutlined, CalendarTodayOutlined } from "@mui/icons-material";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { Staff } from "../../../../features/staff/staff.slice";
import { useAppDispatch } from "../../../../store/hooks";
import StaffDialog from "../staff-dialog";
import DeleteDialog from "../../../../components/delete-dialog";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { callSnack } from "../../../../components/snackbar";
import { removeStaffService } from "../../../../features/staff/remove-staff/remove-staff.service";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AssignServicesDialog from "../assign-services-dialog";

dayjs.extend(customParseFormat);

const formatDisplayDate = (date: string) => {
  const parsed = dayjs(date, "DD-MM-YYYY", true);
  if (parsed.isValid()) return parsed.format("DD MMM YYYY");
  const fallback = dayjs(date);
  if (fallback.isValid()) return fallback.format("DD MMM YYYY");
  return "—";
};

interface ListStaffProps {
  staffs: Staff[];
  total: number;
  hasMore: boolean;
  fetchMoreStaff: () => void;
  searchQuery: string;
}

export default function ListStaff({
  staffs,
  total,
  hasMore,
  fetchMoreStaff,
  searchQuery,
}: Readonly<ListStaffProps>) {
  const dispatch = useAppDispatch();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setEditDialogOpen(true);
  };

  const handleDelete = (staff: Staff) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;

    try {
      setDeleteLoading(true);
      await removeStaffService(selectedStaff.uuid);

      await dispatch(
        listStaffAction({
          page: 1,
          limit: 10,
          search: searchQuery.trim() || undefined,
        })
      ).unwrap();

      callSnack("Staff deleted successfully", "success");
    } catch (error: any) {
      callSnack(error?.response?.data?.message || "Failed to delete staff", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setSelectedStaff(null);
    }
  };

  const getFullName = (staff: Staff) => `${staff.first_name} ${staff.last_name || ""}`.trim();

  const getGenderChip = (gender: string) => (
    <Chip label={gender} size="small" color="primary" variant="outlined" className="capitalize" />
  );

  return (
    <>
      <Box className="text-(--primary-900) mb-4">
        Staff List ({total})
      </Box>

      <InfiniteScroll
        dataLength={staffs.length}
        next={fetchMoreStaff}
        hasMore={hasMore}
        loader={
          <Box className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </Box>
        }
        scrollableTarget="scrollableDiv"
        endMessage={
          staffs.length > 0 ? (
            <Box className="text-center py-4 text-gray-500">
              <Typography variant="body2">No more staff to load</Typography>
            </Box>
          ) : null
        }
      >
        <Box className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staffs.map((staff) => (
            <Box
              key={staff.uuid}
              className="bg-white border border-gray-200 rounded-lg p-6 w-full hover:shadow-md transition-shadow"
            >
              <Box className="flex items-start justify-between gap-4 mb-6">
                <Box className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar src={staff.photos?.url} alt={getFullName(staff)} />
                  <Box className="min-w-0 flex-1">
                    <Typography className="text-(--primary-900) truncate" fontWeight="bold">
                      {getFullName(staff)}
                    </Typography>
                    <Typography className="text-gray-600 text-sm truncate">{staff.title}</Typography>
                  </Box>
                </Box>

                <Box className="flex gap-2 shrink-0">
                  <IconButton
                    title="Assign Services"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setAssignOpen(true);
                    }}
                    disabled={deleteLoading}
                  >
                    <AssignmentTurnedInOutlinedIcon className="text-purple-800!" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEdit(staff)}
                    title="Edit Staff"
                    disabled={deleteLoading}
                  >
                    <EditOutlined className="text-(--primary-800)!" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(staff)}
                    title="Delete Staff"
                    disabled={deleteLoading}
                  >
                    <DeleteOutlined className="text-(--error-800)!" />
                  </IconButton>
                </Box>
              </Box>

              <Divider className="my-6" />

              <Box className="space-y-4 mb-6">
                <Box className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl min-w-0">
                  <PhoneOutlined className="text-xl text-gray-500 shrink-0" />
                  <Box className="min-w-0 flex-1">
                    <Typography className="fontWeightBold text-gray-900 truncate">{staff.phone_number}</Typography>
                    {staff.additional_phone_number && (
                      <Typography className="text-gray-500 text-sm truncate">{staff.additional_phone_number}</Typography>
                    )}
                  </Box>
                </Box>

                <Box className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl min-w-0">
                  <EmailOutlined className="text-xl text-gray-500 shrink-0" />
                  <Typography className="text-gray-900 font-medium truncate flex-1 min-w-0">{staff.email}</Typography>
                </Box>
              </Box>

              <Divider className="my-6" />

              <Box className="space-y-4">
                <Box className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl">
                  <Typography className="text-gray-600 text-sm font-medium">Gender</Typography>
                  {getGenderChip(staff.gender)}
                </Box>

                <Box className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl">
                  <Box className="flex items-center gap-2">
                    <CalendarTodayOutlined className="text-lg text-gray-500" />
                    <Typography className="text-gray-600 text-sm font-medium">Joined</Typography>
                  </Box>
                  <Typography className="text-gray-900 fontWeightMedium">
                    {formatDisplayDate(staff.joining_date)}
                  </Typography>
                </Box>

                {staff.end_date && (
                  <Box className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl">
                    <Typography className="text-gray-600 text-sm font-medium">End Date</Typography>
                    <Typography className="text-red-600 fontWeightMedium">
                      {formatDisplayDate(staff.end_date)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </InfiniteScroll>

      {staffs.length === 0 && (
        <Box className="bg-gray-200 border border-gray-400 rounded-lg p-8 text-center mt-4">
          <Typography>No staff found. Create your first staff member!</Typography>
        </Box>
      )}

      <StaffDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedStaff(null);
        }}
        mode="update"
        staff={selectedStaff || undefined}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedStaff(null);
        }}
        title="Delete Staff Member?"
        itemName={selectedStaff ? getFullName(selectedStaff) : ""}
        isLoading={deleteLoading}
        onDelete={handleDeleteConfirm}
      />

      {selectedStaff && (
        <AssignServicesDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          staff={selectedStaff}
          onAssigned={async () => {
            await dispatch(
              listStaffAction({
                page: 1,
                limit: 10,
                search: searchQuery.trim() || undefined,
              })
            ).unwrap();
          }}
        />
      )}
    </>
  );
}
