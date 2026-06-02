import { Box, Typography, Avatar, Chip, IconButton } from "@mui/material";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PhoneOutlined, 
  EmailOutlined, 
} from "@mui/icons-material";
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
import StaffDetailsDialog from "../staff-details-dialog";

dayjs.extend(customParseFormat);

const formatDisplayDate = (date: string) => {
  const parsed = dayjs(date, "DD-MM-YYYY", true);
  if (parsed.isValid()) return parsed.format("DD MMM YYYY");
  const fallback = dayjs(date);
  if (fallback.isValid()) return fallback.format("DD MMM YYYY");
  return "—";
};

const getFullName = (staff: Staff) => `${staff.first_name} ${staff.last_name || ""}`.trim();

const getGenderChip = (gender: string) => (
  <Chip label={gender} size="small" color="primary" variant="outlined" className="capitalize h-6 text-xs" />
);

function StaffCard({
  staff,
  onClick,
  onEdit,
  onDelete,
  onAssign,
  deleteLoading,
}: {
  staff: Staff;
  onClick: () => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  onAssign: (staff: Staff) => void;
  deleteLoading: boolean;
}) {
  return (
    <Box 
      className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col cursor-pointer" 
      onClick={onClick}
    >
      <Box className="p-5">
        <Box className="flex items-center gap-4">
          <Avatar src={staff.photos?.url} alt={getFullName(staff)} sx={{ width: 64, height: 64 }} />
          <Box className="flex-1 min-w-0">
            <Typography className="text-(--primary-900) font-bold text-lg truncate capitalize">
              {getFullName(staff)}
            </Typography>
            <Typography className="text-gray-500 text-sm truncate">
              {staff.title || 'Staff Member'}
            </Typography>
            <Box className="mt-2 flex items-center gap-2">
              {getGenderChip(staff.gender)}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="px-5 pb-5 flex flex-col gap-4 flex-1">
        <Box className="grid grid-cols-1 gap-3 flex-1">
          <Box className="flex items-center gap-3">
            <Box className="w-8 h-8 flex items-center justify-center text-gray-500 shrink-0">
              <PhoneOutlined fontSize="small" />
            </Box>
            <Box className="min-w-0 flex-1">
              <Typography className="text-sm font-medium text-gray-800 truncate">{staff.phone_number}</Typography>
            </Box>
          </Box>

          {staff.email && (
            <Box className="flex items-center gap-3">
              <Box className="w-8 h-8 flex items-center justify-center text-gray-500 shrink-0">
                <EmailOutlined fontSize="small" />
              </Box>
              <Typography className="text-sm font-medium text-gray-800 truncate min-w-0 flex-1">{staff.email}</Typography>
            </Box>
          )}
        </Box>

        <Box className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-auto">
          <IconButton
            title="Assign Services"
            onClick={(e) => { e.stopPropagation(); onAssign(staff); }}
            disabled={deleteLoading}
            size="small"
          >
            <AssignmentTurnedInOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            title="Edit Staff"
            onClick={(e) => { e.stopPropagation(); onEdit(staff); }}
            disabled={deleteLoading}
            size="small"
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            title="Delete Staff"
            onClick={(e) => { e.stopPropagation(); onDelete(staff); }}
            disabled={deleteLoading}
            size="small"
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
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

  return (
    <>
      <Box className="text-(--primary-900) mb-4 font-medium text-lg">
        Staff List ({total})
      </Box>

      <InfiniteScroll
        dataLength={staffs.length}
        next={fetchMoreStaff}
        hasMore={hasMore}
        loader={
          <Box className="flex justify-center py-4 w-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </Box>
        }
        scrollableTarget="scrollableDiv"
        endMessage={
          staffs.length > 0 ? (
            <Box className="text-center py-6 w-full text-gray-500">
              <Typography variant="body2">No more staff to load</Typography>
            </Box>
          ) : null
        }
      >
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
          {staffs.map((staff) => (
            <StaffCard
              key={staff.uuid}
              staff={staff}
              onClick={() => {
                setSelectedStaff(staff);
                setDetailsDialogOpen(true);
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssign={(staff) => {
                setSelectedStaff(staff);
                setAssignOpen(true);
              }}
              deleteLoading={deleteLoading}
            />
          ))}
        </Box>
      </InfiniteScroll>

      {staffs.length === 0 && (
        <Box className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center mt-4">
          <Typography className="text-gray-500 font-medium">No staff found. Create your first staff member!</Typography>
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

      <StaffDetailsDialog 
        open={detailsDialogOpen} 
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedStaff(null);
        }} 
        staff={selectedStaff}
        onEdit={(staff) => {
          setDetailsDialogOpen(false);
          handleEdit(staff);
        }}
        onDelete={(staff) => {
          setDetailsDialogOpen(false);
          handleDelete(staff);
        }}
        onAssign={(staff) => {
          setDetailsDialogOpen(false);
          setSelectedStaff(staff);
          setAssignOpen(true);
        }}
      />
    </>
  );
}
