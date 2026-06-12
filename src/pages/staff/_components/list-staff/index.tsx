import { Box, Typography, Avatar, IconButton, CircularProgress } from "@mui/material";
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
      className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[20px] overflow-hidden flex flex-col cursor-pointer transition-all"
      onClick={onClick}
    >
      <Box className="p-6 flex items-center gap-4 border-b border-dashed border-[var(--border-subtle)] bg-[var(--surface)]">
        <Avatar src={staff.photos?.url} alt={getFullName(staff)} sx={{ width: 56, height: 56, backgroundColor: "var(--surface-muted)", color: "var(--text-primary)", fontWeight: "bold" }} />
        <Box className="min-w-0 flex-1">
          <Typography className="text-[var(--text-primary)] capitalize text-lg" fontWeight={700}>
            {getFullName(staff)}
          </Typography>
          <Typography className="text-[var(--text-muted)] text-[15px] truncate font-medium">
            {staff.title || "Staff Member"}
          </Typography>
        </Box>
      </Box>

      <Box className="p-6 flex flex-col flex-1 bg-[var(--surface)]">
        <Box className="grid grid-cols-1 gap-4 flex-1 mb-6">
          <Box className="flex items-center gap-4">
            <Box className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] shrink-0 bg-[var(--surface)] rounded-lg border border-[var(--border-subtle)]">
              <PhoneOutlined sx={{ fontSize: 16 }} />
            </Box>
            <Box className="min-w-0 flex-1">
              <Typography className="text-[15px] text-[var(--text-primary)] truncate" fontWeight={500}>{staff.phone_number}</Typography>
            </Box>
          </Box>

          {staff.email && (
            <Box className="flex items-center gap-4">
              <Box className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] shrink-0 bg-[var(--surface)] rounded-lg border border-[var(--border-subtle)]">
                <EmailOutlined sx={{ fontSize: 16 }} />
              </Box>
              <Typography className="text-[15px] text-[var(--text-primary)] truncate" fontWeight={500}>{staff.email}</Typography>
            </Box>
          )}
        </Box>

        <Box className="flex items-center justify-between mt-auto">
          <Box className="px-3 py-1.5 border border-[var(--border-subtle)] rounded-lg text-[13px] font-semibold text-[var(--text-primary)] bg-[var(--surface)]">
            {staff.gender ? staff.gender.charAt(0).toUpperCase() + staff.gender.slice(1) : "Unspecified"}
          </Box>
          <Box className="flex gap-2">
            <IconButton
              title="Assign Services"
              size="medium"
              onClick={(e) => { e.stopPropagation(); onAssign(staff); }}
              disabled={deleteLoading}
              className="text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] transition-colors rounded-xl"
            >
              <AssignmentTurnedInOutlinedIcon />
            </IconButton>
            <IconButton
              title="Edit Staff"
              size="medium"
              onClick={(e) => { e.stopPropagation(); onEdit(staff); }}
              disabled={deleteLoading}
              className="text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] transition-colors rounded-xl"
            >
              <EditOutlined />
            </IconButton>
            <IconButton
              title="Delete Staff"
              size="medium"
              onClick={(e) => { e.stopPropagation(); onDelete(staff); }}
              disabled={deleteLoading}
              className="text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--error-600)] hover:text-[var(--error-600)] transition-colors rounded-xl"
            >
              <DeleteOutlined />
            </IconButton>
          </Box>
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
      <Box className="text-[var(--text-muted)] mb-4 font-semibold text-sm uppercase tracking-wider">
        Staff Members ({total})
      </Box>

      <InfiniteScroll
        dataLength={staffs.length}
        next={fetchMoreStaff}
        hasMore={hasMore}
        loader={
          <Box className="flex justify-center py-4 w-full">
            <CircularProgress size={24} />
          </Box>
        }
        scrollableTarget="scrollableDiv"
        endMessage={
          staffs.length > 0 ? (
            <Box className="text-center py-6 w-full text-[var(--text-muted)]">
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
        <Box className="bg-[var(--surface-muted)] border border-dashed border-[var(--border-subtle)] rounded-[20px] p-10 text-center mt-4">
          <Typography className="text-[var(--text-muted)] font-medium">No staff found. Create your first staff member!</Typography>
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
