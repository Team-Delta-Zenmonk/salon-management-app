import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { Staff, StaffActiveHours } from "../../../../features/staff/staff.slice";
import { useAppDispatch } from "../../../../store/hooks";
import StaffDialog from "../staff-dialog";
import DeleteDialog from "../../../../components/delete-dialog";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { callSnack } from "../../../../components/snackbar";
import { removeStaffService } from "../../../../features/staff/remove-staff/remove-staff.service";
import AssignServicesDialog from "../assign-services-dialog";
import StaffDetailsDialog from "../staff-details-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Pencil, Trash2, Phone, Mail, ClipboardCheck, Loader2, Users } from "lucide-react";
import { motion, type Variants } from "framer-motion";

dayjs.extend(customParseFormat);

const getFullName = (staff: Staff) => `${staff.first_name} ${staff.last_name || ""}`.trim();

const getGenderBadge = (gender: string) => (
  <Badge variant="outline" className="capitalize text-[10px] font-medium px-2 py-0.5 rounded bg-muted/40 border-border/40 text-muted-foreground select-none">
    {gender}
  </Badge>
);

const getTodayShift = (activeHours?: StaffActiveHours | null) => {
  if (!activeHours) return "Off Today";
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayName = dayNames[dayjs().day()];
  const todayHours = activeHours[todayName];
  if (!todayHours || !todayHours.start_time || !todayHours.end_time) {
    return "Off Today";
  }
  return `${todayHours.start_time} - ${todayHours.end_time}`;
};

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
  const initials = staff.first_name?.charAt(0).toUpperCase() || "S";
  const isActive = !staff.end_date || dayjs(staff.end_date, "DD-MM-YYYY").isAfter(dayjs());

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group relative bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between cursor-pointer h-full min-h-[290px] overflow-hidden"
      onClick={onClick}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        {/* Header section with photo, name & role */}
        <div className="flex gap-4 items-start relative z-10">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Avatar className="w-14 h-14 rounded-2xl ring-2 ring-primary/10 group-hover:border-primary/40 group-hover:shadow-lg transition-all duration-300 relative z-10 shrink-0 overflow-hidden">
              <AvatarImage src={staff.photos?.url || undefined} alt={getFullName(staff)} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors truncate capitalize">
                {getFullName(staff)}
              </h3>
              {/* Pulsing Active/Inactive Status badge */}
              {isActive ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0" title="Inactive" />
              )}
            </div>
            <p className="text-muted-foreground/80 text-sm mt-1 truncate capitalize">
              {staff.title || "Staff Member"}
            </p>
          </div>
        </div>

        {/* Detailed Grid Info */}
        <div className="grid grid-cols-1 gap-2 mt-4 text-[11px] text-muted-foreground bg-muted/5 border border-border/30 rounded-2xl p-3" onClick={(e) => e.stopPropagation()}>
          {staff.email ? (
            <a
              href={`mailto:${staff.email}`}
              className="flex items-center gap-2 truncate hover:text-primary transition-colors group/email"
            >
              <Mail className="w-3.5 h-3.5 text-muted-foreground/60 group-hover/email:text-primary transition-colors shrink-0" />
              <span className="truncate text-foreground/80 font-medium group-hover/email:underline">
                {staff.email}
              </span>
            </a>
          ) : (
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span className="truncate italic text-muted-foreground/50">No Email</span>
            </div>
          )}

          <a
            href={`tel:${staff.phone_number}`}
            className="flex items-center gap-2 truncate hover:text-primary transition-colors group/phone"
          >
            <Phone className="w-3.5 h-3.5 text-muted-foreground/60 group-hover/phone:text-primary transition-colors shrink-0" />
            <span className="truncate text-foreground/80 font-medium group-hover/phone:underline">
              {staff.phone_number}
            </span>
          </a>

          <div className="flex items-center gap-2 truncate pt-1.5 border-t border-border/10">
            <span className="font-bold text-foreground/60 shrink-0">Joined:</span>
            <span className="text-foreground/80 font-medium">
              {staff.joining_date ? dayjs(staff.joining_date, "DD-MM-YYYY").format("DD MMM YYYY") : "—"}
            </span>
            <span className="mx-1 text-border">•</span>
            {getGenderBadge(staff.gender)}
          </div>
        </div>

        {/* Today shift badge */}
        <div className="mt-3 relative z-10">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 rounded-2xl p-2.5">
            <span className="font-semibold text-foreground/80 select-none">Today's Shift:</span>
            <span className="font-medium text-primary">{getTodayShift(staff.active_hours)}</span>
          </div>
        </div>
      </div>

      {/* Footer Area with quick actions */}
      <div className="mt-5 pt-3.5 border-t border-border/40 flex items-center gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 rounded-full hover:bg-green-500/10 hover:text-green-600 border-border/50 text-muted-foreground transition-all gap-1 px-2 shadow-xs"
          onClick={() => onAssign(staff)}
          disabled={deleteLoading}
          title="Assign Services"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-green-600" />
          <span className="text-[11px] font-semibold">Assign</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 rounded-full hover:bg-purple-500/10 hover:text-purple-600 border-border/50 text-muted-foreground transition-all gap-1 px-2 shadow-xs"
          onClick={() => onEdit(staff)}
          disabled={deleteLoading}
          title="Edit Profile"
        >
          <Pencil className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-[11px] font-semibold">Edit</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 rounded-full hover:bg-destructive/10 hover:text-destructive border-border/50 text-muted-foreground transition-all gap-1 px-2 shadow-xs"
          onClick={() => onDelete(staff)}
          disabled={deleteLoading}
          title="Delete Staff"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
          <span className="text-[11px] font-semibold">Delete</span>
        </Button>
      </div>
    </motion.div>
  );
}

interface ListStaffProps {
  staffs: Staff[];
  hasMore: boolean;
  fetchMoreStaff: () => void;
  searchQuery: string;
}

export default function ListStaff({
  staffs,
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
          limit: 1000,
          search: searchQuery.trim() || undefined,
        })
      ).unwrap();

      callSnack("Staff deleted successfully", "success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      callSnack(error?.response?.data?.message || "Failed to delete staff", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setSelectedStaff(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Staff Directory
          <span className="text-primary text-base font-medium bg-primary/10 px-2.5 py-0.5 rounded-full">
            {staffs.length}
          </span>
        </h2>
      </div>

      <InfiniteScroll
        dataLength={staffs.length}
        next={fetchMoreStaff}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
          </div>
        }
        scrollableTarget="scrollableDiv"
        endMessage={
          staffs.length > 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm flex items-center justify-center gap-2">
              <div className="w-12 h-px bg-border/50"></div>
              End of list
              <div className="w-12 h-px bg-border/50"></div>
            </div>
          ) : null
        }
      >
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20 p-1"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
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
        </motion.div>
      </InfiniteScroll>

      {staffs.length === 0 && (
        <div className="bg-card/40 border border-dashed border-border/50 rounded-3xl p-12 flex flex-col items-center justify-center mt-4">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No staff members found</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            We couldn't find any team members matching your current filters. Try adding a new staff member or clearing the search fields.
          </p>
        </div>
      )}

      {selectedStaff && editDialogOpen && (
        <StaffDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedStaff(null);
          }}
          mode="update"
          staff={selectedStaff}
        />
      )}

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

      {selectedStaff && assignOpen && (
        <AssignServicesDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          staff={selectedStaff}
          onAssigned={async () => {
            await dispatch(
              listStaffAction({
                page: 1,
                limit: 1000,
                search: searchQuery.trim() || undefined,
              })
            ).unwrap();
          }}
        />
      )}

      {detailsDialogOpen && selectedStaff && (
        <StaffDetailsDialog 
          open={detailsDialogOpen} 
          onClose={() => {
            setDetailsDialogOpen(false);
            setSelectedStaff(null);
          }} 
          staff={selectedStaff}
        />
      )}
    </>
  );
}
